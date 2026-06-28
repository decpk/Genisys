import { Info, Sofa } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { notesAutoScrollToolbarStyles as styles } from '../../NotesAutoScrollToolbar.styles';

/**
 * ScrollModeInfoPopover
 *
 * A tiny info icon that, when clicked, reveals a tongue-in-cheek note about
 * why auto-scroll exists — so you can read hands-free like the gloriously
 * lazy genius you are.
 */
export function ScrollModeInfoPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={styles.infoIconBtn}
          aria-label="What is auto-scroll for?"
        >
          <Info size={13} />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="center" className={styles.infoPopover}>
        <div className={styles.infoPopoverTitle}>
          <Sofa size={13} />
          Engineered for the comfortably lazy
        </div>
        <p className={styles.infoPopoverBody}>
          Why move a single finger? Kick back, let the words come to you, and
          let your scroll wheel enjoy its well-earned retirement. 🛋️
        </p>
      </PopoverContent>
    </Popover>
  );
}
