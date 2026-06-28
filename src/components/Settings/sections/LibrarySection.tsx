import { LibraryFontSetting } from '../components/LibraryFontSetting'
import { LibraryInlineImageSizeSetting } from '../components/LibraryInlineImageSizeSetting'
import { LibraryWidthSetting } from '../components/LibraryWidthSetting'
import { LibraryBookmarkViewSetting } from '../components/LibraryBookmarkViewSetting'
import { LibraryDistractionFreeSetting } from '../components/LibraryDistractionFreeSetting'
import { LibraryDefaultLanguageSetting } from '../components/LibraryDefaultLanguageSetting'

export function LibrarySection(): React.JSX.Element {
  return (
    <>
      <LibraryFontSetting />
      <LibraryWidthSetting />
      <LibraryInlineImageSizeSetting />
      <LibraryBookmarkViewSetting />
      <LibraryDefaultLanguageSetting />
      <LibraryDistractionFreeSetting />
    </>
  )
}
