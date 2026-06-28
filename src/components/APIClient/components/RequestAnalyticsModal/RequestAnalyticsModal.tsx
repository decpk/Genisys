import { AppInlineLoader } from "@/components/AppLoader";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import { AnalyticsEmptyState } from "./components/AnalyticsEmptyState";
import { AnalyticsModalHeader } from "./components/AnalyticsModalHeader";
import { RequestAnalyticsContent } from "./components/RequestAnalyticsContent";
import type { RequestAnalyticsModalProps } from "./RequestAnalyticsModal.types";
import { useRequestAnalyticsModalData } from "./useRequestAnalyticsModalData";

const CONTENT_CLASS =
  "w-[calc(100vw-2rem)] h-[calc(100vh-2rem)] max-w-none sm:max-w-none p-0 gap-0 flex flex-col overflow-hidden rounded-2xl border-border/60";

export function RequestAnalyticsModal(
  props: RequestAnalyticsModalProps,
): React.JSX.Element {
  const { open, onOpenChange, requestId } = props;
  const { range, setRange, loading, isEmpty, meta, data } =
    useRequestAnalyticsModalData({
      requestId,
      open,
    });

  let body: React.ReactNode;
  if (loading) {
    body = (
      <div className="flex h-full items-center justify-center">
        <AppInlineLoader message="Loading analytics…" />
      </div>
    );
  } else if (isEmpty) {
    body = <AnalyticsEmptyState requestName={meta.name} />;
  } else {
    body = <RequestAnalyticsContent data={data} />;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={CONTENT_CLASS}>
        <DialogTitle className="sr-only">{meta.name} analytics</DialogTitle>
        <AnalyticsModalHeader
          name={meta.name}
          method={meta.method}
          url={meta.url}
          range={range}
          onRangeChange={setRange}
        />
        <div className="flex flex-1 flex-col overflow-y-auto bg-gradient-to-b from-background to-muted/10 p-5">
          {body}
        </div>
      </DialogContent>
    </Dialog>
  );
}
