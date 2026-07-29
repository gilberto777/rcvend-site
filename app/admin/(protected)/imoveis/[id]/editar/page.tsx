import Link from "next/link";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { getProperties } from "@/lib/properties";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPropertyPage({ params }: PageProps) {
  const { id } = await params;
  const properties = await getProperties();
  const property = properties.find((item) => item.id === id) ?? null;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/imoveis" className="font-bold text-brand">Voltar para imóveis</Link>
        <h2 className="mt-3 text-3xl font-black md:text-4xl">Editar imóvel</h2>
        <p className="mt-2 text-muted">Atualize informações comerciais, imagens, características e publicação do imóvel.</p>
      </div>
      <PropertyForm initialProperty={property} />
    </div>
  );
}
