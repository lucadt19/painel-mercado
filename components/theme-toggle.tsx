"use client";

import { useLayoutEffect } from "react";
import { Moon, Sun } from "lucide-react";

export const THEME_STORAGE_KEY = "theme";

/**
 * Script que roda no <head> antes da primeira pintura: aplica o tema salvo
 * ou, sem escolha salva, o do sistema (e escuro se o sistema não disser nada).
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

type Theme = "light" | "dark";

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function storedTheme(): Theme | null {
  try {
    const t = localStorage.getItem(THEME_STORAGE_KEY);
    return t === "light" || t === "dark" ? t : null;
  } catch {
    return null;
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function ThemeToggle() {
  useLayoutEffect(() => {
    // Reaplica o tema (em dev, o React limpa o atributo ao remontar).
    applyTheme(storedTheme() ?? systemTheme());

    // Sem escolha salva, acompanha mudanças do sistema.
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      if (!storedTheme()) applyTheme(systemTheme());
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  function toggle() {
    const current = document.documentElement.getAttribute("data-theme");
    const next: Theme = current === "light" ? "dark" : "light";
    applyTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Sem localStorage, o tema vale só para esta visita.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Alternar tema claro/escuro"
      title="Alternar tema"
      className="inline-flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-hover hover:text-text"
    >
      {/* Os dois ícones são renderizados; o CSS mostra o certo, sem flash. */}
      <Sun aria-hidden className="hidden size-4 dark:block" strokeWidth={1.75} />
      <Moon aria-hidden className="size-4 dark:hidden" strokeWidth={1.75} />
    </button>
  );
}
