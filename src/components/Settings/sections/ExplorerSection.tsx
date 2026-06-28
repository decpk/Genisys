import { ExplorerViewSetting } from '../components/ExplorerViewSetting'
import { ExplorerSortSetting } from '../components/ExplorerSortSetting'
import { ExplorerShowHiddenSetting } from '../components/ExplorerShowHiddenSetting'
import { ExplorerHideFoldersSetting } from '../components/ExplorerHideFoldersSetting'
import { ExplorerMixFoldersWithFilesSetting } from '../components/ExplorerMixFoldersWithFilesSetting'
import { ExplorerDimHiddenFilesSetting } from '../components/ExplorerDimHiddenFilesSetting'
import { ExplorerSingleClickOpenSetting } from '../components/ExplorerSingleClickOpenSetting'
import { ExplorerShortcutsSetting } from "../components/ExplorerShortcutsSetting";

export function ExplorerSection(): React.JSX.Element {
  return (
    <>
      <ExplorerViewSetting />
      <ExplorerSortSetting />
      <ExplorerShowHiddenSetting />
      <ExplorerHideFoldersSetting />
      <ExplorerMixFoldersWithFilesSetting />
      <ExplorerDimHiddenFilesSetting />
      <ExplorerSingleClickOpenSetting />
      <ExplorerShortcutsSetting />
    </>
  );
}
