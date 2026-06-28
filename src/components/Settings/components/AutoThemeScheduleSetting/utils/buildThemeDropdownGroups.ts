import type { DropdownGroup } from "@/components/ui/dropdown";
import type { Theme } from "@/themes";

export function buildThemeDropdownGroups(
  themes: Theme[],
  activeThemeId: string,
  onSelect: (themeId: string) => void,
): DropdownGroup[] {
  const lightThemes = themes.filter((t) => !t.isDark);
  const darkThemes = themes.filter((t) => t.isDark);

  return [
    {
      key: "light",
      label: "Light Themes",
      items: lightThemes.map((t) => ({
        key: t.id,
        label: t.name,
        active: t.id === activeThemeId,
        onSelect: () => onSelect(t.id),
      })),
    },
    {
      key: "dark",
      label: "Dark Themes",
      items: darkThemes.map((t) => ({
        key: t.id,
        label: t.name,
        active: t.id === activeThemeId,
        onSelect: () => onSelect(t.id),
      })),
    },
  ];
}
