export interface SubMenuItem {
  id: string;
  label: string;
  route?: string;
}

export interface MenuItem {
  id: string;
  label: string;
  /** Any icon font ligature, SVG path key, or emoji you use in the project */
  icon: string;
  route?: string;
  children?: SubMenuItem[];
}
