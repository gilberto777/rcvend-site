"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createSupabaseClient();
    if (!supabase) {
      const form = new FormData(event.currentTarget);
      const response = await fetch("/api/admin/local-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(form.get("email")),
          password: String(form.get("password")),
        }),
      });
      const result = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setError(result?.error ?? "Não foi possível iniciar a sessão local.");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
      return;
    }

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      setError("Login válido, mas o perfil administrativo não foi encontrado.");
      return;
    }

    if (profile.role !== "admin" || profile.status !== "active") {
      await supabase.auth.signOut();
      setError("Login válido, mas este perfil ainda não está ativo como administrador.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md rounded-3xl border border-line bg-white p-8 shadow-xl">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-brand">Area administrativa</p>
      <h1 className="mt-2 text-3xl font-black">Entrar no RC Vend</h1>
      <div className="mt-6 grid gap-4">
        <input name="email" type="email" required placeholder="E-mail" className="rounded-2xl border border-line px-4 py-3 outline-none focus:border-brand" />
        <input name="password" type="password" required placeholder="Senha" className="rounded-2xl border border-line px-4 py-3 outline-none focus:border-brand" />
        <button disabled={loading} className="rounded-2xl bg-brand px-5 py-4 font-black text-white hover:bg-brand-strong disabled:opacity-60">
          {loading ? "Entrando..." : "Entrar"}
        </button>
        {!process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <p className="rounded-2xl border border-blue-200 bg-blue-50 p-3 text-sm font-semibold text-blue-800">
            Acesso local ativo. Use as credenciais configuradas neste computador.
          </p>
        )}
        {error && <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
      </div>
    </form>
  );
}
