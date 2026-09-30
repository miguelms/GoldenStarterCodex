"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, X, Image as ImageIcon, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ImageMetadataItem } from "@starter/contracts";

interface ImageUploaderProps {
  images: string[];
  onChange: (newImages: string[]) => void;
}

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [imageMetadata, setImageMetadata] = useState<Record<string, ImageMetadataItem>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newS3Keys: string[] = [];

    try {
      // 1. Subida múltiple a S3
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file, file.name);
        formData.append("category", "property_photos");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const json = await res.json();
          if (json.s3Key) {
            newS3Keys.push(json.s3Key);
          }
        }
      }

      if (newS3Keys.length > 0) {
        // 2. Notificación síncrona a Flask para extraer metadatos y dimensiones
        try {
          const processRes = await fetch("/api/ai/images/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ s3_keys: newS3Keys }),
          });

          if (processRes.ok) {
            const processJson = await processRes.json();
            const metaMap: Record<string, ImageMetadataItem> = { ...imageMetadata };
            (processJson.images as ImageMetadataItem[]).forEach((item) => {
              metaMap[item.s3_key] = item;
            });
            setImageMetadata(metaMap);
          }
        } catch (aiErr) {
          console.warn("Extracción de dimensiones de Flask omitida o falló:", aiErr);
        }

        onChange([...images, ...newS3Keys]);
      }
    } catch (err) {
      console.error("Error al procesar lote de imágenes:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (keyToRemove: string) => {
    onChange(images.filter((k) => k !== keyToRemove));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
          <ImageIcon className="h-4 w-4 text-indigo-600" />
          Fotografías de la Propiedad ({images.length})
        </label>
        {isUploading && (
          <Badge variant="secondary" className="flex items-center gap-1 text-xs">
            <RefreshCw className="h-3 w-3 animate-spin" /> Subiendo y optimizando en S3...
          </Badge>
        )}
      </div>

      {/* Zona de Arrastre / Selección */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/60 p-6 text-center hover:border-indigo-400 hover:bg-indigo-50/20 cursor-pointer transition-colors dark:border-slate-800 dark:bg-slate-900/40"
      >
        <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Haz clic o arrastra fotos de la propiedad aquí
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Formatos compatibles: JPG, PNG, WEBP (Hasta 50MB por imagen)
        </p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFiles}
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
        />
      </div>

      {/* Galería de Miniaturas */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 pt-2">
          {images.map((key, idx) => {
            const meta = imageMetadata[key];
            const filename = key.split("/").pop() || `Foto ${idx + 1}`;
            return (
              <div
                key={key}
                className="group relative rounded-lg border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="flex aspect-video w-full items-center justify-center rounded-md bg-slate-100 text-slate-400 overflow-hidden relative dark:bg-slate-900">
                  <ImageIcon className="h-8 w-8 opacity-40" />
                  <span className="absolute bottom-1 right-1 text-[10px] bg-slate-900/70 text-white px-1 rounded">
                    #{idx + 1}
                  </span>
                </div>

                <div className="mt-2 space-y-1">
                  <p className="truncate text-xs font-medium text-slate-800 dark:text-slate-200" title={filename}>
                    {filename}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>{meta?.width ? `${meta.width}x${meta.height}` : "S3 Key"}</span>
                    <span className="flex items-center text-emerald-600 gap-0.5">
                      <CheckCircle className="h-2.5 w-2.5" /> S3
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeImage(key)}
                  className="absolute -top-1.5 -right-1.5 rounded-full bg-red-600 p-1 text-white shadow hover:bg-red-700 focus:outline-none"
                  title="Eliminar foto"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
