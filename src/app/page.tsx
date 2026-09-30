import Link from "next/link";
import {
  Building2,
  Mic,
  Camera,
  Database,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Server,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Hero Header */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-6 py-12 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              CIP • Captador Inteligente de Propiedades
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              Captación Inmobiliaria Híbrida con IA
            </h1>
            <p className="max-w-2xl text-base text-slate-600 dark:text-slate-400">
              Combina captura manual tradicional con asistencia de voz inteligente (Whisper/LLM),
              optimización de fotografías en AWS S3 y persistencia relacional en PostgreSQL 18.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link href="/propiedades/nueva">
              <Button size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                <Mic className="mr-2 h-4 w-4" /> Captar Propiedad
              </Button>
            </Link>
            <Link href="/propiedades">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <Building2 className="mr-2 h-4 w-4" /> Ver Cartera
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="mx-auto max-w-6xl px-6 py-12 space-y-12">
        {/* Módulos Principales de la Solución */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow border-indigo-100 dark:border-slate-800">
            <CardHeader className="pb-2">
              <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 mb-2 dark:bg-indigo-950 dark:text-indigo-400">
                <Mic className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Asistente de Voz Inteligente</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <p>
                Graba directo en campo o sube un audio (.m4a, .mp3, .wav). Flask + Celery procesan la
                transcripción y extraen entidades clave estructuradas.
              </p>
              <div className="pt-2">
                <Badge variant="secondary" className="text-xs">
                  Sin sobrescribir campos manuales
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow border-indigo-100 dark:border-slate-800">
            <CardHeader className="pb-2">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 mb-2 dark:bg-emerald-950 dark:text-emerald-400">
                <Camera className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Fotos y Medios a S3</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <p>
                Subida directa de imágenes a bucket privado AWS S3. El microservicio satélite extrae
                dimensiones y metadatos de forma síncrona (&lt; 5s).
              </p>
              <div className="pt-2">
                <Badge variant="secondary" className="text-xs">
                  S3 Keys Only (No binarios por HTTP)
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow border-indigo-100 dark:border-slate-800">
            <CardHeader className="pb-2">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mb-2 dark:bg-blue-950 dark:text-blue-400">
                <Database className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">PostgreSQL 18 + Drizzle</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <p>
                Aislamiento estricto: Next.js es el único gateway con acceso a la base de datos relacional.
                Flask jamás realiza consultas SQL directas.
              </p>
              <div className="pt-2">
                <Badge variant="secondary" className="text-xs">
                  Validación Zod estricta
                </Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Panel de Arquitectura BFF */}
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-bold">Topología Backend for Frontend (BFF)</h2>
              </div>
              <p className="text-xs text-slate-500">
                Aislamiento de red interna y microservicios satélite
              </p>
            </div>
            <Link href="/propiedades/nueva">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Probar Captador <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="rounded-lg bg-slate-50 p-4 border border-slate-100 dark:bg-slate-950 dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-500 uppercase">Orquestador</div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">Next.js 16</div>
              <div className="text-[11px] text-emerald-600 mt-0.5">Puerto 3000 (Expuesto)</div>
            </div>

            <div className="rounded-lg bg-slate-50 p-4 border border-slate-100 dark:bg-slate-950 dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-500 uppercase">Satélite IA</div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">Python + Flask</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Red Interna (Aislado)</div>
            </div>

            <div className="rounded-lg bg-slate-50 p-4 border border-slate-100 dark:bg-slate-950 dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-500 uppercase">Colas Asíncronas</div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">Redis + Celery</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Whisper &amp; LLM Cloud</div>
            </div>

            <div className="rounded-lg bg-slate-50 p-4 border border-slate-100 dark:bg-slate-950 dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-500 uppercase">Persistencia</div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">PostgreSQL 18</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Drizzle ORM</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
