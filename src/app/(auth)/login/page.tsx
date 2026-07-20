"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthService } from "@/services/auth.service";
import { Loader2, Mail, Lock } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { translateError } from "@/services/error-translator";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await AuthService.loginUser({ email, password });
      if (response.token) {
        AuthService.setToken(response.token);
        // Dispatch custom event to update Header
        window.dispatchEvent(new Event("auth-change"));
        router.push("/");
      } else {
        throw new Error("Token não retornado pelo servidor.");
      }
    } catch (err) {
      addToast(translateError(err, "Não foi possível realizar o login. Verifique suas credenciais e tente novamente."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif font-bold text-text-main dark:text-dark-text-main">
          Bem-vindo de volta
        </h2>
        <p className="mt-2 text-sm text-text-secondary dark:text-dark-text-secondary">
          Faça login para acessar o buscador ORCID
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-main dark:text-dark-text-main mb-1">E-mail</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-dark-border focus:ring-2 focus:ring-primary/20 dark:focus:ring-dark-primary/30 focus:border-primary dark:focus:border-dark-primary outline-none transition-all bg-white dark:bg-dark-surface-raised text-text-main dark:text-dark-text-main placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="seu@email.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-main dark:text-dark-text-main mb-1">Senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-dark-border focus:ring-2 focus:ring-primary/20 dark:focus:ring-dark-primary/30 focus:border-primary dark:focus:border-dark-primary outline-none transition-all bg-white dark:bg-dark-surface-raised text-text-main dark:text-dark-text-main placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !email || !password}
          className="w-full bg-primary hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover text-white dark:text-dark-background py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
          Entrar
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-text-secondary dark:text-dark-text-secondary">
        Não tem uma conta?{" "}
        <Link href="/register" className="font-medium text-primary dark:text-dark-primary hover:underline">
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}
