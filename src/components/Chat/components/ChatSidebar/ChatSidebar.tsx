import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  ChevronRight,
  Eraser,
  MessageSquare,
  MessageSquareText,
} from "lucide-react";

import { IconButton } from "@/components/ui/icon-button";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import { useChatNewChatHandler } from "../../hooks/useChatNewChatHandler";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { useChatHistoryStore } from "@/store/chat-history-store";
import { useConfirmDialogStore } from "@/store/confirm-dialog-store";
import type { ChatConversationMeta, ChatMessage } from "../../../../../../preload/index.d";

// ─── Date grouping ───────────────────────────────────────────────

type DateGroup = "Today" | "Yesterday" | "This Week" | "This Month" | "Older";

function getDateGroup(dateStr: string): DateGroup {
  const date = new Date(dateStr);
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfToday.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  if (date >= startOfToday) return "Today";
  if (date >= startOfYesterday) return "Yesterday";
  if (date >= startOfWeek) return "This Week";
  if (date >= startOfMonth) return "This Month";
  return "Older";
}

const GROUP_ORDER: DateGroup[] = [
  "Today",
  "Yesterday",
  "This Week",
  "This Month",
  "Older",
];

function groupConversations(
  conversations: ChatConversationMeta[]
): { group: DateGroup; items: ChatConversationMeta[] }[] {
  const map = new Map<DateGroup, ChatConversationMeta[]>();
  for (const conv of conversations) {
    const g = getDateGroup(conv.updatedAt);
    if (!map.has(g)) map.set(g, []);
    map.get(g)!.push(conv);
  }
  return GROUP_ORDER.filter((g) => map.has(g)).map((g) => ({
    group: g,
    items: map.get(g)!,
  }));
}

// ─── Relative time ───────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w`;
  const months = Math.floor(days / 30);
  return `${months}mo`;
}

// ─── ChatSidebar ─────────────────────────────────────────────────

