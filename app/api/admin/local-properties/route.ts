import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import {
  hasValidLocalAdminSession,
  isLocalAdminEnabled,
} from "@/lib/admin/local-auth";
import type { Property } from "@/types/property";

export const dynamic = "force-dynamic";

const catalogPath = path.join(process.cwd(), "data", "properties.json");

export async function GET() {
  if (!isLocalAdminEnabled() || !(await hasValidLocalAdminSession())) {
    return NextResponse.json(
      { error: "Sessão administrativa inválida." },
      { status: 401 },
    );
  }

  try {
    const properties = JSON.parse(
      await readFile(catalogPath, "utf8"),
    ) as Property[];

    return NextResponse.json(
      { properties },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Não foi possível carregar o catálogo local." },
      { status: 500 },
    );
  }
}
