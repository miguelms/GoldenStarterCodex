"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export interface ColumnDef<T> {
  key: string;
  header: string;
  accessor?: (row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterOptions?: { label: string; value: string }[];
  className?: string;
  align?: "left" | "center" | "right";
  mobilePriority?: "primary" | "secondary" | "meta" | "hidden";
}

export interface BatchAction<T> {
  label: string;
  action: (selectedItems: T[]) => void;
  variant?: "danger" | "teal" | "slate";
}

export interface GenericCrudDataGridProps<T extends Record<string, unknown>> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T) => string;
  title?: string;
  description?: string;
  isLoading?: boolean;
  error?: Error | string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyMessage?: string;
  // CRUD Actions
  onAdd?: () => void;
  addLabel?: string;
  onEdit?: (item: T) => void;
  editLabel?: string;
  onDelete?: (item: T) => void;
  deleteLabel?: string;
  onViewDetail?: (item: T) => void;
  viewDetailLabel?: string;
  onExport?: (data: T[]) => void;
  exportLabel?: string;
  // Selection
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[], selectedItems: T[]) => void;
  batchActions?: BatchAction<T>[];
  // Pagination & Layout
  initialPageSize?: number;
  pageSizeOptions?: number[];
  searchPlaceholder?: string;
  className?: string;
}

