import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import {
  hasValidLocalAdminSession,
  isLocalAdminEnabled,
} from "@/lib/admin/local-auth";
import type { Property } from "@/types/property";

const catalogPath = path.join(process.cwd(), "data", "properties.json");

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isLocalAdminEnabled() || !(await hasValidLocalAdminSession())) {
    return NextResponse.json(
      { error: "Sessão administrativa inválida." },
      { status: 401 },
    );
  }

  const { id } = await context.params;

  try {
    const properties = JSON.parse(
      await readFile(catalogPath, "utf8"),
    ) as Property[];
    const remainingProperties = properties.filter(
      (property) => property.id !== id,
    );

    if (remainingProperties.length === properties.length) {
      return NextResponse.json(
        { error: "Imóvel não encontrado." },
        { status: 404 },
      );
    }

    await writeFile(
      catalogPath,
      `${JSON.stringify(remainingProperties, null, 2)}\n`,
      "utf8",
    );

    return NextResponse.json({
      ok: true,
      remaining: remainingProperties.length,
    });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível excluir o imóvel do catálogo local." },
      { status: 500 },
    );
  }
}
