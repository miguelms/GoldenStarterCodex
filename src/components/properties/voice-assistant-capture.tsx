"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Upload, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { PropertyCreateInput } from "@starter/contracts";

interface VoiceAssistantCaptureProps {
  currentValues: Partial<PropertyCreateInput>;
  onApplyVoiceData: (
    updatedFields: Partial<PropertyCreateInput>,
    rawAudioKey: string,
    transcriptionText: string
  ) => void;
}

type RecordingState = "idle" | "recording" | "uploading" | "transcribing" | "success" | "error";

export function VoiceAssistantCapture({
  currentValues,
  onApplyVoiceData,
}: VoiceAssistantCaptureProps) {
  const [state, setState] = useState<RecordingState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcription, setTranscription] = useState<string>("");
  const [extractedData, setExtractedData] = useState<Partial<PropertyCreateInput> | null>(null);
  const [conflicts, setConflicts] = useState<{ field: string; currentVal: string; aiVal: string }[]>([]);
  const [rawAudioS3Key, setRawAudioS3Key] = useState<string>("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await handleAudioProcessing(audioBlob, "grabacion-voz.webm");
      };

      mediaRecorder.start();
      setState("recording");
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No se pudo acceder al micrófono";
      setErrorMessage(`Error de micrófono: ${msg}`);
      setState("error");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await handleAudioProcessing(file, file.name);
  };

  const handleAudioProcessing = async (audioBlobOrFile: Blob | File, filename: string) => {
    try {
      setState("uploading");
      setErrorMessage(null);

      // 1. Subir archivo a S3 vía BFF Next.js
      const formData = new FormData();
      formData.append("file", audioBlobOrFile, filename);
      formData.append("category", "voice_notes");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Fallo la subida del audio a S3");
      }

      const uploadJson = await uploadRes.json();
      const s3Key = uploadJson.s3Key as string;
      setRawAudioS3Key(s3Key);

      // 2. Disparar transcripción asíncrona en Flask/Celery
      setState("transcribing");
      const transcribeRes = await fetch("/api/ai/voice/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ s3_key: s3Key }),
      });

      if (!transcribeRes.ok) {
        throw new Error("No se pudo encolar la transcripción en el servicio de IA");
      }

      const { task_id } = await transcribeRes.json();

      // 3. Polling reactivo al BFF para consultar estado
      await pollTask(task_id, s3Key);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error durante el procesamiento del audio";
      setErrorMessage(msg);
      setState("error");
    }
  };

  const pollTask = async (taskId: string, s3Key: string) => {
    let attempts = 0;
    const maxAttempts = 30;

    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/ai/tasks/${taskId}`);
        if (!res.ok) throw new Error("Error consultando tarea");

        const data = await res.json();

        if (data.status === "success") {
          clearInterval(interval);
          const aiData: Partial<PropertyCreateInput> = data.normalized || {};
          const fullTranscription = (data.result?.transcription as string) || "";

          setTranscription(fullTranscription);
          setExtractedData(aiData);

          // Detectar conflictos con valores que el usuario ya llenó manualmente
          detectConflicts(aiData);
          setState("success");
        } else if (data.status === "failure") {
          clearInterval(interval);
          setErrorMessage(data.error || "La transcripción falló en el satélite Celery");
          setState("error");
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          setErrorMessage("Tiempo de espera agotado procesando audio");
          setState("error");
        }
      } catch (err: unknown) {
        clearInterval(interval);
        setErrorMessage("Error de comunicación durante el polling");
        setState("error");
      }
    }, 1500);
  };

  const detectConflicts = (aiData: Partial<PropertyCreateInput>) => {
    const detected: { field: string; currentVal: string; aiVal: string }[] = [];

    if (currentValues.price && aiData.price && Number(currentValues.price) !== Number(aiData.price)) {
      detected.push({
        field: "Precio",
        currentVal: `$${currentValues.price} ${currentValues.currency || "MXN"}`,
        aiVal: `$${aiData.price} ${aiData.currency || "MXN"}`,
      });
    }

    if (currentValues.title && aiData.title && currentValues.title.trim() !== aiData.title.trim()) {
      detected.push({
        field: "Título",
        currentVal: currentValues.title,
        aiVal: aiData.title,
      });
    }

    if (currentValues.address && aiData.address && currentValues.address.trim() !== aiData.address.trim()) {
      detected.push({
        field: "Dirección",
        currentVal: currentValues.address,
        aiVal: aiData.address,
      });
    }

    setConflicts(detected);
  };

  const applyAllAiData = () => {
    if (!extractedData) return;
    onApplyVoiceData(extractedData, rawAudioS3Key, transcription);
    setConflicts([]);
  };

  const applyOnlyEmptyFields = () => {
    if (!extractedData) return;
    const safeMerge: Partial<PropertyCreateInput> = {};

    (Object.keys(extractedData) as (keyof PropertyCreateInput)[]).forEach((key) => {
      const currentVal = currentValues[key];
      // Solo sobreescribir si el campo actual está vacío, nulo o cero
      if (currentVal === undefined || currentVal === null || currentVal === "" || currentVal === 0) {
        // @ts-expect-error type safe dynamic assign
        safeMerge[key] = extractedData[key];
      }
    });

    onApplyVoiceData(safeMerge, rawAudioS3Key, transcription);
    setConflicts([]);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <Card className="border-indigo-100 bg-gradient-to-r from-slate-50 to-indigo-50/40 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-indigo-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-indigo-600 p-2 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Asistente de Captura por Voz
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Dicta o sube un audio describiendo la propiedad para autocompletar el formulario
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {state === "recording" && (
              <Badge variant="destructive" className="animate-pulse flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-white" />
                Grabando ({formatSeconds(recordingSeconds)})
              </Badge>
            )}
            {state === "uploading" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3 animate-spin" /> Subiendo a S3...
              </Badge>
            )}
            {state === "transcribing" && (
              <Badge variant="secondary" className="flex items-center gap-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                <Sparkles className="h-3 w-3 animate-spin" /> Extrayendo datos con IA...
              </Badge>
            )}
            {state === "success" && (
              <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Datos extraídos
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {/* Controles de Grabación / Subida */}
        <div className="flex flex-wrap items-center gap-3">
          {state !== "recording" ? (
            <Button
              type="button"
              onClick={startRecording}
              disabled={state === "uploading" || state === "transcribing"}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Mic className="mr-2 h-4 w-4" /> Iniciar Grabación
            </Button>
          ) : (
            <Button
              type="button"
              variant="destructive"
              onClick={stopRecording}
              className="animate-pulse"
            >
              <MicOff className="mr-2 h-4 w-4" /> Detener Grabación ({formatSeconds(recordingSeconds)})
            </Button>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".m4a,.mp3,.wav,.webm,.ogg"
            className="hidden"
          />

          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={state === "recording" || state === "uploading" || state === "transcribing"}
          >
            <Upload className="mr-2 h-4 w-4" /> Subir archivo (.m4a, .mp3, .wav)
          </Button>

          {state === "recording" && (
            <div className="flex items-center gap-2 text-xs text-slate-500 animate-pulse">
              <Volume2 className="h-4 w-4 text-red-500" />
              Habla claro describiendo tipo, precio, ubicación, m², recámaras y detalles...
            </div>
          )}
        </div>

        {/* Mensaje de error si ocurre */}
        {errorMessage && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Transcripción y Panel de Confirmación Inteligente */}
        {state === "success" && extractedData && (
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Transcripción generada por IA:
              </span>
              <p className="mt-1 rounded bg-slate-50 p-2.5 text-xs text-slate-700 italic border border-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800">
                &ldquo;{transcription}&rdquo;
              </p>
            </div>

            {/* Alerta de combinación si hay campos manuales existentes */}
            {conflicts.length > 0 ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 mb-3 dark:border-amber-900/60 dark:bg-amber-950/30">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs text-amber-900 dark:text-amber-200">
                    <p className="font-semibold">Conflictos de datos detectados con valores manuales:</p>
                    <ul className="list-disc pl-4 space-y-0.5 text-amber-800 dark:text-amber-300">
                      {conflicts.map((c, i) => (
                        <li key={i}>
                          <strong>{c.field}:</strong> Ya tenías escrito <em>&quot;{c.currentVal}&quot;</em>, pero la IA extrajo <em>&quot;{c.aiVal}&quot;</em>.
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs border-amber-300 hover:bg-amber-100"
                    onClick={applyOnlyEmptyFields}
                  >
                    Conservar manuales (Rellenar solo vacíos)
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={applyAllAiData}
                  >
                    Sobrescribir con datos de IA
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1.5 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" /> Campos listos para aplicarse al formulario
                </span>
                <Button
                  type="button"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs"
                  onClick={applyAllAiData}
                >
                  Aplicar datos al formulario
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
