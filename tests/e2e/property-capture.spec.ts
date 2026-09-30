import { test, expect } from "@playwright/test";

test.describe("CIP — Captador Inteligente de Propiedades E2E", () => {
  test("renderiza el formulario de captación híbrido y sus componentes esenciales", async ({ page }) => {
    await page.goto("/propiedades/nueva");

    // Validar título y branding de la aplicación
    await expect(page.locator("header")).toContainText("CIP — Captador Inteligente");

    // Validar Asistente de Voz Inteligente
    await expect(page.locator("text=Asistente de Captura por Voz")).toBeVisible();
    await expect(page.locator("button:has-text('Iniciar Grabación')")).toBeVisible();
    await expect(page.locator("button:has-text('Subir archivo')")).toBeVisible();

    // Validar Campos Principales
    await expect(page.locator("label:has-text('Título de la Publicación')")).toBeVisible();
    await expect(page.locator("label:has-text('Tipo de Inmueble')")).toBeVisible();
    await expect(page.locator("label:has-text('Precio de Venta')")).toBeVisible();
    await expect(page.locator("label:has-text('Dirección Completa')")).toBeVisible();
    await expect(page.locator("label:has-text('Descripción Detallada')")).toBeVisible();

    // Validar Galería de Fotos S3
    await expect(page.locator("text=Galería de Fotos (AWS S3)")).toBeVisible();

    // Validar Botón de Guardado
    const saveButton = page.locator("button:has-text('Guardar Propiedad')");
    await expect(saveButton).toBeVisible();
  });

  test("permite interacción con los campos del formulario", async ({ page }) => {
    await page.goto("/propiedades/nueva");

    // Llenar campos manuales
    await page.fill("#title", "Residencia de Lujo en San Jerónimo");
    await page.selectOption("#property_type", "casa");
    await page.fill("#price", "6500000");
    await page.fill("#address", "Av. San Jerónimo 450, Col. San Jerónimo");
    await page.fill("#land_size", "350");
    await page.fill("#construction_size", "420");
    await page.fill("#bedrooms", "4");
    await page.fill("#bathrooms", "4.5");
    await page.fill("#parking_spots", "3");
    await page.fill("#finishes", "Pisos de mármol Carrara y carpintería fina");
    await page.fill("#description", "Magnífica residencia con alberca, terraza techada y jardín.");

    // Verificar valores establecidos
    await expect(page.locator("#title")).toHaveValue("Residencia de Lujo en San Jerónimo");
    await expect(page.locator("#price")).toHaveValue("6500000");
    await expect(page.locator("#property_type")).toHaveValue("casa");
  });
});
