import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import { BookOpen } from "lucide-react";
import { HeaderAuth } from "@/components/HeaderAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ToastProvider } from "@/components/ToastProvider";
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
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Inline script to prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.className} ${merriweather.variable} bg-background dark:bg-dark-background text-text-main dark:text-dark-text-main flex flex-col min-h-screen transition-colors duration-300`}
      >
        <ThemeProvider>
          <ToastProvider>
            <header className="bg-primary dark:bg-dark-surface text-white shadow-md sticky top-0 z-50 transition-colors duration-300 dark:border-b dark:border-dark-border">
              <div className="container mx-auto px-4 h-16 flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-white/90" />
                <h1 className="font-serif text-xl font-bold tracking-wide">
                  Buscador ORCID Institucional
                </h1>
                <div className="ml-auto flex items-center gap-3">
                  <ThemeToggle />
                  <HeaderAuth />
                </div>
              </div>
            </header>
            
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            
            <footer className="bg-white dark:bg-dark-surface border-t border-slate-200 dark:border-dark-border py-6 mt-auto transition-colors duration-300">
              <div className="container mx-auto px-4 text-center text-sm text-text-secondary dark:text-dark-text-secondary">
                &copy; {new Date().getFullYear()} Universidade Federal do Maranhão. Todos os direitos reservados.
              </div>
            </footer>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
