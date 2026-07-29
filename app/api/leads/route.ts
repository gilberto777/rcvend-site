import { NextResponse } from "next/server";
import { createLead } from "@/lib/properties";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.name || !body?.phone) {
    return NextResponse.json({ error: "Nome e telefone são obrigatórios." }, { status: 400 });
  }

  const result = await createLead({
    property_id: body.property_id,
    full_name: body.name,
    email: body.email,
    phone: body.phone,
    whatsapp: body.whatsapp ?? body.phone,
    message: body.message,
    source: "site",
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json(result, { status: "mode" in result ? 202 : 200 });
}