export function ChatSidebar(): React.JSX.Element {
  const conversations = useChatHistoryStore((s) => s.conversations);
  const activeId = useChatHistoryStore((s) => s.activeConversationId);
  const activeMessages = useChatHistoryStore((s) => s.activeMessages);
  const selectConversation = useChatHistoryStore((s) => s.selectConversation);
  const removeConversation = useChatHistoryStore((s) => s.removeConversation);
  const clearAll = useChatHistoryStore((s) => s.clearAll);
  const openConfirmDialog = useConfirmDialogStore((s) => s.openConfirmDialog);

  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    if (!filter) return conversations;
    const q = filter.toLowerCase();
    return conversations.filter((c) => c.title.toLowerCase().includes(q));
  }, [conversations, filter]);

  const grouped = useMemo(() => groupConversations(filtered), [filtered]);

  const handleNewChat = useChatNewChatHandler();

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* ── Header ── */}
      <div className="shrink-0 flex items-center gap-2 px-3 h-12 border-b border-border/40">
        <MessageSquare size={14} className="text-primary" />
        <span className="text-[13px] font-semibold text-foreground">Chats</span>
        {conversations.length > 0 && (
          <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 tabular-nums">
            {conversations.length}
          </span>
        )}
        <div className="ml-auto flex items-center gap-1">
          {conversations.length > 0 && (
            <IconButton
              tooltip="Clear all chats"
              tooltipSide="bottom"
              variant="ghost"
              size="xs"
              onClick={clearAll}
            >
              <Eraser size={13} />
            </IconButton>
          )}
          <IconButton variant="subtle" size="sm" tooltip="New Chat" tooltipSide="bottom" onClick={handleNewChat}>
            <Plus size={14} strokeWidth={2.5} />
          </IconButton>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="shrink-0 px-2.5 py-2">
        <SearchInput
          placeholder="Search chats…"
          value={filter}
          onChange={setFilter}
        />
      </div>

      {/* ── Conversation list ── */}
      <div className="flex-1 overflow-y-auto px-1.5 pb-2">
        {conversations.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            message="No conversations yet — start a new chat"
            className="py-16"
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            message="No chats match your search"
            className="py-12"
          />
        ) : (
          <div className="space-y-3">
            {grouped.map(({ group, items }) => (
              <div key={group}>
                {/* Date group label */}
                <div className="px-1.5 pt-1 pb-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                    {group}
                  </span>
                </div>
                {/* Items */}
                <div className="space-y-0.5">
                  {items.map((conv) => (
                    <ChatHistoryItem
                      key={conv.id}
                      conversation={conv}
                      isActive={conv.id === activeId}
                      messages={
                        conv.id === activeId ? activeMessages : undefined
                      }
                      onSelect={() => selectConversation(conv.id)}
                      onDelete={() =>
                        openConfirmDialog({
                          title: 'Delete conversation',
                          description: `Are you sure you want to delete "${conv.title || 'Untitled'}"? This action cannot be undone.`,
                          onConfirm: () => removeConversation(conv.id),
                        })
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ChatHistoryItem ─────────────────────────────────────────────

function ChatHistoryItem({
  conversation,
  isActive,
  messages,
  onSelect,
  onDelete,
}: {
  conversation: ChatConversationMeta;
  isActive: boolean;
  messages?: ChatMessage[];
  onSelect: () => void;
  onDelete: () => void;
}): React.JSX.Element {
  const userMessages = messages?.filter((m) => m.role === "user") ?? [];
  const hasSubItems = userMessages.length > 1;
  const [isExpanded, setIsExpanded] = useState(hasSubItems);

  useEffect(() => {
    if (hasSubItems) setIsExpanded(true);
  }, [hasSubItems]);

  const handleToggle = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (hasSubItems) {
      setIsExpanded((v) => !v);
      if (!isActive) onSelect();
    }
  };

  const scrollToMessage = (messageId: string): void => {
    onSelect();
    requestAnimationFrame(() => {
      const el = document.querySelector(`[data-message-id="${messageId}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={`rounded-md transition-colors ${
            isActive
              ? "bg-primary/10 border border-primary/30"
              : "border border-transparent hover:bg-secondary"
          }`}
        >
          {/* Conversation row */}
          <div
            onClick={() => {
              onSelect();
              if (hasSubItems && !isActive) setIsExpanded(true);
            }}
            className={`group flex items-start gap-2 px-2 py-2 rounded-md cursor-pointer transition-colors ${
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {/* Icon area */}
            <div className="shrink-0 mt-0.5">
              {hasSubItems ? (
                <button
                  onClick={handleToggle}
                  className="flex items-center justify-center cursor-pointer"
                >
                  <ChevronRight
                    size={14}
                    className={`transition-transform duration-200 ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    } ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </button>
              ) : (
                <MessageSquare size={14} className={isActive ? "text-primary" : "text-muted-foreground"} />
              )}
            </div>

            {/* Title + meta */}
            <div className="flex-1 min-w-0">
              <span className="block truncate text-xs font-medium leading-snug">
                {conversation.title}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {conversation.messageCount > 0 && (
                  <span className="text-[10px] text-muted-foreground/50 tabular-nums">
                    {conversation.messageCount} msg{conversation.messageCount !== 1 ? "s" : ""}
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground/35">
                  {relativeTime(conversation.updatedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Expandable sub-messages */}
          {isActive && isExpanded && hasSubItems && (
            <div className="pb-2 pt-0.5 px-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="ml-4 space-y-px">
                {userMessages.map((msg) => {
                  const preview =
                    msg.content.length > 50
                      ? msg.content.slice(0, 50) + "…"
                      : msg.content;
                  return (
                    <button
                      key={msg.id}
                      onClick={() => scrollToMessage(msg.id)}
                      className="w-full flex items-center gap-2 px-2 py-[5px] rounded-md text-[11px] transition-colors cursor-pointer text-left min-w-0 text-muted-foreground hover:text-foreground hover:bg-secondary"
                    >
                      <MessageSquareText
                        size={11}
                        className="shrink-0 text-muted-foreground/40"
                      />
                      <span className="truncate">{preview}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </ContextMenuTrigger>

      {/* Right-click context menu */}
      <ContextMenuContent>
        <ContextMenuItem
          onClick={onDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 size={15} />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
