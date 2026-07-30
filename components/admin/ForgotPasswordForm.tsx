"use client";

import Link from "next/link";
import { useState } from "react";
import { getAuthErrorMessage } from "@/lib/admin/auth-error-message";
import { createSupabaseClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createSupabaseClient();
    if (!supabase) {
      setError("O RC Vend está usando acesso local. Para redefinir a senha, altere LOCAL_ADMIN_PASSWORD no arquivo .env.local e reinicie o servidor.");
      setLoading(false);
      return;
    }

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim();

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/redefinir-senha`,
      });

      if (resetError) {
        setError(getAuthErrorMessage(resetError));
        return;
      }

      setSent(true);
    } catch {
      setError("Não foi possível enviar o e-mail. Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <section className="mx-auto w-full max-w-md rounded-3xl border border-line bg-white p-8 shadow-xl">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-brand">Recuperação de acesso</p>
        <h1 className="mt-2 text-3xl font-black">Verifique seu e-mail</h1>
        <div role="status" className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold leading-6 text-emerald-800">
          Se houver uma conta vinculada a esse e-mail, você receberá um link para criar uma nova senha.
        </div>
        <p className="mt-4 text-sm leading-6 text-muted">Confira também as pastas de spam e lixo eletrônico. O link expira por segurança.</p>
        <Link href="/admin/login" className="mt-6 block rounded-2xl border border-brand px-5 py-3 text-center font-black text-brand hover:bg-brand hover:text-white">
          Voltar para o login
        </Link>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md rounded-3xl border border-line bg-white p-8 shadow-xl">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-brand">Recuperação de acesso</p>
      <h1 className="mt-2 text-3xl font-black">Esqueci minha senha</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Informe o e-mail usado no acesso administrativo. Enviaremos um link para você criar uma nova senha.
      </p>
      <div className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm font-bold" htmlFor="recovery-email">
          E-mail
          <input id="recovery-email" name="email" type="email" autoComplete="email" required autoFocus placeholder="seu@email.com" className="rounded-2xl border border-line px-4 py-3 font-normal outline-none focus:border-brand" />
        </label>
        <button type="submit" disabled={loading} className="rounded-2xl bg-brand px-5 py-4 font-black text-white hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? "Enviando..." : "Enviar link de recuperação"}
        </button>
        <Link href="/admin/login" className="text-center text-sm font-bold text-brand underline-offset-4 hover:underline">Voltar para o login</Link>
        {error && <p role="alert" aria-live="polite" className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold leading-6 text-red-700">{error}</p>}
      </div>
    </form>
  );
}
