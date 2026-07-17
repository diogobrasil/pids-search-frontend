import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import { BookOpen } from "lucide-react";
import { HeaderAuth } from "@/components/HeaderAuth";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

export const metadata: Metadata = {
  title: "Buscador ORCID - UFMA",
  description: "Buscador de identificadores ORCID Institucional",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        suppressHydrationWarning className={`${inter.className} ${merriweather.variable} bg-background text-text-main flex flex-col min-h-screen`}
      >
        <header className="bg-primary text-white shadow-md sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-white/90" />
            <h1 className="font-serif text-xl font-bold tracking-wide">
              Buscador ORCID Institucional
            </h1>
            <HeaderAuth />
          </div>
        </header>
        
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        
        <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
          <div className="container mx-auto px-4 text-center text-sm text-text-secondary">
            &copy; {new Date().getFullYear()} Universidade Federal do Maranhão. Todos os direitos reservados.
          </div>
        </footer>
      </body>
    </html>
  );
}
