"use client";

import React, { useState, useEffect } from "react";
import { type Role } from "@starter/contracts";
import { Badge, type BadgeVariant } from "@/components/ui/badge";

export interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
  badge?: string | number;
  onClick?: () => void;
}

export interface OrganizationOption {
  id: string;
  name: string;
  code?: string;
}

export interface UserProfileInfo {
  name: string;
  email?: string;
  role: Role | string;
  avatarUrl?: string;
}

export interface ResponsiveShellProps {
  children: React.ReactNode;
  brandTitle?: string;
  brandSubtitle?: string;
  navigationItems?: NavigationItem[];
  // Multi-tenant active organization switcher
  organizations?: OrganizationOption[];
  currentOrganizationId?: string;
  onOrganizationChange?: (orgId: string) => void;
  // User profile & Role
  user?: UserProfileInfo;
  onRoleChange?: (role: Role) => void;
  onLogout?: () => void;
  // Header slots
  headerActions?: React.ReactNode;
  defaultSidebarCollapsed?: boolean;
  className?: string;
}

const DEFAULT_ORGS: OrganizationOption[] = [
  { id: "org-demo-001", name: "GS Vera Clinic (CDMX)", code: "CDMX" },
  { id: "org-demo-002", name: "GS Vera Clinic (Monterrey)", code: "MTY" },
  { id: "org-demo-003", name: "GS Vera Clinic (Guadalajara)", code: "GDL" },
];

const DEFAULT_NAV: NavigationItem[] = [
  { label: "Agenda & Turnos", href: "/supervisor", active: true, icon: "📅" },
  { label: "Órdenes de Trabajo", href: "/work-orders", icon: "📋", badge: "3" },
  { label: "Pacientes", href: "/patients", icon: "👥" },
  { label: "Signos Vitales", href: "/vitals", icon: "🩺" },
  { label: "Sincronización Offline", href: "/sync", icon: "🔄" },
  { label: "Configuración Tenant", href: "/settings", icon: "⚙" },
];

function getRoleBadgeVariant(role: string): BadgeVariant {
  switch (role) {
    case "admin_global":
      return "slate";
    case "clinical_lead":
      return "teal";
    case "supervisor":
      return "info";
    case "nurse":
    case "caregiver":
      return "success";
    default:
      return "neutral";
  }
}

function formatRoleName(role: string): string {
  switch (role) {
    case "admin_global":
      return "Admin Global";
    case "clinical_lead":
      return "Jefa de Enfermeras";
    case "supervisor":
      return "Supervisor";
    case "coordinator":
      return "Coordinador";
    case "nurse":
      return "Enfermera";
    case "caregiver":
      return "Cuidadora";
    default:
      return role;
  }
}

