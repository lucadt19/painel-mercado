import {
  ChartLine,
  Landmark,
  LayoutDashboard,
  Newspaper,
  type LucideIcon,
} from "lucide-react";

export const siteName = "Painel";

export type NavItem = {
  href: string;
  label: string;
  /** Rótulo curto para a barra inferior do celular. */
  shortLabel: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { href: "/", label: "Visão Geral", shortLabel: "Visão Geral", icon: LayoutDashboard },
  { href: "/acoes", label: "Ações & ETFs", shortLabel: "Ações", icon: ChartLine },
  { href: "/renda-fixa", label: "Renda Fixa", shortLabel: "Renda Fixa", icon: Landmark },
  { href: "/noticias", label: "Notícias", shortLabel: "Notícias", icon: Newspaper },
];
