"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient as defaultApiClient, ApiClient, AppError } from "@/lib/api-client";

export type HttpMethod = "POST" | "PUT" | "PATCH" | "DELETE";

export interface QueuedRequestItem {
  id: string;
  idempotencyKey: string;
  url: string;
  method: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  createdAt: string;
  attempts: number;
  lastAttemptAt?: string;
  nextRetryAt?: number;
  status: "pending" | "processing" | "failed" | "completed";
  error?: string;
}

export interface EnqueueRequestInput {
  url: string;
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  idempotencyKey?: string;
}

export interface UseOfflineQueueOptions {
  storageKey?: string;
  baseDelayMs?: number;
  maxDelayMs?: number;
  maxAttempts?: number;
  autoProcessOnOnline?: boolean;
  apiClientInstance?: ApiClient;
  onSuccess?: (item: QueuedRequestItem, response: unknown) => void;
  onError?: (item: QueuedRequestItem, error: Error) => void;
}

// In-memory fallback if localStorage is unavailable
let inMemoryStorage: Record<string, string> = {};

function safeGetStorage(key: string): string | null {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // Fallback to memory
  }
  return inMemoryStorage[key] ?? null;
}

function safeSetStorage(key: string, value: string): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
  } catch {
    // Fallback to memory
  }
  inMemoryStorage[key] = value;
}

