"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/config/site";
import { cn } from "@/lib/utils";

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/*
 * usePathname precisa de um Suspense nas rotas com parâmetro (ex.:
 * /acoes/PETR4). Enquanto o caminho não é conhecido, a navegação aparece
 * sem item ativo.
 */

function TopNavList({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Principal" className="hidden md:flex md:items-center md:gap-1">
      {navItems.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors",
              active
                ? "bg-accent-soft font-medium text-accent"
                : "text-muted hover:bg-surface-hover hover:text-text",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function BottomNavList({ pathname }: { pathname: string | null }) {
  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-4">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 text-xs transition-colors",
                  active ? "font-medium text-accent" : "text-muted hover:text-text",
                )}
              >
                <Icon aria-hidden className="size-5" strokeWidth={1.75} />
                {item.shortLabel}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function TopNavWithPath() {
  return <TopNavList pathname={usePathname()} />;
}

function BottomNavWithPath() {
  return <BottomNavList pathname={usePathname()} />;
}

/** Navegação do header (desktop). */
export function TopNav() {
  return (
    <Suspense fallback={<TopNavList pathname={null} />}>
      <TopNavWithPath />
    </Suspense>
  );
}

/** Barra de navegação inferior (celular). */
export function BottomNav() {
  return (
    <Suspense fallback={<BottomNavList pathname={null} />}>
      <BottomNavWithPath />
    </Suspense>
  );
}
