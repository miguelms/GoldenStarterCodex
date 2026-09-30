export default function HomePage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <header className="mb-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 mb-4">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          Golden Starter V2 • Canonical Skeleton
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          Base Arquitectónica Limpia y Modular
        </h1>
        <p className="mt-3 text-lg text-slate-600 max-w-2xl">
          Listo para instanciar nuevas aplicaciones sin vestigios de dominios específicos. Diseñado para
          orquestación con agentes especializados Antigravity y desarrollo guiado por especificaciones (SDD).
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow transition-shadow">
          <div className="text-blue-600 font-semibold text-sm mb-1">Tecnología Web</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Next.js 16 + React 19</h2>
          <p className="text-sm text-slate-600">
            App Router, Tailwind CSS 4, Route Handlers desacoplados, autenticación con Better-Auth y runtime Node 24.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow transition-shadow">
          <div className="text-emerald-600 font-semibold text-sm mb-1">Tecnología Mobile</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Expo 57 + React Native</h2>
          <p className="text-sm text-slate-600">
            Expo Router 57, motor Hermes, sincronización outbox idempotente y soporte de operación offline con SQLite.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow transition-shadow">
          <div className="text-violet-600 font-semibold text-sm mb-1">Persistencia y Datos</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">PostgreSQL 18 + Drizzle</h2>
          <p className="text-sm text-slate-600">
            Multi-tenant por organización (orgId), contratos Zod compartidos (@starter/contracts), almacenamiento S3 y logs con redacción de secretos.
          </p>
        </div>
      </section>

      <section className="bg-slate-900 text-slate-100 rounded-2xl p-8 mb-12 shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6 mb-6">
          <div>
            <h3 className="text-xl font-bold">Estado del Sistema</h3>
            <p className="text-sm text-slate-400">Verificación de baseline y contratos de gobierno</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs px-3 py-1.5 rounded-full font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Golden Starter V2 Activo
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-slate-800/60 p-4 rounded-lg">
            <div className="text-2xl font-bold text-white">17</div>
            <div className="text-xs text-slate-400 mt-1">Agentes Antigravity</div>
          </div>
          <div className="bg-slate-800/60 p-4 rounded-lg">
            <div className="text-2xl font-bold text-emerald-400">100%</div>
            <div className="text-xs text-slate-400 mt-1">Contratos Zod Puros</div>
          </div>
          <div className="bg-slate-800/60 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">SDD</div>
            <div className="text-xs text-slate-400 mt-1">Spec-Driven Loop</div>
          </div>
          <div className="bg-slate-800/60 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">Zero</div>
            <div className="text-xs text-slate-400 mt-1">Vestigios Clínicos</div>
          </div>
        </div>
      </section>

      <footer className="text-center text-xs text-slate-500 border-t border-slate-200 pt-6">
        Golden Starter V2 • Listo para recibir la especificación de la nueva aplicación.
      </footer>
    </main>
  );
}
