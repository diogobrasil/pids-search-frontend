"use client";

import { useTheme } from "./ThemeProvider";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  // Avoid rendering mismatched icon during SSR
  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg bg-white/10" />
    );
  }

  return (
    <button
      id="theme-toggle"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
      className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 cursor-pointer"
    >
      <Sun
        className={`w-[18px] h-[18px] text-white/90 transition-all duration-300 absolute ${
          theme === "dark"
            ? "opacity-0 rotate-90 scale-0"
            : "opacity-100 rotate-0 scale-100"
        }`}
      />
      <Moon
        className={`w-[18px] h-[18px] text-white/90 transition-all duration-300 absolute ${
          theme === "dark"
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 -rotate-90 scale-0"
        }`}
      />
    </button>
  );
}