export function GenericCrudDataGrid<T extends Record<string, unknown>>({
  data,
  columns,
  keyExtractor,
  title,
  description,
  isLoading = false,
  error = null,
  onRetry,
  emptyTitle = "Sin registros disponibles",
  emptyMessage = "No se encontraron datos para los filtros aplicados.",
  onAdd,
  addLabel = "+ Nuevo",
  onEdit,
  editLabel = "Editar",
  onDelete,
  deleteLabel = "Archivar",
  onViewDetail,
  viewDetailLabel = "Ver detalle",
  onExport,
  exportLabel = "Exportar",
  selectable = false,
  selectedIds: controlledSelectedIds,
  onSelectionChange,
  batchActions = [],
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  searchPlaceholder = "Buscar registros...",
  className = "",
}: GenericCrudDataGridProps<T>) {
  // Local state for uncontrolled selection
  const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>([]);
  const selectedIds = controlledSelectedIds ?? internalSelectedIds;

  // Search, Sort, Filter, Pagination
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Update selection helper
  const handleSelectChange = useCallback(
    (newIds: string[]) => {
      if (!controlledSelectedIds) {
        setInternalSelectedIds(newIds);
      }
      if (onSelectionChange) {
        const idSet = new Set(newIds);
        const selectedItems = data.filter((item) => idSet.has(keyExtractor(item)));
        onSelectionChange(newIds, selectedItems);
      }
    },
    [controlledSelectedIds, onSelectionChange, data, keyExtractor],
  );

  const toggleSelectRow = useCallback(
    (id: string) => {
      if (selectedIds.includes(id)) {
        handleSelectChange(selectedIds.filter((item) => item !== id));
      } else {
        handleSelectChange([...selectedIds, id]);
      }
    },
    [selectedIds, handleSelectChange],
  );

  // Sorting handler
  const handleSort = (key: string) => {
    if (sortField === key) {
      if (sortDir === "asc") {
        setSortDir("desc");
      } else {
        setSortField(null);
        setSortDir("asc");
      }
    } else {
      setSortField(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  // Filter and Search logic
  const filteredData = useMemo(() => {
    let result = [...data];

    // Global search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((item) => {
        return Object.values(item).some((val) => {
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(q);
        });
      });
    }

    // Column-level filters
    for (const [colKey, filterVal] of Object.entries(columnFilters)) {
      if (filterVal) {
        result = result.filter((item) => {
          const raw = item[colKey];
          if (raw === null || raw === undefined) return false;
          return String(raw).toLowerCase() === filterVal.toLowerCase();
        });
      }
    }

    // Sorting
    if (sortField) {
      const col = columns.find((c) => c.key === sortField);
      result.sort((a, b) => {
        let valA: unknown = a[sortField];
        let valB: unknown = b[sortField];

        if (typeof valA === "string" && typeof valB === "string") {
          const comp = valA.localeCompare(valB);
          return sortDir === "asc" ? comp : -comp;
        }

        if (typeof valA === "number" && typeof valB === "number") {
          return sortDir === "asc" ? valA - valB : valB - valA;
        }

        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        const strA = String(valA);
        const strB = String(valB);
        const comp = strA.localeCompare(strB);
        return sortDir === "asc" ? comp : -comp;
      });
    }

    return result;
  }, [data, searchQuery, columnFilters, sortField, sortDir, columns]);

  // Paginated records
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Select all visible
  const visibleIds = useMemo(
    () => paginatedData.map((item) => keyExtractor(item)),
    [paginatedData, keyExtractor],
  );
  const isAllVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const isSomeVisibleSelected =
    visibleIds.some((id) => selectedIds.includes(id)) && !isAllVisibleSelected;

  const toggleSelectAllVisible = () => {
    if (isAllVisibleSelected) {
      handleSelectChange(selectedIds.filter((id) => !visibleIds.includes(id)));
    } else {
      const merged = Array.from(new Set([...selectedIds, ...visibleIds]));
      handleSelectChange(merged);
    }
  };

  // CSV Export fallback
  const handleExport = () => {
    if (onExport) {
      onExport(filteredData);
      return;
    }

    // Default CSV exporter
    if (filteredData.length === 0) return;
    const exportableCols = columns.filter((c) => c.mobilePriority !== "hidden");
    const headers = exportableCols.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(",");
    const rows = filteredData.map((item) => {
      return exportableCols
        .map((c) => {
          const val = item[c.key];
          return `"${String(val ?? "").replace(/"/g, '""')}"`;
        })
        .join(",");
    });
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasActiveActions = Boolean(onEdit || onDelete || onViewDetail);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header & Controls */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {title && <h2 className="text-lg font-bold text-[#0B1C30]">{title}</h2>}
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
          </div>

          {/* Top Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {onExport && (
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors"
              >
                <span>↓</span> {exportLabel}
              </button>
            )}

            {onAdd && (
              <button
                type="button"
                onClick={onAdd}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0D9488] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0F766E] active:bg-[#115E59] transition-all"
              >
                {addLabel}
              </button>
            )}
          </div>
        </div>

        {/* Search, Filter Toggle & Batch Actions Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">
                🔍
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder={searchPlaceholder}
                className="w-full rounded-xl border border-[#E2E8F0] bg-slate-50 pl-8 pr-8 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#0D9488] focus:bg-white focus:ring-2 focus:ring-[#0D9488]/20 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {columns.some((c) => c.filterable) && (
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  showFilters || Object.values(columnFilters).some(Boolean)
                    ? "border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488]"
                    : "border-[#E2E8F0] bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>⚙</span> Filtros
                {Object.values(columnFilters).filter(Boolean).length > 0 && (
                  <span className="ml-1 rounded-full bg-[#0D9488] px-1.5 py-0.2 text-[10px] text-white">
                    {Object.values(columnFilters).filter(Boolean).length}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Batch Actions and selection info */}
          {selectable && selectedIds.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#0D9488] bg-[#0D9488]/10 px-2.5 py-1 rounded-lg">
                {selectedIds.length} seleccionados
              </span>
              {batchActions.map((ba, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const idSet = new Set(selectedIds);
                    const sel = data.filter((i) => idSet.has(keyExtractor(i)));
                    ba.action(sel);
                  }}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                    ba.variant === "danger"
                      ? "bg-[#DC2626] text-white hover:bg-red-700"
                      : ba.variant === "slate"
                        ? "bg-[#0B1C30] text-white hover:bg-slate-800"
                        : "bg-[#0D9488] text-white hover:bg-[#0F766E]"
                  }`}
                >
                  {ba.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleSelectChange([])}
                className="text-xs text-slate-500 hover:text-slate-700 underline"
              >
                Limpiar
              </button>
            </div>
          )}
        </div>

        {/* Collapsible Column Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-50 border border-[#E2E8F0]">
            {columns
              .filter((c) => c.filterable)
              .map((c) => (
                <div key={c.key}>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {c.header}
                  </label>
                  {c.filterOptions ? (
                    <select
                      value={columnFilters[c.key] || ""}
                      onChange={(e) => {
                        setColumnFilters((prev) => ({
                          ...prev,
                          [c.key]: e.target.value,
                        }));
                        setPage(1);
                      }}
                      className="w-full rounded-lg border border-[#E2E8F0] bg-white px-2 py-1.5 text-xs font-medium text-slate-900 outline-none focus:border-[#0D9488]"
                    >
                      <option value="">Todos</option>
                      {c.filterOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={columnFilters[c.key] || ""}
                      onChange={(e) => {
                        setColumnFilters((prev) => ({
                          ...prev,
                          [c.key]: e.target.value,
                        }));
                        setPage(1);
                      }}
                      placeholder={`Filtrar por ${c.header.toLowerCase()}...`}
                      className="w-full rounded-lg border border-[#E2E8F0] bg-white px-2 py-1.5 text-xs font-medium text-slate-900 outline-none focus:border-[#0D9488]"
                    />
                  )}
                </div>
              ))}
            {Object.values(columnFilters).some(Boolean) && (
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    setColumnFilters({});
                    setPage(1);
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  Restablecer filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="rounded-2xl border border-red-300 bg-[#FEE2E2] p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠</span>
              <div>
                <h4 className="text-sm font-bold text-[#DC2626]">Error al cargar los registros</h4>
                <p className="text-xs text-red-700 mt-1 font-mono">
                  {typeof error === "string" ? error : error.message}
                </p>
              </div>
            </div>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="shrink-0 rounded-xl bg-[#DC2626] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            )}
          </div>
        </div>
      )}

      {/* LOADING STATE */}
      {isLoading && (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-24" />
          </div>
          {[1, 2, 3, 4, 5].map((idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!isLoading && !error && filteredData.length === 0 && (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
            📋
          </div>
          <h3 className="text-base font-bold text-[#0B1C30]">{emptyTitle}</h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">{emptyMessage}</p>
          {onAdd && (
            <div className="mt-5">
              <button
                type="button"
                onClick={onAdd}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0D9488] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0F766E] transition-all"
              >
                {addLabel}
              </button>
            </div>
          )}
        </div>
      )}

      {/* DATA STATE: DESKTOP TABLE VIEW (hidden on small screens) */}
      {!isLoading && !error && filteredData.length > 0 && (
        <>
          <div className="hidden md:block rounded-2xl border border-[#E2E8F0] bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    {selectable && (
                      <th scope="col" className="w-10 px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isAllVisibleSelected}
                          ref={(el) => {
                            if (el) el.indeterminate = isSomeVisibleSelected;
                          }}
                          onChange={toggleSelectAllVisible}
                          aria-label="Seleccionar todos los visibles"
                          className="h-4 w-4 rounded border-slate-300 text-[#0D9488] focus:ring-[#0D9488]"
                        />
                      </th>
                    )}
                    {columns
                      .filter((col) => col.mobilePriority !== "hidden")
                      .map((col) => (
                        <th
                          key={col.key}
                          scope="col"
                          className={`px-4 py-3 ${col.className || ""}`}
                        >
                          {col.sortable ? (
                            <button
                              type="button"
                              onClick={() => handleSort(col.key)}
                              className="flex items-center gap-1 font-bold text-slate-700 hover:text-[#0D9488] transition-colors"
                            >
                              <span>{col.header}</span>
                              <span className="text-[10px] text-slate-400">
                                {sortField === col.key ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
                              </span>
                            </button>
                          ) : (
                            <span>{col.header}</span>
                          )}
                        </th>
                      ))}
                    {hasActiveActions && (
                      <th scope="col" className="px-4 py-3 text-right">
                        Acciones
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {paginatedData.map((item) => {
                    const id = keyExtractor(item);
                    const isSelected = selectedIds.includes(id);

                    return (
                      <tr
                        key={id}
                        className={`transition-colors ${
                          isSelected
                            ? "bg-[#0D9488]/5 hover:bg-[#0D9488]/10"
                            : "hover:bg-slate-50/80"
                        }`}
                      >
                        {selectable && (
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectRow(id)}
                              aria-label={`Seleccionar fila ${id}`}
                              className="h-4 w-4 rounded border-slate-300 text-[#0D9488] focus:ring-[#0D9488]"
                            />
                          </td>
                        )}
                        {columns
                          .filter((col) => col.mobilePriority !== "hidden")
                          .map((col) => (
                            <td key={col.key} className={`px-4 py-3 ${col.className || ""}`}>
                              {col.accessor ? col.accessor(item) : String(item[col.key] ?? "-")}
                            </td>
                          ))}
                        {hasActiveActions && (
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {onViewDetail && (
                                <button
                                  type="button"
                                  onClick={() => onViewDetail(item)}
                                  title={viewDetailLabel}
                                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                                >
                                  👁
                                </button>
                              )}
                              {onEdit && (
                                <button
                                  type="button"
                                  onClick={() => onEdit(item)}
                                  title={editLabel}
                                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#0D9488] transition-colors"
                                >
                                  ✎
                                </button>
                              )}
                              {onDelete && (
                                <button
                                  type="button"
                                  onClick={() => onDelete(item)}
                                  title={deleteLabel}
                                  className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-[#DC2626] transition-colors"
                                >
                                  🗑
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* DATA STATE: MOBILE CARD VIEW (< md screens) */}
          <div className="md:hidden space-y-3">
            {paginatedData.map((item) => {
              const id = keyExtractor(item);
              const isSelected = selectedIds.includes(id);

              // Extract columns by priority
              const primaryCols = columns.filter((c) => c.mobilePriority === "primary");
              const metaCols = columns.filter((c) => c.mobilePriority === "meta");
              const otherCols = columns.filter(
                (c) =>
                  c.mobilePriority !== "primary" &&
                  c.mobilePriority !== "meta" &&
                  c.mobilePriority !== "hidden",
              );

              return (
                <div
                  key={id}
                  className={`rounded-2xl border p-4 shadow-sm transition-all ${
                    isSelected
                      ? "border-[#0D9488] bg-[#0D9488]/5 ring-1 ring-[#0D9488]"
                      : "border-[#E2E8F0] bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      {selectable && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(id)}
                          aria-label={`Seleccionar tarjeta ${id}`}
                          className="h-5 w-5 rounded border-slate-300 text-[#0D9488] focus:ring-[#0D9488]"
                        />
                      )}
                      <div>
                        {primaryCols.length > 0 ? (
                          primaryCols.map((c) => (
                            <div key={c.key} className="font-bold text-sm text-[#0B1C30]">
                              {c.accessor ? c.accessor(item) : String(item[c.key] ?? "")}
                            </div>
                          ))
                        ) : (
                          <div className="font-bold text-sm text-[#0B1C30]">
                            {String(item[columns[0]?.key] ?? id)}
                          </div>
                        )}
                      </div>
                    </div>

                    {metaCols.length > 0 && (
                      <div className="flex flex-col items-end gap-1">
                        {metaCols.map((c) => (
                          <div key={c.key}>
                            {c.accessor ? (
                              c.accessor(item)
                            ) : (
                              <Badge variant="slate">{String(item[c.key] ?? "")}</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Body fields */}
                  <div className="py-2.5 space-y-1.5 text-xs">
                    {otherCols.map((c) => (
                      <div key={c.key} className="flex items-center justify-between text-slate-600">
                        <span className="font-semibold text-slate-500">{c.header}:</span>
                        <span className="font-medium text-slate-900">
                          {c.accessor ? c.accessor(item) : String(item[c.key] ?? "-")}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Actions footer */}
                  {hasActiveActions && (
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                      {onViewDetail && (
                        <button
                          type="button"
                          onClick={() => onViewDetail(item)}
                          className="min-h-[44px] px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                        >
                          {viewDetailLabel}
                        </button>
                      )}
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          className="min-h-[44px] px-3 py-2 rounded-xl bg-[#0D9488]/10 text-xs font-bold text-[#0D9488] hover:bg-[#0D9488]/20 transition-colors"
                        >
                          {editLabel}
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(item)}
                          className="min-h-[44px] px-3 py-2 rounded-xl bg-red-50 text-xs font-bold text-[#DC2626] hover:bg-red-100 transition-colors"
                        >
                          {deleteLabel}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-sm text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span>Mostrar</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-lg border border-[#E2E8F0] bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-900 outline-none focus:border-[#0D9488]"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span>por página</span>
              <span className="text-slate-400">|</span>
              <span className="tabular-nums font-semibold">
                {totalItems === 0
                  ? "0 resultados"
                  : `${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, totalItems)} de ${totalItems}`}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage(1)}
                className="min-h-[36px] min-w-[36px] rounded-lg border border-[#E2E8F0] bg-white px-2 py-1 text-xs font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Primera página"
              >
                «
              </button>
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="min-h-[36px] min-w-[36px] rounded-lg border border-[#E2E8F0] bg-white px-2 py-1 text-xs font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Página anterior"
              >
                ‹
              </button>

              <span className="px-2 font-semibold tabular-nums text-slate-800">
                Pág. {currentPage} de {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                className="min-h-[36px] min-w-[36px] rounded-lg border border-[#E2E8F0] bg-white px-2 py-1 text-xs font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Página siguiente"
              >
                ›
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setPage(totalPages)}
                className="min-h-[36px] min-w-[36px] rounded-lg border border-[#E2E8F0] bg-white px-2 py-1 text-xs font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Última página"
              >
                »
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
