import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-b from-background to-surface p-6">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-red-100 p-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <h1 className="text-3xl font-black text-brand-strong">Acesso Negado</h1>

        <p className="mt-3 text-muted">
          Sua conta existe, mas você não tem permissão para acessar a área administrativa do RC Vend.
        </p>

        <p className="mt-4 text-sm text-muted">
          Se você é um corretor ou imobiliária, aguarde a aprovação da administração. Você receberá um e-mail de confirmação.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-3 font-black text-white hover:bg-brand-strong transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para home
          </Link>

          <form action="/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full rounded-2xl border border-line px-5 py-3 font-black text-brand hover:bg-background transition-colors"
            >
              Fazer logout
            </button>
          </form>
        </div>

        <p className="mt-6 text-xs text-muted">
          Dúvidas? Entre em contato pelo{' '}
          <a
            href="https://wa.me/5511970259728"
            target="_blank"
            rel="noopener noreferrer"
            className="font-black text-brand hover:underline"
          >
            WhatsApp
          </a>
        </p>
      </div>
    </main>
  );
}
