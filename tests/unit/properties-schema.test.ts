import { describe, expect, it } from "vitest";
import {
  propertyCreateSchema,
  normalizeVoiceData,
  propertyTypeSchema,
  currencySchema,
} from "@starter/contracts";

describe("CIP — Property Contracts and Zod Validation", () => {
  it("valida exitosamente un payload completo de creación de propiedad", () => {
    const validPayload = {
      title: "Residencia en Las Lomas",
      property_type: "casa",
      price: 4500000,
      currency: "MXN",
      address: "Paseo de las Lomas 1420",
      GPS_Loc: "19.432608, -99.133209",
      land_size: 250,
      construction_size: 310,
      bedrooms: 3,
      bathrooms: 3.5,
      parking_spots: 2,
      finishes: "Mármol y granito",
      description: "Excelente propiedad con amplios espacios y acabados de lujo.",
      raw_audio_s3_key: "properties/audios/123-audio.webm",
      transcription: "Texto transcrito de prueba",
      images: ["properties/images/img1.jpg", "properties/images/img2.jpg"],
    };

    const result = propertyCreateSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Residencia en Las Lomas");
      expect(result.data.price).toBe(4500000);
      expect(result.data.property_type).toBe("casa");
      expect(result.data.images).toHaveLength(2);
    }
  });

  it("rechaza propiedades con título demasiado corto o campos obligatorios faltantes", () => {
    const invalidPayload = {
      title: "Ab", // Demasiado corto (min 3)
      property_type: "casa",
      price: -100, // Precio no positivo
      address: "", // Dirección vacía
      description: "Cort", // Descripción menor a 5 caracteres
    };

    const result = propertyCreateSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      expect(fieldErrors.title).toBeDefined();
      expect(fieldErrors.price).toBeDefined();
      expect(fieldErrors.address).toBeDefined();
      expect(fieldErrors.description).toBeDefined();
    }
  });

  it("valida los tipos de propiedades permitidos", () => {
    expect(propertyTypeSchema.safeParse("casa").success).toBe(true);
    expect(propertyTypeSchema.safeParse("departamento").success).toBe(true);
    expect(propertyTypeSchema.safeParse("terreno").success).toBe(true);
    expect(propertyTypeSchema.safeParse("comercial").success).toBe(true);
    expect(propertyTypeSchema.safeParse("rancho_invalido").success).toBe(false);
  });

  it("valida las monedas permitidas y asigna MXN por defecto", () => {
    expect(currencySchema.safeParse("MXN").success).toBe(true);
    expect(currencySchema.safeParse("USD").success).toBe(true);
    expect(currencySchema.safeParse("EUR").success).toBe(false);

    const partialPayload = {
      title: "Terreno Campestre",
      property_type: "terreno",
      price: "1200000", // Coerción de string a number
      address: "Carretera Nacional Km 45",
      description: "Excelente terreno campestre plano listo para construir.",
    };

    const parsed = propertyCreateSchema.safeParse(partialPayload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.currency).toBe("MXN");
      expect(parsed.data.price).toBe(1200000);
    }
  });
});

describe("CIP — normalizeVoiceData Function", () => {
  it("normaliza y limpia datos sin procesar devueltos por Whisper / LLM", () => {
    const rawAiOutput = {
      title: "  Departamento en Renta Roma Norte  ",
      property_type: "DEPARTAMENTO",
      price: "28500",
      currency: "mxn",
      address: "Colima 120, Roma Norte",
      GPS_Loc: "19.4187, -99.1622",
      land_size: "95",
      construction_size: "95",
      bedrooms: "2.0",
      bathrooms: "2",
      parking_spots: "1",
      finishes: "Piso de madera de ingeniería",
      description: "Hermoso departamento iluminado con balcón exterior.",
      transcription: "Hola, captamos departamento en renta en Colima 120...",
    };

    const normalized = normalizeVoiceData(rawAiOutput);

    expect(normalized.title).toBe("Departamento en Renta Roma Norte");
    expect(normalized.property_type).toBe("departamento");
    expect(normalized.price).toBe(28500);
    expect(normalized.currency).toBe("MXN");
    expect(normalized.address).toBe("Colima 120, Roma Norte");
    expect(normalized.bedrooms).toBe(2);
    expect(normalized.bathrooms).toBe(2);
    expect(normalized.parking_spots).toBe(1);
    expect(normalized.land_size).toBe(95);
    expect(normalized.transcription).toContain("Colima 120");
  });

  it("ignora campos vacíos, nulos o no válidos sin arrojar errores", () => {
    const corruptedAiOutput = {
      title: "X", // Demasiado corto, debe ignorarse
      property_type: "nave_industrial_no_soportada",
      price: "gratis", // No numérico
      bedrooms: null,
      address: null,
    };

    const normalized = normalizeVoiceData(corruptedAiOutput);

    expect(normalized.title).toBeUndefined();
    expect(normalized.property_type).toBeUndefined();
    expect(normalized.price).toBeUndefined();
    expect(normalized.bedrooms).toBeUndefined();
    expect(normalized.address).toBeUndefined();
  });

  it("devuelve un objeto vacío si recibe entrada null o no objeto", () => {
    expect(normalizeVoiceData(null)).toEqual({});
    expect(normalizeVoiceData(undefined)).toEqual({});
    expect(normalizeVoiceData("string_invalido")).toEqual({});
    expect(normalizeVoiceData(42)).toEqual({});
  });
});
