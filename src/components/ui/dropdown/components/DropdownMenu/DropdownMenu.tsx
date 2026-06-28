import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

import { DropdownMenuGroup } from "../DropdownMenuGroup";
import type { DropdownMenuProps, DropdownGroup, DropdownItem } from "../../Dropdown.types";

const GAP = 4;
const VIEWPORT_PADDING = 8;

interface ComputedPosition {
  style: React.CSSProperties;
  side: "top" | "bottom";
  availableHeight: number;
}

function computeAutoPosition(
  menuW: number,
  menuH: number,
  triggerRect: DOMRect,
  preferredAlign: "left" | "right",
  preferredSide: "top" | "bottom",
): ComputedPosition {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const spaceBelow = vh - triggerRect.bottom - GAP - VIEWPORT_PADDING;
  const spaceAbove = triggerRect.top - GAP - VIEWPORT_PADDING;

  let side = preferredSide;
  if (side === "bottom") {
    if (menuH > spaceBelow && spaceAbove > spaceBelow) side = "top";
  } else {
    if (menuH > spaceAbove && spaceBelow > spaceAbove) side = "bottom";
  }

  const availableHeight = Math.max(
    0,
    side === "bottom" ? spaceBelow : spaceAbove,
  );

  let align = preferredAlign;
  if (align === "left") {
    if (triggerRect.left + menuW > vw - VIEWPORT_PADDING) align = "right";
  } else {
    if (triggerRect.right - menuW < VIEWPORT_PADDING) align = "left";
  }

  const style: React.CSSProperties = {};

  if (align === "left") {
    let left = triggerRect.left;
    if (left + menuW > vw - VIEWPORT_PADDING)
      left = vw - VIEWPORT_PADDING - menuW;
    if (left < VIEWPORT_PADDING) left = VIEWPORT_PADDING;
    style.left = left;
  } else {
    let right = vw - triggerRect.right;
    if (right + menuW > vw - VIEWPORT_PADDING)
      right = vw - VIEWPORT_PADDING - menuW;
    if (right < VIEWPORT_PADDING) right = VIEWPORT_PADDING;
    style.right = right;
  }

  if (side === "top") {
    style.bottom = vh - triggerRect.top + GAP;
  } else {
    style.top = triggerRect.bottom + GAP;
  }

  return { style, side, availableHeight };
}

