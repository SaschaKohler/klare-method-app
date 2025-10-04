import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import { config as loadEnv } from "dotenv";
import { join } from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

// Lädt optional eine .env.test Datei aus dem Projekt-Root sowie aus dem aktuellen Verzeichnis
loadEnv({ path: join(process.cwd(), ".env.test"), override: false });
loadEnv({ path: join(__dirname, ".env.test"), override: false });

type RawLifeWheelArea = {
  id: string;
  user_id: string;
  name: string;
  current_value: number;
  target_value: number;
  notes: string | null;
  improvement_actions: string[] | null;
  priority_level: number | null;
  translations: Record<string, unknown> | null;
  created_at: string | Date | null;
  updated_at: string | Date | null;
};

type TestContext = {
  supabase: SupabaseClient;
  recordId: string;
  userId: string;
};

const normalizeTimestamp = (value: string | Date | null | undefined): string => {
  if (value == null) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "object") {
    const maybeIso = (value as { toISOString?: () => string }).toISOString?.();
    if (typeof maybeIso === "string") {
      return maybeIso;
    }
    const maybeString = (value as { toString?: () => string }).toString?.();
    if (typeof maybeString === "string") {
      return maybeString;
    }
  }
  throw new Error(`Unerwarteter Zeitstempel-Typ: ${typeof value}`);
};

const shouldRunDbTests = process.env.RUN_DB_TESTS === "true";

describe("life_wheel_areas integration", () => {
  if (!shouldRunDbTests) {
    test.skip("Integrationstests sind deaktiviert (RUN_DB_TESTS !== 'true')", () => {
      /* intentionally skipped */
    });
    return;
  }

  const requiredEnvVars = ["SUPABASE_TEST_URL", "SUPABASE_TEST_SERVICE_KEY"] as const;
  const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

  if (missingVars.length > 0) {
    throw new Error(
      `Fehlende Umgebungsvariablen für DB-Tests: ${missingVars.join(", ")}. Bitte .env.test prüfen.`,
    );
  }

  const context: TestContext = {
    supabase: createClient(
      process.env.SUPABASE_TEST_URL!,
      process.env.SUPABASE_TEST_SERVICE_KEY!,
      { auth: { persistSession: false } },
    ),
    recordId: `integration-${randomUUID()}`,
    userId: `integration-user-${randomUUID()}`,
  };

  beforeAll(async () => {
    await context.supabase.from("life_wheel_areas").delete().eq("id", context.recordId);

    const { error } = await context.supabase.from("life_wheel_areas").insert({
      id: context.recordId,
      user_id: context.userId,
      name: "health_fitness",
      current_value: 6,
      target_value: 8,
      notes: "Integrationstest",
      improvement_actions: null,
      priority_level: 2,
      translations: null,
    });

    if (error) {
      throw new Error(`Fehler beim Anlegen der Testdaten: ${error.message}`);
    }
  });

  afterAll(async () => {
    await context.supabase.from("life_wheel_areas").delete().eq("id", context.recordId);
  });

  test("liefert vollständige Datensätze mit allen erwarteten Feldern", async () => {
    const { data, error } = await context.supabase
      .from("life_wheel_areas")
      .select(
        "id, user_id, name, current_value, target_value, notes, improvement_actions, priority_level, translations, created_at, updated_at",
      )
      .eq("id", context.recordId)
      .single<RawLifeWheelArea>();

    expect(error).toBeNull();
    expect(data).toBeDefined();

    const record = data as RawLifeWheelArea;
    expect(record.id).toBe(context.recordId);
    expect(record.user_id).toBe(context.userId);
    expect(record.name).toBe("health_fitness");
    expect(typeof record.current_value).toBe("number");
    expect(typeof record.target_value).toBe("number");
    expect(record.notes).toBe("Integrationstest");
    expect(record.priority_level).toBe(2);
    expect(record.improvement_actions).toBeNull();
    expect(record.translations).toBeNull();
    expect(() => normalizeTimestamp(record.created_at)).not.toThrow();
    expect(() => normalizeTimestamp(record.updated_at)).not.toThrow();
  });

  test("aktualisiert current_value und übernimmt Änderungen in der Datenbank", async () => {
    const updatedValue = 7;

    const { error: updateError } = await context.supabase
      .from("life_wheel_areas")
      .update({ current_value: updatedValue })
      .eq("id", context.recordId);

    expect(updateError).toBeNull();

    const { data, error } = await context.supabase
      .from("life_wheel_areas")
      .select("id, current_value, updated_at")
      .eq("id", context.recordId)
      .single<Pick<RawLifeWheelArea, "id" | "current_value" | "updated_at">>();

    expect(error).toBeNull();
    expect(data?.current_value).toBe(updatedValue);
    expect(() => normalizeTimestamp(data!.updated_at)).not.toThrow();
  });
});
