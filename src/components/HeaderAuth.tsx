"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { AuthService } from "@/services/auth.service";
import { LogOut } from "lucide-react";

export function HeaderAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkAuth = () => {
      setIsAuthenticated(AuthService.isAuthenticated());
    };
    
    checkAuth();
    window.addEventListener("auth-change", checkAuth);
    
    return () => {
      window.removeEventListener("auth-change", checkAuth);
    };
  }, []);

  const handleLogout = () => {
    AuthService.removeToken();
    window.dispatchEvent(new Event("auth-change"));
    router.push("/login");
  };

  if (!mounted) return null; // Evita hydration mismatch (servidor vs cliente)

  if (isAuthenticated) {
    return (
      <button 
        onClick={handleLogout}
        className="flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white transition-colors px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 ml-auto"
      >
        <LogOut className="w-4 h-4" />
        Sair
      </button>
    );
  }

  // Se estiver nas rotas de auth, podemos exibir apenas link p/ a Home
  if (pathname === '/login' || pathname === '/register') {
    return (
      <Link href="/" className="flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white ml-auto">
        Ir para o Início
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3 ml-auto">
      <Link href="/login" className="text-sm font-medium text-white/90 hover:text-white">
        Entrar
      </Link>
      <Link 
        href="/register" 
        className="text-sm font-medium bg-white text-primary hover:bg-slate-50 transition-colors px-4 py-1.5 rounded-full"
      >
        Criar Conta
      </Link>
    </div>
  );
}
