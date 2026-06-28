import { useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  RotateCcw,
  RefreshCw,
  Bug,
} from "lucide-react";
import { scopedToast } from "@/frameworks/notification";

const toast = scopedToast("system");

import { Button } from "@/components/ui/button";

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  componentName?: string;
}

function formatStackTrace(stack: string): React.JSX.Element[] {
  const lines = stack.split("\n");

  return lines.map((line, i) => {
    const trimmed = line.trim();

    // Match file path patterns like "at Component (file.tsx:12:5)" or "at file.tsx:12:5"
    const fileMatch = trimmed.match(
      /(at\s+(?:[\w$.]+\s+)?\(?)([^\s()]+?):(\d+):(\d+)\)?$/,
    );

    if (fileMatch) {
      const [, prefix, filePath, lineNum, colNum] = fileMatch;
      return (
        <span key={i} className="block">
          <span className="text-muted-foreground">{prefix}</span>
          <span className="text-info">{filePath}</span>
          <span className="text-muted-foreground">:</span>
          <span className="text-warning">{lineNum}</span>
          <span className="text-muted-foreground">:</span>
          <span className="text-warning">{colNum}</span>
          {trimmed.endsWith(")") && (
            <span className="text-muted-foreground">)</span>
          )}
        </span>
      );
    }

    // First line is usually the error message
    if (i === 0) {
      return (
        <span key={i} className="block text-destructive font-semibold">
          {line}
        </span>
      );
    }

    return (
      <span key={i} className="block text-muted-foreground">
        {line}
      </span>
    );
  });
}

export function ErrorFallback({
  error,
  resetError,
  componentName,
}: ErrorFallbackProps): React.JSX.Element {
  const [showStack, setShowStack] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyError = async () => {
    const text = `Error: ${error.message}\n\n${error.stack ?? "No stack trace available"}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Error details copied to clipboard", { duration: 2000 });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex items-center justify-center h-full w-full bg-background p-6">
      <div className="w-full max-w-xl bg-card border border-border rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Something went wrong
              </h2>
              {componentName && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Error in{" "}
                  <span className="font-medium text-foreground">
                    {componentName}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Error message */}
        <div className="px-6 pb-4">
          <div className="rounded-md bg-destructive/5 border border-destructive/20 px-4 py-3">
            <p className="text-sm text-destructive font-medium break-words">
              {error.message}
            </p>
          </div>
        </div>

        {/* Stack trace (collapsible) */}
        {error.stack && (
          <div className="px-6 pb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowStack(!showStack)}
              className="mb-2"
            >
              {showStack ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
              <span className="font-medium">Stack Trace</span>
            </Button>

            {showStack && (
              <pre className="text-xs bg-secondary/50 border border-border rounded-md p-4 overflow-auto max-h-64 leading-relaxed">
                {formatStackTrace(error.stack)}
              </pre>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={handleReload}>
              <RefreshCw className="w-3.5 h-3.5" />
              Reload App
            </Button>
            <Button variant="outline" onClick={resetError}>
              <RotateCcw className="w-3.5 h-3.5" />
              Try Again
            </Button>
            <Button variant="ghost" onClick={handleCopyError}>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-success" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copied ? "Copied!" : "Copy Error"}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-secondary/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              toast.info(
                "Error reporting will be available in a future update.",
                { duration: 3000 },
              )
            }
          >
            <Bug className="w-3 h-3" />
            Report this error
          </Button>
        </div>
      </div>
    </div>
  );
}