export function useOfflineQueue(options: UseOfflineQueueOptions = {}) {
  const {
    storageKey = "gs_offline_queue_v1",
    baseDelayMs = 1000,
    maxDelayMs = 30000,
    maxAttempts = 5,
    autoProcessOnOnline = true,
    apiClientInstance = defaultApiClient,
    onSuccess,
    onError,
  } = options;

  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      return navigator.onLine;
    }
    return true;
  });

  const [queue, setQueue] = useState<QueuedRequestItem[]>(() => {
    const raw = safeGetStorage(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        // Corrupted queue, ignore
      }
    }
    return [];
  });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const processingLockRef = useRef<boolean>(false);

  // Persist queue helper
  const persistQueue = useCallback(
    (newQueue: QueuedRequestItem[]) => {
      setQueue(newQueue);
      safeSetStorage(storageKey, JSON.stringify(newQueue));
    },
    [storageKey],
  );

  // Process queue function with exponential backoff and X-Idempotency-Key header
  const processQueue = useCallback(async (): Promise<{
    processed: number;
    succeeded: number;
    failed: number;
  }> => {
    if (processingLockRef.current) {
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    // Only process if browser is currently online
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    processingLockRef.current = true;
    setIsProcessing(true);

    let processedCount = 0;
    let succeededCount = 0;
    let failedCount = 0;

    try {
      const currentRaw = safeGetStorage(storageKey);
      let items: QueuedRequestItem[] = [];
      if (currentRaw) {
        try {
          items = JSON.parse(currentRaw);
        } catch {
          items = [];
        }
      }

      const now = Date.now();
      const updatedQueue: QueuedRequestItem[] = [];

      for (const item of items) {
        // Skip items that have exhausted maxAttempts or have nextRetryAt in the future
        if (item.status === "completed") {
          continue;
        }

        if (item.status === "failed" && item.attempts >= maxAttempts) {
          updatedQueue.push(item);
          continue;
        }

        if (item.nextRetryAt && item.nextRetryAt > now) {
          updatedQueue.push(item);
          continue;
        }

        processedCount++;

        const requestHeaders: Record<string, string> = {
          ...(item.headers || {}),
          "X-Idempotency-Key": item.idempotencyKey,
        };

        try {
          let response: unknown;
          const method = item.method.toUpperCase();

          if (method === "POST") {
            response = await apiClientInstance.post(item.url, item.body, {
              headers: requestHeaders,
            });
          } else if (method === "PUT") {
            response = await apiClientInstance.put(item.url, item.body, {
              headers: requestHeaders,
            });
          } else if (method === "PATCH") {
            response = await apiClientInstance.patch(item.url, item.body, {
              headers: requestHeaders,
            });
          } else if (method === "DELETE") {
            response = await apiClientInstance.delete(item.url, { headers: requestHeaders });
          } else {
            response = await apiClientInstance.get(item.url, { headers: requestHeaders });
          }

          succeededCount++;
          if (onSuccess) {
            onSuccess(item, response);
          }
          // Completed item is omitted from the pending active queue
        } catch (err: unknown) {
          failedCount++;
          const errorInstance = err instanceof Error ? err : new Error(String(err));
          const nextAttempts = item.attempts + 1;
          // Exponential backoff: baseDelay * 2^attempts with jitter
          const jitter = Math.random() * 200;
          const backoffDelay =
            Math.min(maxDelayMs, baseDelayMs * Math.pow(2, nextAttempts)) + jitter;
          const isFinalFailure = nextAttempts >= maxAttempts;

          const updatedItem: QueuedRequestItem = {
            ...item,
            attempts: nextAttempts,
            lastAttemptAt: new Date().toISOString(),
            nextRetryAt: Date.now() + backoffDelay,
            status: isFinalFailure ? "failed" : "pending",
            error: errorInstance.message,
          };

          updatedQueue.push(updatedItem);

          if (onError) {
            onError(updatedItem, errorInstance);
          }
        }
      }

      persistQueue(updatedQueue);
    } finally {
      processingLockRef.current = false;
      setIsProcessing(false);
    }

    return {
      processed: processedCount,
      succeeded: succeededCount,
      failed: failedCount,
    };
  }, [
    storageKey,
    maxAttempts,
    maxDelayMs,
    baseDelayMs,
    apiClientInstance,
    onSuccess,
    onError,
    persistQueue,
  ]);

  // Network listener & auto-process on reconnect
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setIsOnline(true);
      if (autoProcessOnOnline) {
        processQueue();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [autoProcessOnOnline, processQueue]);

  // Enqueue new request
  const enqueueRequest = useCallback(
    async (input: EnqueueRequestInput): Promise<string> => {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const idempotencyKey =
        input.idempotencyKey ||
        (typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `idem-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);

      const newItem: QueuedRequestItem = {
        id,
        idempotencyKey,
        url: input.url,
        method: input.method || "POST",
        body: input.body,
        headers: input.headers,
        createdAt: new Date().toISOString(),
        attempts: 0,
        status: "pending",
      };

      const currentRaw = safeGetStorage(storageKey);
      let currentItems: QueuedRequestItem[] = [];
      if (currentRaw) {
        try {
          currentItems = JSON.parse(currentRaw);
        } catch {
          currentItems = [];
        }
      }

      const nextQueue = [...currentItems, newItem];
      persistQueue(nextQueue);

      // If online, trigger background process
      if (typeof navigator !== "undefined" && navigator.onLine) {
        // Asynchronously process without blocking
        setTimeout(() => {
          processQueue();
        }, 10);
      }

      return idempotencyKey;
    },
    [storageKey, persistQueue, processQueue],
  );

  // Remove individual item
  const removeItem = useCallback(
    (id: string) => {
      const nextQueue = queue.filter((item) => item.id !== id);
      persistQueue(nextQueue);
    },
    [queue, persistQueue],
  );

  // Clear entire queue
  const clearQueue = useCallback(() => {
    persistQueue([]);
  }, [persistQueue]);

  // Manual retry for a failed item
  const retryItem = useCallback(
    async (id: string) => {
      const updatedQueue = queue.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            attempts: 0,
            status: "pending" as const,
            nextRetryAt: undefined,
            error: undefined,
          };
        }
        return item;
      });
      persistQueue(updatedQueue);
      return processQueue();
    },
    [queue, persistQueue, processQueue],
  );

  const pendingCount = queue.filter((i) => i.status === "pending").length;
  const failedCount = queue.filter((i) => i.status === "failed").length;
  const failedItems = queue.filter((i) => i.status === "failed");

  return {
    isOnline,
    queue,
    pendingCount,
    failedCount,
    failedItems,
    isProcessing,
    enqueueRequest,
    processQueue,
    retryItem,
    removeItem,
    clearQueue,
  };
}
