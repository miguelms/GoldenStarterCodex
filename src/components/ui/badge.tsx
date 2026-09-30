import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-slate-900 text-slate-50 shadow hover:bg-slate-900/80",
        secondary:
          "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80",
        destructive:
          "border-transparent bg-red-500 text-slate-50 shadow hover:bg-red-500/80",
        outline: "text-slate-950 border-slate-200",
        teal: "bg-teal-500/10 text-teal-700 border-teal-500/30",
        slate: "bg-slate-900/10 text-slate-900 border-slate-900/20",
        danger: "bg-red-50 text-red-700 border-red-200",
        warning: "bg-amber-50 text-amber-700 border-amber-200",
        success: "bg-emerald-50 text-emerald-700 border-emerald-200",
        info: "bg-sky-50 text-sky-700 border-sky-200",
        neutral: "bg-slate-100 text-slate-700 border-slate-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "teal"
  | "slate"
  | "danger"
  | "warning"
  | "success"
  | "info"
  | "neutral";

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