export function ResponsiveShell({
  children,
  brandTitle = "GS Vera Clinic",
  brandSubtitle = "Enterprise Healthcare Platform",
  navigationItems = DEFAULT_NAV,
  organizations = DEFAULT_ORGS,
  currentOrganizationId = "org-demo-001",
  onOrganizationChange,
  user = {
    name: "Dra. Elena Ramos",
    email: "elena.ramos@veraclinic.com",
    role: "clinical_lead",
  },
  onRoleChange,
  onLogout,
  headerActions,
  defaultSidebarCollapsed = false,
  className = "",
}: ResponsiveShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(defaultSidebarCollapsed);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  // Close mobile drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileDrawerOpen(false);
      }
    };
    if (mobileDrawerOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileDrawerOpen]);

  const activeOrg = organizations.find((o) => o.id === currentOrganizationId) || organizations[0];

  return (
    <div
      className={`min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col md:flex-row ${className}`}
    >
      {/* ========================================================================= */}
      {/* DESKTOP SIDEBAR (Collapsible)                                            */}
      {/* ========================================================================= */}
      <aside
        className={`hidden md:flex flex-col border-r border-[#E2E8F0] bg-white transition-all duration-300 ease-in-out shrink-0 z-20 ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 border-b border-[#E2E8F0] flex items-center justify-between px-4">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0D9488] text-white font-bold text-sm shadow-sm">
                VC
              </div>
              <div className="truncate">
                <div className="font-extrabold text-sm text-[#0B1C30] tracking-tight truncate">
                  {brandTitle}
                </div>
                <div className="text-[10px] text-slate-400 font-medium truncate">
                  {brandSubtitle}
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-[#0D9488] text-white font-bold text-sm shadow-sm">
              VC
            </div>
          )}

          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={sidebarCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
            aria-label={sidebarCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
          >
            {sidebarCollapsed ? "»" : "«"}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigationItems.map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              onClick={(e) => {
                if (item.onClick) {
                  e.preventDefault();
                  item.onClick();
                }
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                item.active
                  ? "bg-[#0D9488]/10 text-[#0D9488] font-bold"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              } ${sidebarCollapsed ? "justify-center" : ""}`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="text-base shrink-0">{item.icon || "•"}</span>
              {!sidebarCollapsed && <span className="flex-1 truncate">{item.label}</span>}
              {!sidebarCollapsed && item.badge !== undefined && (
                <span className="rounded-full bg-[#0D9488] px-2 py-0.5 text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              )}
            </a>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-[#E2E8F0] p-3">
          {!sidebarCollapsed ? (
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/60 text-xs">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-1">
                <span>Estado Starter</span>
                <span className="flex items-center gap-1 text-[#10B981]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] inline-block" /> Activo
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">v1.0.0 · NOM-004</div>
            </div>
          ) : (
            <div className="flex justify-center" title="v1.0.0 Activo">
              <span className="h-2 w-2 rounded-full bg-[#10B981]" />
            </div>
          )}
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MOBILE DRAWER / HAMBURGER (Small screens)                                  */}
      {/* ========================================================================= */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer sheet */}
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="h-16 border-b border-[#E2E8F0] flex items-center justify-between px-4 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0D9488] text-white font-bold text-xs">
                  VC
                </div>
                <div>
                  <div className="font-extrabold text-sm text-[#0B1C30]">{brandTitle}</div>
                  <div className="text-[10px] text-slate-400">{brandSubtitle}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200"
                aria-label="Cerrar menú"
              >
                ✕
              </button>
            </div>

            {/* Mobile Tenant Selector */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Organización / Sede
              </label>
              <select
                value={activeOrg?.id}
                onChange={(e) => {
                  if (onOrganizationChange) {
                    onOrganizationChange(e.target.value);
                  }
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-[#0D9488]"
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {navigationItems.map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  onClick={(e) => {
                    setMobileDrawerOpen(false);
                    if (item.onClick) {
                      e.preventDefault();
                      item.onClick();
                    }
                  }}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold transition-colors ${
                    item.active
                      ? "bg-[#0D9488]/10 text-[#0D9488] font-bold"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-lg">{item.icon || "•"}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="rounded-full bg-[#0D9488] px-2 py-0.5 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </a>
              ))}
            </nav>

            {/* User profile in Drawer */}
            <div className="border-t border-[#E2E8F0] p-4 bg-slate-50">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-xl bg-[#0B1C30] text-white flex items-center justify-center font-bold text-xs">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="truncate flex-1">
                  <div className="font-bold text-xs text-[#0B1C30] truncate">{user.name}</div>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {formatRoleName(user.role)}
                  </Badge>
                </div>
              </div>

              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onLogout();
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  Cerrar sesión
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN LAYOUT WRAPPER (Header + Content Slot)                                */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER */}
        <header className="h-16 border-b border-[#E2E8F0] bg-white px-4 md:px-6 flex items-center justify-between sticky top-0 z-10 shadow-xs">
          {/* Left section: Hamburger (mobile) or active location */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-2 rounded-xl border border-[#E2E8F0] text-slate-600 hover:bg-slate-100"
              aria-label="Abrir menú de navegación"
            >
              ☰
            </button>

            {/* Multi-Tenant Organization Switcher (Desktop) */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-slate-400 text-xs">🏢</span>
              <span className="text-xs font-semibold text-slate-500">Tenant:</span>
              <select
                value={currentOrganizationId}
                onChange={(e) => {
                  if (onOrganizationChange) {
                    onOrganizationChange(e.target.value);
                  }
                }}
                className="rounded-xl border border-[#E2E8F0] bg-slate-50 px-3 py-1.5 text-xs font-bold text-[#0B1C30] outline-none focus:border-[#0D9488] focus:bg-white transition-colors cursor-pointer"
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right section: Header Actions & User Profile */}
          <div className="flex items-center gap-3">
            {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}

            {/* Optional Role Switcher for dev/supervisor preview */}
            {onRoleChange && (
              <div className="hidden lg:flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400">Rol:</span>
                <select
                  value={user.role}
                  onChange={(e) => onRoleChange(e.target.value as Role)}
                  className="rounded-xl border border-[#E2E8F0] bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-800 outline-none focus:border-[#0D9488]"
                >
                  <option value="clinical_lead">Jefa Enf.</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin_global">Admin Global</option>
                  <option value="caregiver">Cuidadora</option>
                </select>
              </div>
            )}

            {/* User Profile Badge */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-[#0B1C30] leading-tight">{user.name}</div>
                <div className="text-[10px] text-slate-500">{formatRoleName(user.role)}</div>
              </div>

              <div className="h-9 w-9 rounded-xl bg-[#0B1C30] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-full w-full rounded-xl object-cover"
                  />
                ) : (
                  user.name.slice(0, 2).toUpperCase()
                )}
              </div>

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  title="Cerrar sesión"
                  className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  🚪
                </button>
              )}
            </div>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
