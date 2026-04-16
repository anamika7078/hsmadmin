import { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}
