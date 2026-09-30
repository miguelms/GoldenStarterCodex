"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  DollarSign,
  Maximize2,
  Bed,
  Bath,
  Car,
  FileText,
  Save,
  ArrowLeft,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Home,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VoiceAssistantCapture } from "@/components/properties/voice-assistant-capture";
import { ImageUploader } from "@/components/properties/image-uploader";
import { propertyCreateSchema, type PropertyCreateInput } from "@starter/contracts";

export default function NuevaPropiedadPage() {
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState<Partial<PropertyCreateInput>>({
    title: "",
    property_type: "casa",
    price: undefined,
    currency: "MXN",
    address: "",
    GPS_Loc: "",
    land_size: undefined,
    construction_size: undefined,
    bedrooms: undefined,
    bathrooms: undefined,
    parking_spots: undefined,
    finishes: "",
    description: "",
    raw_audio_s3_key: "",
    transcription: "",
    images: [],
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [createdPropertyId, setCreatedPropertyId] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Helper para actualizar campos
  const updateField = (field: keyof PropertyCreateInput, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Limpiar error de validación cuando el usuario edita
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  // Obtener geolocalización actual
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("La geolocalización no está disponible en tu navegador.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
        updateField("GPS_Loc", coords);
      },
      (err) => {
        console.warn("Error obteniendo ubicación:", err.message);
        alert("No se pudo obtener la ubicación GPS.");
      },
      { timeout: 8000 }
    );
  };

  // Aplicar datos extraídos por el asistente de voz
  const handleApplyVoiceData = (
    updatedFields: Partial<PropertyCreateInput>,
    rawAudioKey: string,
    transcriptionText: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      ...updatedFields,
      raw_audio_s3_key: rawAudioKey || prev.raw_audio_s3_key,
      transcription: transcriptionText || prev.transcription,
      // Si la descripción está vacía, rellenar con la descripción de la IA o transcripción
      description: prev.description?.trim() ? prev.description : (updatedFields.description || transcriptionText || prev.description),
    }));
  };

  // Guardado de la propiedad en PostgreSQL 18 vía Drizzle ORM
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setValidationErrors({});

    // Validar con Zod en el cliente antes de enviar
    const parseResult = propertyCreateSchema.safeParse(formData);
    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      parseResult.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as string;
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });
      setValidationErrors(fieldErrors);
      setGeneralError("Por favor completa los campos obligatorios marcados en rojo.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parseResult.data),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Error al persistir la propiedad en el servidor");
      }

      setSubmitSuccess(true);
      setCreatedPropertyId(json.data?.id || "ok");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error inesperado al guardar";
      setGeneralError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-slate-900">
        <div className="mx-auto max-w-xl">
          <Card className="border-emerald-200 bg-white p-8 text-center shadow-lg dark:border-emerald-900 dark:bg-slate-950">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
              ¡Propiedad Registrada Exitosamente!
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              La propiedad <strong>{formData.title}</strong> ha sido persistida en PostgreSQL 18
              con sus metadatos de fotos y audio en AWS S3.
            </p>
            {createdPropertyId && (
              <Badge variant="outline" className="mt-3 font-mono text-xs">
                ID: {createdPropertyId}
              </Badge>
            )}

            <div className="mt-6 flex justify-center gap-3">
              <Link href="/propiedades">
                <Button variant="outline">Ver Listado de Propiedades</Button>
              </Link>
              <Button
                onClick={() => {
                  setSubmitSuccess(false);
                  setFormData({
                    title: "",
                    property_type: "casa",
                    price: undefined,
                    currency: "MXN",
                    address: "",
                    GPS_Loc: "",
                    land_size: undefined,
                    construction_size: undefined,
                    bedrooms: undefined,
                    bathrooms: undefined,
                    parking_spots: undefined,
                    finishes: "",
                    description: "",
                    raw_audio_s3_key: "",
                    transcription: "",
                    images: [],
                  });
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Captar Otra Propiedad
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 dark:bg-slate-950">
      {/* Header Superior */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/propiedades">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  CIP — Captador Inteligente
                </span>
                <Badge variant="outline" className="text-[10px] text-indigo-600 border-indigo-200">
                  BFF + IA Híbrida
                </Badge>
              </div>
              <p className="text-xs text-slate-500">Alta de nueva propiedad inmobiliaria</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/propiedades">
              <Button variant="outline" size="sm">
                Cancelar
              </Button>
            </Link>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
            >
              <Save className="mr-1.5 h-4 w-4" />
              {isSubmitting ? "Guardando en BD..." : "Guardar Propiedad"}
            </Button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="mx-auto max-w-5xl px-4 pt-6 sm:px-6 space-y-6">
        {/* Banner de Error General */}
        {generalError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-start gap-3 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">No se pudo guardar la propiedad:</p>
              <p className="mt-0.5 text-xs">{generalError}</p>
            </div>
          </div>
        )}

        {/* 1. ASISTENTE DE VOZ COMPLEMENTARIO (Dictado / Audio) */}
        <VoiceAssistantCapture
          currentValues={formData}
          onApplyVoiceData={handleApplyVoiceData}
        />

        {/* 2. FORMULARIO PRINCIPAL */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card: Datos Principales y Tipo */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Home className="h-4 w-4 text-indigo-600" /> Datos Generales de la Propiedad
              </CardTitle>
              <CardDescription className="text-xs">
                Información básica de comercialización y clasificación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Título */}
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs">
                  Título de la Publicación <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Ej. Hermosa Residencia en Paseo de las Lomas con Alberca"
                  value={formData.title || ""}
                  onChange={(e) => updateField("title", e.target.value)}
                  className={validationErrors.title ? "border-red-500" : ""}
                />
                {validationErrors.title && (
                  <p className="text-[11px] text-red-500">{validationErrors.title}</p>
                )}
              </div>

              {/* Tipo de Propiedad y Moneda / Precio */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Tipo de Propiedad */}
                <div className="space-y-1.5">
                  <Label htmlFor="property_type" className="text-xs">
                    Tipo de Inmueble <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="property_type"
                    value={formData.property_type || "casa"}
                    onChange={(e) => updateField("property_type", e.target.value)}
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <option value="casa">Casa</option>
                    <option value="departamento">Departamento</option>
                    <option value="terreno">Terreno</option>
                    <option value="comercial">Local / Comercial</option>
                  </select>
                </div>

                {/* Precio */}
                <div className="space-y-1.5">
                  <Label htmlFor="price" className="text-xs">
                    Precio de Venta <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="price"
                      type="number"
                      placeholder="3500000"
                      value={formData.price !== undefined ? formData.price : ""}
                      onChange={(e) =>
                        updateField("price", e.target.value ? Number(e.target.value) : undefined)
                      }
                      className={`pl-8 ${validationErrors.price ? "border-red-500" : ""}`}
                    />
                  </div>
                  {validationErrors.price && (
                    <p className="text-[11px] text-red-500">{validationErrors.price}</p>
                  )}
                </div>

                {/* Moneda */}
                <div className="space-y-1.5">
                  <Label htmlFor="currency" className="text-xs">
                    Moneda
                  </Label>
                  <select
                    id="currency"
                    value={formData.currency || "MXN"}
                    onChange={(e) => updateField("currency", e.target.value)}
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <option value="MXN">MXN (Pesos Mexicanos)</option>
                    <option value="USD">USD (Dólares Americanos)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card: Ubicación y GPS */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-indigo-600" /> Ubicación y Geolocalización
              </CardTitle>
              <CardDescription className="text-xs">
                Dirección exacta y coordenadas para mapeo y visitas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-xs">
                  Dirección Completa <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="address"
                  placeholder="Calle, número exterior/interior, colonia, municipio o alcaldía"
                  value={formData.address || ""}
                  onChange={(e) => updateField("address", e.target.value)}
                  className={validationErrors.address ? "border-red-500" : ""}
                />
                {validationErrors.address && (
                  <p className="text-[11px] text-red-500">{validationErrors.address}</p>
                )}
              </div>

              {/* Coordenadas GPS */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="GPS_Loc" className="text-xs">
                    Coordenadas GPS (Latitud, Longitud)
                  </Label>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <Navigation className="h-3 w-3" /> Capturar GPS de mi teléfono/PC
                  </button>
                </div>
                <Input
                  id="GPS_Loc"
                  placeholder="19.432608, -99.133209"
                  value={formData.GPS_Loc || ""}
                  onChange={(e) => updateField("GPS_Loc", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Card: Superficies y Espacios */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Maximize2 className="h-4 w-4 text-indigo-600" /> Superficies y Distribución
              </CardTitle>
              <CardDescription className="text-xs">
                Metros cuadrados y cantidad de ambientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {/* Terreno */}
                <div className="space-y-1.5">
                  <Label htmlFor="land_size" className="text-xs">
                    Terreno (m²)
                  </Label>
                  <Input
                    id="land_size"
                    type="number"
                    placeholder="250"
                    value={formData.land_size ?? ""}
                    onChange={(e) =>
                      updateField("land_size", e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                </div>

                {/* Construcción */}
                <div className="space-y-1.5">
                  <Label htmlFor="construction_size" className="text-xs">
                    Construcción (m²)
                  </Label>
                  <Input
                    id="construction_size"
                    type="number"
                    placeholder="310"
                    value={formData.construction_size ?? ""}
                    onChange={(e) =>
                      updateField(
                        "construction_size",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                  />
                </div>

                {/* Recámaras */}
                <div className="space-y-1.5">
                  <Label htmlFor="bedrooms" className="text-xs flex items-center gap-1">
                    <Bed className="h-3 w-3 text-slate-500" /> Recámaras
                  </Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    placeholder="3"
                    value={formData.bedrooms ?? ""}
                    onChange={(e) =>
                      updateField("bedrooms", e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                </div>

                {/* Baños */}
                <div className="space-y-1.5">
                  <Label htmlFor="bathrooms" className="text-xs flex items-center gap-1">
                    <Bath className="h-3 w-3 text-slate-500" /> Baños
                  </Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    step="0.5"
                    placeholder="2.5"
                    value={formData.bathrooms ?? ""}
                    onChange={(e) =>
                      updateField("bathrooms", e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-1">
                {/* Estacionamientos */}
                <div className="space-y-1.5">
                  <Label htmlFor="parking_spots" className="text-xs flex items-center gap-1">
                    <Car className="h-3 w-3 text-slate-500" /> Lugares de Estacionamiento
                  </Label>
                  <Input
                    id="parking_spots"
                    type="number"
                    placeholder="2"
                    value={formData.parking_spots ?? ""}
                    onChange={(e) =>
                      updateField(
                        "parking_spots",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                  />
                </div>

                {/* Acabados */}
                <div className="space-y-1.5">
                  <Label htmlFor="finishes" className="text-xs">
                    Acabados y Materiales
                  </Label>
                  <Input
                    id="finishes"
                    placeholder="Pisos de mármol, carpintería de nogal, granito en cocina"
                    value={formData.finishes || ""}
                    onChange={(e) => updateField("finishes", e.target.value)}
                  />
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-1.5 pt-2">
                <Label htmlFor="description" className="text-xs flex items-center gap-1">
                  <FileText className="h-3 w-3 text-slate-500" /> Descripción Detallada y Notas <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="Describe las amenidades, estado de conservación, orientación, etc."
                  value={formData.description || ""}
                  onChange={(e) => updateField("description", e.target.value)}
                  className={validationErrors.description ? "border-red-500" : ""}
                />
                {validationErrors.description && (
                  <p className="text-[11px] text-red-500">{validationErrors.description}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 3. CARGA DE FOTOGRAFÍAS A S3 CON PROCESAMIENTO EN FLASK */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-indigo-600" /> Galería de Fotos (AWS S3)
              </CardTitle>
              <CardDescription className="text-xs">
                Las imágenes se envían a S3 y el satélite Flask extrae sus dimensiones de forma síncrona
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader
                images={formData.images || []}
                onChange={(newImages) => updateField("images", newImages)}
              />
            </CardContent>
          </Card>

          {/* Botón Final */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/propiedades">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[160px]"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Guardando en PostgreSQL..." : "Guardar Propiedad"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