export const DropdownMenu = forwardRef<HTMLDivElement, DropdownMenuProps>(
  function DropdownMenu(
    {
      items,
      groups,
      align = "right",
      side = "bottom",
      menuClassName,
      showCheck = true,
      menuWidth,
      maxHeight,
      triggerRect,
      onClose,
      onMouseEnter,
      onMouseLeave,
      onHighlight,
      onDismiss,
      keepOpenOnSelect,
    },
    forwardedRef,
  ) {
    const localRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<ComputedPosition | null>(null);
    const [highlightedKey, setHighlightedKey] = useState<string | null>(null);

    const setRef = useCallback(
      (el: HTMLDivElement | null) => {
        localRef.current = el;
        if (typeof forwardedRef === "function") forwardedRef(el);
        else if (forwardedRef) forwardedRef.current = el;
      },
      [forwardedRef],
    );

    const resolvedGroups: DropdownGroup[] = useMemo(() => {
      if (groups) return groups;
      if (items) return [{ key: "__flat__", items }];
      return [];
    }, [groups, items]);

    // Flatten all items for keyboard navigation
    const flatItems: DropdownItem[] = useMemo(
      () => resolvedGroups.flatMap((g) => g.items),
      [resolvedGroups],
    );

    // Escape always closes the dropdown
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onDismiss?.();
          onClose();
        }
      };
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }, [onClose, onDismiss]);

    // Keyboard navigation
    useEffect(() => {
      if (!onHighlight && !onDismiss) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          setHighlightedKey((prev) => {
            const currentIdx = prev
              ? flatItems.findIndex((it) => it.key === prev)
              : -1;
            let nextIdx: number;
            if (e.key === "ArrowDown") {
              nextIdx = currentIdx < flatItems.length - 1 ? currentIdx + 1 : 0;
            } else {
              nextIdx = currentIdx > 0 ? currentIdx - 1 : flatItems.length - 1;
            }
            const next = flatItems[nextIdx];
            if (next && onHighlight) onHighlight(next);

            // Scroll the highlighted item into view
            requestAnimationFrame(() => {
              localRef.current
                ?.querySelector(`[data-key="${next.key}"]`)
                ?.scrollIntoView({ block: "nearest" });
            });

            return next.key;
          });
        } else if (e.key === "Enter") {
          e.preventDefault();
          const item = flatItems.find((it) => it.key === highlightedKey);
          if (item) {
            item.onSelect();
            if (!keepOpenOnSelect) onClose();
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [flatItems, highlightedKey, onClose, onHighlight, onDismiss]);

    const handleItemMouseEnter = useCallback(
      (key: string) => {
        setHighlightedKey(key);
        if (onHighlight) {
          const item = flatItems.find((it) => it.key === key);
          if (item) onHighlight(item);
        }
      },
      [flatItems, onHighlight],
    );

    useLayoutEffect(() => {
      const menuEl = localRef.current;
      if (!menuEl || !triggerRect) return;
      setPosition(
        computeAutoPosition(
          menuEl.offsetWidth,
          menuEl.offsetHeight,
          triggerRect,
          align,
          side,
        ),
      );

      // Scroll the active item into view (centered) on open
      const activeItem = flatItems.find((it) => it.active);
      if (activeItem) {
        requestAnimationFrame(() => {
          menuEl
            .querySelector(`[data-key="${activeItem.key}"]`)
            ?.scrollIntoView({ block: "center" });
        });
      }
      // Position is computed once on mount; the menu unmounts when closed
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // `menuWidth="trigger"` matches the trigger's measured width. Other
    // string values pass through as a raw CSS length. We resolve `trigger`
    // to pixels here because the menu is portaled to <body>, so percentage
    // values would otherwise resolve against the viewport.
    const resolvedWidth: string | number | undefined =
      menuWidth === "trigger"
        ? triggerRect
          ? `${triggerRect.width}px`
          : undefined
        : menuWidth;

    const mergedStyle: React.CSSProperties = {
      position: "fixed",
      ...(resolvedWidth ? { width: resolvedWidth } : {}),
      ...(position ? { ...position.style, opacity: 1 } : { opacity: 0 }),
    };

    const slideClass = position
      ? position.side === "top"
        ? "slide-in-from-bottom-1"
        : "slide-in-from-top-1"
      : undefined;

    // Cap height to the available viewport space on the chosen side so the
    // menu always fits inside the viewport and its `overflow-y-auto` engages.
    const effectiveMaxHeight: string | number | undefined = position
      ? maxHeight
        ? `min(${typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight}, ${position.availableHeight}px)`
        : `${position.availableHeight}px`
      : maxHeight;

    const menu = (
      <div
        ref={setRef}
        className="fixed z-50 pointer-events-auto"
        style={mergedStyle}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div
          className={cn(
            "bg-popover border border-border rounded-lg shadow-md py-1 min-w-[120px] animate-in fade-in duration-100 overflow-y-auto overscroll-contain",
            slideClass,
            menuClassName,
          )}
          style={effectiveMaxHeight ? { maxHeight: effectiveMaxHeight } : undefined}
        >
          {resolvedGroups.map((group, gi) => (
            <DropdownMenuGroup
              key={group.key}
              group={group}
              showSeparator={gi > 0}
              showCheck={showCheck}
              highlightedKey={highlightedKey}
              onClose={onClose}
              onItemMouseEnter={onHighlight ? handleItemMouseEnter : undefined}
              keepOpenOnSelect={keepOpenOnSelect}
            />
          ))}
        </div>
      </div>
    );

    return createPortal(menu, document.body);
  },
);
