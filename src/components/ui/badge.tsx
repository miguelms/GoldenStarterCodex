import React from "react";

export type BadgeVariant = "teal" | "slate" | "danger" | "warning" | "success" | "info" | "neutral";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "neutral", className = "" }: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    teal: "bg-[#0D9488]/10 text-[#0D9488] border-[#0D9488]/30",
    slate: "bg-[#0B1C30]/10 text-[#0B1C30] border-[#0B1C30]/20",
    danger: "bg-[#FEE2E2] text-[#DC2626] border-[#DC2626]/30",
    warning: "bg-[#FEF3C7] text-[#D97706] border-[#D97706]/30",
    success: "bg-[#F5FFF6] text-[#10B981] border-[#10B981]/30",
    info: "bg-[#E0F2FE] text-[#0284C7] border-[#0284C7]/30",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
