import { Terminal, Play, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ExplorerShellConfirm } from "./ExplorerAICommand.types";

interface ShellConfirmPanelProps {
  confirm: ExplorerShellConfirm;
  onApprove: () => void;
  onDeny: () => void;
}

/**
 * Approval card for an AI-requested shell command. The command is shown
 * verbatim so the user can review exactly what will run before approving.
 */
export function ShellConfirmPanel({
  confirm,
  onApprove,
  onDeny,
}: ShellConfirmPanelProps) {
  return (
    <div className="mt-4 rounded-lg border-2 border-amber-500/40 bg-amber-500/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20">
        <Terminal size={16} className="text-amber-500 shrink-0" />
        <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
          Run shell command?
        </span>
      </div>

      {/* Command preview */}
      <div className="px-4 py-3">
        <pre className="text-xs font-mono whitespace-pre-wrap break-all rounded bg-secondary/60 px-3 py-2 text-foreground">
          {confirm.command}
        </pre>
        {confirm.cwd && (
          <p className="mt-2 text-xs text-muted-foreground">
            Working directory: <span className="font-mono">{confirm.cwd}</span>
          </p>
        )}
        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 leading-relaxed">
          This will execute on your machine. Review the command carefully before
          approving.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-amber-500/20 bg-amber-500/5">
        <Button variant="ghost" size="sm" onClick={onDeny} className="gap-1">
          <X size={12} />
          Deny
        </Button>
        <Button size="sm" onClick={onApprove} className="gap-1">
          <Play size={12} />
          Approve &amp; Run
        </Button>
      </div>
    </div>
  );
}
