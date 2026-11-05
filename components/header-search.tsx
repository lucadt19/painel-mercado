"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { AssetSearch } from "@/components/market/asset-search";

/**
 * Busca de ativos no cabeçalho, em qualquer página. A lista da B3 só é
 * carregada quando a busca é aberta. Atalho: "/" abre; Esc fecha.
 */
export function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const [lastPath, setLastPath] = useState(pathname);

  // Fecha ao mudar de página.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.parentElement?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Fechar busca" : "Buscar ativo (atalho: /)"}
        title="Buscar ativo (atalho: /)"
        className="flex size-8 items-center justify-center rounded-md text-muted transition-colors duration-150 hover:bg-surface-hover hover:text-text"
      >
        {open ? <X aria-hidden className="size-4" /> : <Search aria-hidden className="size-4" strokeWidth={1.75} />}
      </button>
      {open && (
        <div ref={panelRef} className="absolute inset-x-0 top-full border-b border-border bg-bg px-4 py-3">
          <div className="mx-auto max-w-xl">
            <AssetSearch autoFocus onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
