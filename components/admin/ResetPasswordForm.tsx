"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAuthErrorMessage } from "@/lib/admin/auth-error-message";
import { createSupabaseClient, hasSupabaseEnv } from "@/lib/supabase/client";

type RecoveryStatus = "checking" | "ready" | "invalid" | "success";

export function ResetPasswordForm() {
  const supabaseAvailable = hasSupabaseEnv();
  const [status, setStatus] = useState<RecoveryStatus>(() => supabaseAvailable ? "checking" : "invalid");
  const [error, setError] = useState(() => supabaseAvailable ? "" : "A recuperação por e-mail não está disponível enquanto o RC Vend estiver usando acesso local.");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseClient();
    if (!supabase) return;

    let active = true;
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (active && session && (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN")) {
        setStatus("ready");
        setError("");
      }
    });

    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;

      if (sessionError || !data.session) {
        setError("Este link de recuperação é inválido ou expirou. Solicite um novo link.");
        setStatus("invalid");
        return;
      }

      setStatus("ready");
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    const passwordConfirmation = String(form.get("passwordConfirmation"));

    if (password.length < 8) {
      setError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("As senhas não coincidem.");
      return;
    }

    const supabase = createSupabaseClient();
    if (!supabase) {
      setError("A recuperação por e-mail não está disponível no acesso local.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(getAuthErrorMessage(updateError, "Não foi possível alterar a senha. Solicite um novo link e tente novamente."));
        return;
      }

      await supabase.auth.signOut();
      setStatus("success");
    } catch {
      setError("Não foi possível alterar a senha. Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "checking") {
    return (
      <section aria-live="polite" className="mx-auto w-full max-w-md rounded-3xl border border-line bg-white p-8 text-center shadow-xl">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-brand">Recuperação de acesso</p>
        <h1 className="mt-2 text-3xl font-black">Validando seu link</h1>
        <p className="mt-4 text-sm text-muted">Aguarde um instante...</p>
      </section>
    );
  }

  if (status === "success") {
    return (
      <section className="mx-auto w-full max-w-md rounded-3xl border border-line bg-white p-8 shadow-xl">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-brand">Recuperação concluída</p>
        <h1 className="mt-2 text-3xl font-black">Senha alterada</h1>
        <div role="status" className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold leading-6 text-emerald-800">
          Sua nova senha foi cadastrada. Agora você já pode entrar novamente.
        </div>
        <Link href="/admin/login" className="mt-6 block rounded-2xl bg-brand px-5 py-4 text-center font-black text-white hover:bg-brand-strong">Ir para o login</Link>
      </section>
    );
  }

  if (status === "invalid") {
    return (
      <section className="mx-auto w-full max-w-md rounded-3xl border border-line bg-white p-8 shadow-xl">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-brand">Recuperação de acesso</p>
        <h1 className="mt-2 text-3xl font-black">Recuperação indisponível</h1>
        <p role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700">{error}</p>
        <Link href="/admin/esqueci-senha" className="mt-6 block rounded-2xl bg-brand px-5 py-4 text-center font-black text-white hover:bg-brand-strong">Ver como redefinir</Link>
        <Link href="/admin/login" className="mt-4 block text-center text-sm font-bold text-brand underline-offset-4 hover:underline">Voltar para o login</Link>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md rounded-3xl border border-line bg-white p-8 shadow-xl">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-brand">Recuperação de acesso</p>
      <h1 className="mt-2 text-3xl font-black">Crie uma nova senha</h1>
      <p className="mt-3 text-sm leading-6 text-muted">Use pelo menos 8 caracteres e não reutilize sua senha anterior.</p>
      <div className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm font-bold" htmlFor="new-password">
          Nova senha
          <input id="new-password" name="password" type="password" autoComplete="new-password" required minLength={8} autoFocus className="rounded-2xl border border-line px-4 py-3 font-normal outline-none focus:border-brand" />
        </label>
        <label className="grid gap-2 text-sm font-bold" htmlFor="password-confirmation">
          Confirme a nova senha
          <input id="password-confirmation" name="passwordConfirmation" type="password" autoComplete="new-password" required minLength={8} className="rounded-2xl border border-line px-4 py-3 font-normal outline-none focus:border-brand" />
        </label>
        <button type="submit" disabled={loading} className="rounded-2xl bg-brand px-5 py-4 font-black text-white hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? "Salvando..." : "Salvar nova senha"}
        </button>
        {error && <p role="alert" aria-live="polite" className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
      </div>
    </form>
  );
}
