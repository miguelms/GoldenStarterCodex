import { NextResponse } from "next/server";
import { db } from "@/db";
import { properties as propertiesTable, auditLogs } from "@/db/schema";
import { propertyCreateSchema, type Property } from "@starter/contracts";
import { getRequestContext } from "@/server/auth";
import { getStore } from "@/server/store";
import { desc, eq } from "drizzle-orm";

export async function POST(request: Request) {
  const context = getRequestContext(request);

  try {
    const rawBody = await request.json().catch(() => ({}));
    const parseResult = propertyCreateSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          code: "VALIDATION_ERROR",
          message: "Los datos de la propiedad son inválidos",
          errors: parseResult.error.flatten(),
          requestId: context.requestId,
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const propertyId = crypto.randomUUID();
    const now = new Date();

    const newPropertyRecord = {
      id: propertyId,
      organizationId: context.organizationId,
      userId: context.userId,
      title: data.title,
      propertyType: data.property_type,
      price: data.price.toString(),
      currency: data.currency,
      address: data.address,
      gpsLoc: data.GPS_Loc || null,
      landSize: data.land_size ? data.land_size.toString() : null,
      constructionSize: data.construction_size ? data.construction_size.toString() : null,
      bedrooms: data.bedrooms ?? null,
      bathrooms: data.bathrooms ? data.bathrooms.toString() : null,
      parkingSpots: data.parking_spots ?? null,
      finishes: data.finishes || null,
      description: data.description,
      rawAudioS3Key: data.raw_audio_s3_key || null,
      transcription: data.transcription || null,
      images: data.images,
      createdAt: now,
      updatedAt: now,
    };

    let persistedProperty: Property;

    try {
      // 1. Persistencia primaria en PostgreSQL 18 mediante Drizzle ORM
      const [inserted] = await db.insert(propertiesTable).values(newPropertyRecord).returning();

      // Registro de Auditoría estricto (Append-Only)
      await db.insert(auditLogs).values({
        organizationId: context.organizationId,
        userId: context.userId,
        action: "create",
        entityType: "property",
        entityId: inserted.id,
        metadata: {
          title: inserted.title,
          price: inserted.price,
          currency: inserted.currency,
          hasAudio: !!inserted.rawAudioS3Key,
          imagesCount: inserted.images.length,
        },
      });

      persistedProperty = {
        id: inserted.id,
        organizationId: inserted.organizationId,
        userId: inserted.userId,
        title: inserted.title,
        property_type: inserted.propertyType as Property["property_type"],
        price: Number(inserted.price),
        currency: inserted.currency as Property["currency"],
        address: inserted.address,
        GPS_Loc: inserted.gpsLoc || "",
        land_size: inserted.landSize ? Number(inserted.landSize) : null,
        construction_size: inserted.constructionSize ? Number(inserted.constructionSize) : null,
        bedrooms: inserted.bedrooms,
        bathrooms: inserted.bathrooms ? Number(inserted.bathrooms) : null,
        parking_spots: inserted.parkingSpots,
        finishes: inserted.finishes,
        description: inserted.description,
        raw_audio_s3_key: inserted.rawAudioS3Key,
        transcription: inserted.transcription,
        images: inserted.images,
        createdAt: inserted.createdAt.toISOString(),
        updatedAt: inserted.updatedAt.toISOString(),
      };
    } catch (dbErr) {
      // Resiliencia para testing o desarrollo local sin contenedor PostgreSQL activo
      console.warn("PostgreSQL directo inaccesible, persistiendo en store de desarrollo:", dbErr);
      const fallbackProperty: Property = {
        id: propertyId,
        organizationId: context.organizationId,
        userId: context.userId,
        title: data.title,
        property_type: data.property_type,
        price: data.price,
        currency: data.currency,
        address: data.address,
        GPS_Loc: data.GPS_Loc || "",
        land_size: data.land_size ?? null,
        construction_size: data.construction_size ?? null,
        bedrooms: data.bedrooms ?? null,
        bathrooms: data.bathrooms ?? null,
        parking_spots: data.parking_spots ?? null,
        finishes: data.finishes || null,
        description: data.description,
        raw_audio_s3_key: data.raw_audio_s3_key || null,
        transcription: data.transcription || null,
        images: data.images,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      getStore().saveProperty(fallbackProperty);
      persistedProperty = fallbackProperty;
    }

    return NextResponse.json(
      {
        success: true,
        data: persistedProperty,
        requestId: context.requestId,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error inesperado al guardar propiedad";
    return NextResponse.json(
      {
        code: "PROPERTY_CREATION_FAILED",
        message,
        requestId: context.requestId,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const context = getRequestContext(request);
  const url = new URL(request.url);
  const typeFilter = url.searchParams.get("type");
  const search = url.searchParams.get("search")?.toLowerCase();

  try {
    let propertiesList: Property[] = [];

    try {
      const records = await db
        .select()
        .from(propertiesTable)
        .where(eq(propertiesTable.organizationId, context.organizationId))
        .orderBy(desc(propertiesTable.createdAt));

      propertiesList = records.map((r) => ({
        id: r.id,
        organizationId: r.organizationId,
        userId: r.userId,
        title: r.title,
        property_type: r.propertyType as Property["property_type"],
        price: Number(r.price),
        currency: r.currency as Property["currency"],
        address: r.address,
        GPS_Loc: r.gpsLoc || "",
        land_size: r.landSize ? Number(r.landSize) : null,
        construction_size: r.constructionSize ? Number(r.constructionSize) : null,
        bedrooms: r.bedrooms,
        bathrooms: r.bathrooms ? Number(r.bathrooms) : null,
        parking_spots: r.parkingSpots,
        finishes: r.finishes,
        description: r.description,
        raw_audio_s3_key: r.rawAudioS3Key,
        transcription: r.transcription,
        images: r.images,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    } catch {
      propertiesList = getStore().listProperties(context.organizationId);
    }

    // Filtrado en memoria si aplica
    if (typeFilter) {
      propertiesList = propertiesList.filter((p) => p.property_type === typeFilter);
    }
    if (search) {
      propertiesList = propertiesList.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          p.address.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search)
      );
    }

    return NextResponse.json(
      {
        success: true,
        items: propertiesList,
        totalCount: propertiesList.length,
        page: 1,
        pageSize: 50,
        hasMore: false,
        requestId: context.requestId,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al obtener propiedades";
    return NextResponse.json(
      {
        code: "PROPERTIES_FETCH_FAILED",
        message,
        requestId: context.requestId,
      },
      { status: 500 }
    );
  }
}
