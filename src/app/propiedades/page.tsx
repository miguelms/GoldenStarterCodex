"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Home, Sparkles, Building, MapPin, DollarSign, Image as ImageIcon, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GenericCrudDataGrid, type ColumnDef } from "@/components/shared/data-grid/generic-crud-data-grid";
import type { Property } from "@starter/contracts";

type PropertyRow = Property & Record<string, unknown>;

export default function PropiedadesListPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/properties");
      if (!res.ok) throw new Error("Error al obtener listado de propiedades");
      const json = await res.json();
      setProperties((json.items || []) as PropertyRow[]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al conectar con la base de datos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const columns: ColumnDef<PropertyRow>[] = useMemo(
    () => [
      {
        key: "title",
        header: "Propiedad",
        sortable: true,
        accessor: (row) => (
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900 dark:text-slate-100">{row.title}</span>
            <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
              {row.address}
            </span>
          </div>
        ),
      },
      {
        key: "property_type",
        header: "Tipo",
        sortable: true,
        filterable: true,
        filterOptions: [
          { label: "Casa", value: "casa" },
          { label: "Departamento", value: "departamento" },
          { label: "Terreno", value: "terreno" },
          { label: "Comercial", value: "comercial" },
        ],
        accessor: (row) => {
          const typeColors: Record<string, string> = {
            casa: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
            departamento: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
            terreno: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
            comercial: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
          };
          const cls = typeColors[row.property_type] || "bg-slate-100 text-slate-800";
          return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide ${cls}`}>
              {row.property_type}
            </span>
          );
        },
      },
      {
        key: "price",
        header: "Precio",
        sortable: true,
        align: "right",
        accessor: (row) => (
          <div className="text-right font-medium text-slate-900 dark:text-slate-100">
            ${Number(row.price).toLocaleString("es-MX")}{" "}
            <span className="text-xs text-slate-500">{row.currency}</span>
          </div>
        ),
      },
      {
        key: "features",
        header: "Distribución",
        accessor: (row) => (
          <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
            {row.bedrooms !== null && row.bedrooms !== undefined && (
              <span>{row.bedrooms} rec</span>
            )}
            {row.bathrooms !== null && row.bathrooms !== undefined && (
              <span>• {row.bathrooms} bñ</span>
            )}
            {row.construction_size !== null && row.construction_size !== undefined && (
              <span>• {row.construction_size} m²</span>
            )}
          </div>
        ),
      },
      {
        key: "media",
        header: "Medios S3",
        align: "center",
        accessor: (row) => (
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            {row.images && row.images.length > 0 && (
              <Badge variant="outline" className="flex items-center gap-1 text-[11px] py-0">
                <ImageIcon className="h-3 w-3 text-slate-500" />
                {row.images.length}
              </Badge>
            )}
            {row.raw_audio_s3_key && (
              <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 flex items-center gap-1 text-[11px] py-0 dark:bg-indigo-950/60 dark:text-indigo-300">
                <Volume2 className="h-3 w-3 text-indigo-500" />
                Voz IA
              </Badge>
            )}
          </div>
        ),
      },
      {
        key: "createdAt",
        header: "Captada el",
        sortable: true,
        accessor: (row) => (
          <span className="text-xs text-slate-500">
            {new Date(row.createdAt).toLocaleDateString("es-MX", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-600 p-2 text-white shadow-sm">
              <Building className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  CIP — Captador Inteligente de Propiedades
                </h1>
                <Badge variant="outline" className="text-[10px] text-indigo-600 border-indigo-200">
                  BFF + Shadcn UI
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                Gestión, dictado de voz por IA y persistencia en PostgreSQL 18
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/propiedades/nueva">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                <Plus className="mr-1.5 h-4 w-4" /> Nueva Propiedad
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content con General DataGrid */}
      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <GenericCrudDataGrid
          data={properties}
          columns={columns}
          keyExtractor={(item) => item.id}
          title="Cartera de Propiedades Captadas"
          description="Listado administrable con soporte de filtrado, ordenamiento y vista responsiva móvil"
          isLoading={isLoading}
          error={error}
          onRetry={fetchProperties}
          emptyTitle="Aún no hay propiedades captadas"
          emptyMessage="Comienza captando una propiedad con el formulario tradicional o usando el asistente de voz por IA."
          onAdd={() => router.push("/propiedades/nueva")}
          addLabel="+ Nueva Propiedad"
          searchPlaceholder="Buscar por título, dirección o descripción..."
        />
      </main>
    </div>
  );
}
