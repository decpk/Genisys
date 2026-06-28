export interface ThemeColors {
  background: string
  foreground: string
  card: string
  'card-foreground': string
  popover: string
  'popover-foreground': string
  primary: string
  'primary-foreground': string
  secondary: string
  'secondary-foreground': string
  muted: string
  'muted-foreground': string
  accent: string
  'accent-foreground': string
  destructive: string
  'destructive-foreground': string
  border: string
  input: string
  ring: string
  success: string
  warning: string
  info: string
  sidebar?: string
  'sidebar-foreground'?: string
  'sidebar-border'?: string
  'sidebar-accent'?: string
  'sidebar-accent-foreground'?: string
  'sidebar-muted'?: string
  'sidebar-muted-foreground'?: string
}

export interface Theme {
  id: string;
  name: string;
  isDark: boolean;
  /** True for user-defined themes loaded from disk; undefined for predefined ones. */
  isCustom?: boolean;
  colors: ThemeColors;
  category?: "light" | "dark";
}
