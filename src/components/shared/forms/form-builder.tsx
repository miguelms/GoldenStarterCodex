"use client";

import React, { useState, useEffect, useMemo, useId, useCallback } from "react";
import { z } from "zod";

export type FormInputType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "select"
  | "textarea"
  | "switch"
  | "date";

export interface FieldConfig {
  name: string;
  label: string;
  type: FormInputType;
  required: boolean;
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
  hidden?: boolean;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  className?: string;
}

export interface FieldOverride {
  label?: string;
  type?: FormInputType;
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
  hidden?: boolean;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  className?: string;
}

export interface FormBuilderProps<T extends Record<string, unknown>> {
  schema: z.ZodObject<z.ZodRawShape>;
  initialValues?: Partial<T>;
  onSubmit: (data: T) => void | Promise<void>;
  onCancel?: () => void;
  title?: string;
  description?: string;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  readOnly?: boolean;
  fieldOverrides?: Record<string, FieldOverride>;
  columns?: 1 | 2;
  className?: string;
  successMessage?: string | null;
  errorMessage?: string | null;
}

function formatLabel(name: string): string {
  // Convert camelCase or snake_case to Title Case
  return name
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

interface InspectedField {
  baseType: string;
  isOptional: boolean;
  isNullable: boolean;
  options: string[];
}

function inspectZodField(field: unknown): InspectedField {
  let curr = field as {
    _def?: {
      type?: string;
      innerType?: unknown;
      entries?: Record<string, string>;
      checks?: unknown[];
    };
    def?: {
      type?: string;
      innerType?: unknown;
    };
    options?: string[];
  };

  let isOptional = false;
  let isNullable = false;

  while (curr) {
    const type = curr._def?.type || curr.def?.type;
    if (type === "optional") {
      isOptional = true;
      curr = (curr._def?.innerType || curr.def?.innerType) as typeof curr;
    } else if (type === "nullable") {
      isNullable = true;
      curr = (curr._def?.innerType || curr.def?.innerType) as typeof curr;
    } else if (type === "default") {
      curr = (curr._def?.innerType || curr.def?.innerType) as typeof curr;
    } else {
      break;
    }
  }

  const baseType = curr?._def?.type || curr?.def?.type || "string";
  let options: string[] = [];

  if (curr?.options && Array.isArray(curr.options)) {
    options = curr.options;
  } else if (curr?._def?.entries && typeof curr._def.entries === "object") {
    options = Object.keys(curr._def.entries);
  }

  return {
    baseType,
    isOptional,
    isNullable,
    options,
  };
}

export function FormBuilder<T extends Record<string, unknown>>({
  schema,
  initialValues = {},
  onSubmit,
  onCancel,
  title,
  description,
  submitLabel = "Guardar",
  cancelLabel = "Cancelar",
  isSubmitting = false,
  readOnly = false,
  fieldOverrides = {},
  columns = 1,
  className = "",
  successMessage,
  errorMessage,
}: FormBuilderProps<T>) {
  const formId = useId();

  // Inspect schema fields
  const fields = useMemo<FieldConfig[]>(() => {
    const rawShape = (schema.shape || {}) as Record<string, unknown>;

    return Object.entries(rawShape).map(([name, fieldDef]) => {
      const override = fieldOverrides[name] || {};
      const inspected = inspectZodField(fieldDef);

      let inferredType: FormInputType = "text";

      if (override.type) {
        inferredType = override.type;
      } else if (inspected.baseType === "boolean") {
        inferredType = "switch";
      } else if (inspected.baseType === "number") {
        inferredType = "number";
      } else if (inspected.baseType === "enum") {
        inferredType = "select";
      } else if (inspected.baseType === "date") {
        inferredType = "date";
      } else {
        const lowerName = name.toLowerCase();
        if (lowerName.includes("email")) {
          inferredType = "email";
        } else if (lowerName.includes("password") || lowerName.includes("secret")) {
          inferredType = "password";
        } else if (
          lowerName.includes("date") ||
          lowerName.endsWith("at") ||
          lowerName.startsWith("date")
        ) {
          inferredType = "date";
        } else if (
          [
            "notes",
            "description",
            "details",
            "comments",
            "reason",
            "bio",
            "summary",
            "address",
          ].some((k) => lowerName.includes(k))
        ) {
          inferredType = "textarea";
        } else {
          inferredType = "text";
        }
      }

      const options =
        override.options ||
        inspected.options.map((opt) => ({
          label: formatLabel(opt),
          value: opt,
        }));

      return {
        name,
        label: override.label || formatLabel(name),
        type: inferredType,
        required: !inspected.isOptional,
        placeholder: override.placeholder || `Ingrese ${formatLabel(name).toLowerCase()}`,
        helperText: override.helperText,
        disabled: override.disabled || readOnly,
        hidden: override.hidden || false,
        options,
        min: override.min,
        max: override.max,
        step: override.step,
        rows: override.rows || 3,
        className: override.className,
      };
    });
  }, [schema, fieldOverrides, readOnly]);

  // Form values state
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const defaults: Record<string, unknown> = {};
    for (const field of fields) {
      if (initialValues[field.name as keyof T] !== undefined) {
        defaults[field.name] = initialValues[field.name as keyof T];
      } else if (field.type === "switch") {
        defaults[field.name] = false;
      } else if (field.type === "select" && field.options && field.options.length > 0) {
        defaults[field.name] = field.required ? field.options[0].value : "";
      } else {
        defaults[field.name] = "";
      }
    }
    return defaults;
  });

  // Track touched fields for error display
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState<boolean>(false);

  // Cast values for Zod safeParse
  const castValues = useCallback(
    (rawValues: Record<string, unknown>): Record<string, unknown> => {
      const casted: Record<string, unknown> = {};
      for (const field of fields) {
        const val = rawValues[field.name];

        if (field.type === "number") {
          if (val === "" || val === undefined || val === null) {
            casted[field.name] = field.required ? NaN : undefined;
          } else {
            casted[field.name] = Number(val);
          }
        } else if (field.type === "switch") {
          casted[field.name] = Boolean(val);
        } else if (field.type === "date") {
          if (val === "" || val === undefined || val === null) {
            casted[field.name] = field.required ? "" : undefined;
          } else {
            // Keep ISO or string date
            casted[field.name] = val;
          }
        } else if (field.type === "select") {
          if (val === "" && !field.required) {
            casted[field.name] = undefined;
          } else {
            casted[field.name] = val;
          }
        } else {
          if (val === "" && !field.required) {
            casted[field.name] = undefined;
          } else {
            casted[field.name] = val;
          }
        }
      }
      return casted;
    },
    [fields],
  );

  // Validate form reactively
  const validateForm = useCallback(
    (
      currentValues: Record<string, unknown>,
    ): { isValid: boolean; newErrors: Record<string, string> } => {
      const casted = castValues(currentValues);
      const parseResult = schema.safeParse(casted);
      const newErrors: Record<string, string> = {};

      if (!parseResult.success) {
        for (const issue of parseResult.error.issues) {
          const fieldKey = String(issue.path[0]);
          if (!newErrors[fieldKey]) {
            newErrors[fieldKey] = issue.message;
          }
        }
      }

      return {
        isValid: parseResult.success,
        newErrors,
      };
    },
    [schema, castValues],
  );

  // Reactive validation computed via useMemo
  const { isValid: isFormValid, newErrors: errors } = useMemo(() => {
    return validateForm(values);
  }, [values, validateForm]);

  const handleChange = (fieldName: string, value: unknown) => {
    setValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleBlur = (fieldName: string) => {
    setTouched((prev) => ({
      ...prev,
      [fieldName]: true,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    // Mark all required fields as touched
    const allTouched: Record<string, boolean> = {};
    for (const f of fields) {
      allTouched[f.name] = true;
    }
    setTouched(allTouched);

    const { isValid } = validateForm(values);

    if (!isValid) {
      // Form is invalid: block submit
      return;
    }

    const casted = castValues(values);
    await onSubmit(casted as T);
  };

  return (
    <div className={`rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm ${className}`}>
      {title && (
        <div className="mb-5 pb-4 border-b border-[#E2E8F0]">
          <h3 className="text-lg font-bold text-[#0B1C30]">{title}</h3>
          {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
        </div>
      )}

      {/* Global alert messages */}
      {successMessage && (
        <div className="mb-4 rounded-xl border border-emerald-300 bg-[#F5FFF6] p-3 text-xs font-semibold text-[#10B981] flex items-center gap-2">
          <span>✓</span> {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 rounded-xl border border-red-300 bg-[#FEE2E2] p-3 text-xs font-semibold text-[#DC2626] flex items-center gap-2">
          <span>⚠</span> {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div
          className={`grid gap-4 ${columns === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}
        >
          {fields
            .filter((f) => !f.hidden)
            .map((field) => {
              const fieldId = `${formId}-${field.name}`;
              const showError =
                (touched[field.name] || hasAttemptedSubmit) && Boolean(errors[field.name]);
              const fieldError = errors[field.name];

              return (
                <div key={field.name} className={`${field.className || ""}`}>
                  {/* Switch / Boolean Layout */}
                  {field.type === "switch" ? (
                    <div className="flex items-center justify-between rounded-xl border border-[#E2E8F0] p-3 bg-slate-50">
                      <div>
                        <label
                          htmlFor={fieldId}
                          className="text-xs font-semibold text-[#0B1C30] cursor-pointer"
                        >
                          {field.label}
                          {field.required && <span className="ml-1 text-[#DC2626]">*</span>}
                        </label>
                        {field.helperText && (
                          <p className="text-[11px] text-slate-500 mt-0.5">{field.helperText}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        id={fieldId}
                        role="switch"
                        aria-checked={Boolean(values[field.name])}
                        disabled={field.disabled}
                        onClick={() => {
                          if (!field.disabled) {
                            handleChange(field.name, !values[field.name]);
                            handleBlur(field.name);
                          }
                        }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 ${
                          values[field.name] ? "bg-[#0D9488]" : "bg-slate-300"
                        } ${field.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            values[field.name] ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  ) : (
                    <div>
                      {/* Standard Label */}
                      <label
                        htmlFor={fieldId}
                        className="block text-xs font-semibold text-[#0B1C30] mb-1"
                      >
                        {field.label}
                        {field.required && <span className="ml-1 text-[#DC2626]">*</span>}
                      </label>

                      {/* Select input */}
                      {field.type === "select" ? (
                        <select
                          id={fieldId}
                          value={String(values[field.name] ?? "")}
                          disabled={field.disabled}
                          onChange={(e) => handleChange(field.name, e.target.value)}
                          onBlur={() => handleBlur(field.name)}
                          className={`w-full rounded-xl border px-3 py-2.5 text-xs font-medium text-slate-900 outline-none transition-all ${
                            showError
                              ? "border-[#DC2626] bg-[#FEE2E2]/30 focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20"
                              : "border-[#E2E8F0] bg-slate-50 focus:border-[#0D9488] focus:bg-white focus:ring-2 focus:ring-[#0D9488]/20"
                          } ${field.disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                          {!field.required && <option value="">-- Seleccionar --</option>}
                          {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : field.type === "textarea" ? (
                        /* Textarea */
                        <textarea
                          id={fieldId}
                          rows={field.rows}
                          value={String(values[field.name] ?? "")}
                          placeholder={field.placeholder}
                          disabled={field.disabled}
                          onChange={(e) => handleChange(field.name, e.target.value)}
                          onBlur={() => handleBlur(field.name)}
                          className={`w-full rounded-xl border px-3 py-2.5 text-xs font-medium text-slate-900 outline-none transition-all resize-y ${
                            showError
                              ? "border-[#DC2626] bg-[#FEE2E2]/30 focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20"
                              : "border-[#E2E8F0] bg-slate-50 focus:border-[#0D9488] focus:bg-white focus:ring-2 focus:ring-[#0D9488]/20"
                          } ${field.disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                        />
                      ) : (
                        /* Text / Email / Password / Number / Date inputs */
                        <input
                          id={fieldId}
                          type={field.type}
                          value={String(values[field.name] ?? "")}
                          placeholder={field.placeholder}
                          disabled={field.disabled}
                          min={field.min}
                          max={field.max}
                          step={field.step}
                          onChange={(e) => handleChange(field.name, e.target.value)}
                          onBlur={() => handleBlur(field.name)}
                          className={`w-full rounded-xl border px-3 py-2.5 text-xs font-medium text-slate-900 outline-none transition-all tabular-nums ${
                            showError
                              ? "border-[#DC2626] bg-[#FEE2E2]/30 focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20"
                              : "border-[#E2E8F0] bg-slate-50 focus:border-[#0D9488] focus:bg-white focus:ring-2 focus:ring-[#0D9488]/20"
                          } ${field.disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                        />
                      )}

                      {/* Helper text or validation error */}
                      {showError ? (
                        <p className="mt-1 text-[11px] font-semibold text-[#DC2626] flex items-center gap-1">
                          <span>●</span> {fieldError}
                        </p>
                      ) : field.helperText ? (
                        <p className="mt-1 text-[11px] text-slate-500">{field.helperText}</p>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* Action Buttons */}
        {!readOnly && (
          <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors disabled:opacity-50"
              >
                {cancelLabel}
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting || (!isFormValid && hasAttemptedSubmit)}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all ${
                !isFormValid && hasAttemptedSubmit
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-[#0D9488] hover:bg-[#0F766E] active:bg-[#115E59]"
              } disabled:opacity-50`}
            >
              {isSubmitting && (
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              {submitLabel}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
