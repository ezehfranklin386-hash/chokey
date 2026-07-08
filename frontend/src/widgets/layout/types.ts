import type { SVGProps, JSX } from 'react';

export interface NavItem {
  label: string;
  path: string;
  icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
  exact?: boolean;
}

export type SidebarMode = 'expanded' | 'collapsed' | 'mobile-open' | 'mobile-closed';
