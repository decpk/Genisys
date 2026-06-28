import { memo } from "react";
import { SettingRow } from "../SettingRow";
import { EXPLORER_SHORTCUT_META } from "./ExplorerShortcutsSetting.constants";
import { ExplorerShortcutRow } from "./ExplorerShortcutRow";
import { useExplorerShortcutsSettingData } from "./useExplorerShortcutsSettingData";

export const ExplorerShortcutsSetting = memo(
  function ExplorerShortcutsSetting(): React.JSX.Element {
    const { visibility, setVisibility } = useExplorerShortcutsSettingData();

    return (
      <SettingRow
        label="Sidebar shortcuts"
        description="Choose which standard folders appear under Shortcuts at the top of the Explorer sidebar. Disabled folders are hidden from the list."
      >
        <div className="flex flex-col gap-1 min-w-72">
          {EXPLORER_SHORTCUT_META.map((meta) => (
            <ExplorerShortcutRow
              key={meta.key}
              meta={meta}
              visible={visibility[meta.key]}
              onToggle={setVisibility}
            />
          ))}
        </div>
      </SettingRow>
    );
  },
);
