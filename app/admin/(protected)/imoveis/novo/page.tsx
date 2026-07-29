import Link from "next/link";
import { PropertyForm } from "@/components/admin/PropertyForm";

export default function NewPropertyPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/imoveis" className="font-bold text-brand">Voltar para imóveis</Link>
        <h2 className="mt-3 text-3xl font-black md:text-4xl">Cadastrar imóvel</h2>
        <p className="mt-2 text-muted">Preencha os blocos comerciais, fotos, SEO e publicação.</p>
      </div>
      <PropertyForm />
    </div>
  );
}
