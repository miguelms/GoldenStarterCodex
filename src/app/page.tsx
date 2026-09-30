import Link from "next/link";
import {
  Layers,
  Database,
  Cpu,
  ShieldCheck,
  Server,
  Sparkles,
  ArrowRight,
  Code2,
  Boxes,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Hero Header */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-6 py-14 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              Golden Starter V3 • Enterprise Monorepo Skeleton
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              Esqueleto Base Universal y Modular
            </h1>
            <p className="max-w-2xl text-base text-slate-600 dark:text-slate-400">
              Plantilla limpia y lista para producción bajo el patrón <strong>Backend for Frontend (BFF)</strong>,
              orquestada con 17 agentes de IA especializados y metodología <strong>Spec-Driven Development (SDD)</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <a href="https://github.com" target="_blank" rel="noreferrer">
              <Button size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                <Code2 className="mr-2 h-4 w-4" /> Empezar Nueva App
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="mx-auto max-w-6xl px-6 py-12 space-y-12">
        {/* Pilares Tecnológicos */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow border-indigo-100 dark:border-slate-800">
            <CardHeader className="pb-2">
              <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 mb-2 dark:bg-indigo-950 dark:text-indigo-400">
                <Layers className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Frontend &amp; Orquestador (BFF)</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <p>
                Next.js 16 (App Router), React 19, Tailwind CSS 4, componentes oficiales Shadcn UI y Generic DataGrid responsivo.
              </p>
              <div className="pt-2">
                <Badge variant="secondary" className="text-xs">
                  Node.js 24 LTS + TypeScript Estricto
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow border-indigo-100 dark:border-slate-800">
            <CardHeader className="pb-2">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 mb-2 dark:bg-emerald-950 dark:text-emerald-400">
                <Cpu className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Microservicio Satélite de IA</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <p>
                Python 3.12 + Flask con colas asíncronas Redis + Celery para tareas pesadas de visión, audio y LLMs en la nube.
              </p>
              <div className="pt-2">
                <Badge variant="secondary" className="text-xs">
                  Aislamiento estricto de base de datos
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow border-indigo-100 dark:border-slate-800">
            <CardHeader className="pb-2">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mb-2 dark:bg-blue-950 dark:text-blue-400">
                <Database className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Persistencia &amp; Datos</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <p>
                PostgreSQL 18 + Drizzle ORM, multi-tenant nativo por organización, autenticación con Better Auth y almacenamiento AWS S3.
              </p>
              <div className="pt-2">
                <Badge variant="secondary" className="text-xs">
                  Contratos Zod compartidos
                </Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Topología y Gobernanza */}
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-bold">Topología Docker Compose &amp; Agentes</h2>
              </div>
              <p className="text-xs text-slate-500">
                Entorno reproducible con red interna aislada y soporte de 17 especialistas Antigravity
              </p>
            </div>
            <Badge variant="outline" className="text-emerald-600 border-emerald-300">
              100% Agnóstico a Dominio
            </Badge>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="rounded-lg bg-slate-50 p-4 border border-slate-100 dark:bg-slate-950 dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-500 uppercase">Orquestador</div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">next-app:3000</div>
              <div className="text-[11px] text-emerald-600 mt-0.5">Expuesto a Internet</div>
            </div>

            <div className="rounded-lg bg-slate-50 p-4 border border-slate-100 dark:bg-slate-950 dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-500 uppercase">Microservicio IA</div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">flask-api</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Red Interna Aislada</div>
            </div>

            <div className="rounded-lg bg-slate-50 p-4 border border-slate-100 dark:bg-slate-950 dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-500 uppercase">Colas Celery</div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">redis + worker</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Memoria Aislada</div>
            </div>

            <div className="rounded-lg bg-slate-50 p-4 border border-slate-100 dark:bg-slate-950 dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-500 uppercase">Base de Datos</div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">db (Postgres 18)</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Drizzle ORM</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
