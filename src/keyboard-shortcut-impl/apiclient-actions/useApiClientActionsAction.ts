import { useBindShortcutActions } from "@/frameworks/keyboard-shortcut";
import { executeRequest } from "@/components/APIClient/utils/request-executor";
import { useApiClientStore } from "@/store/api-client-store";

async function sendRequest(): Promise<void> {
  const {
    requests,
    activeRequestTabId,
    sendingByRequestId,
    setSendingFor,
    setResponseFor,
  } = useApiClientStore.getState();

  const activeRequest = requests.find((r) => r.id === activeRequestTabId);
  if (!activeRequest || !activeRequest.url.trim()) return;
  if (sendingByRequestId[activeRequest.id]) return;

  const requestId = activeRequest.id;
  setSendingFor(requestId, true);
  setResponseFor(requestId, null);
  try {
    const response = await executeRequest(activeRequest);
    setResponseFor(requestId, response);
  } finally {
    setSendingFor(requestId, false);
  }
}

function closeTab(): void {
  const { activeRequestTabId, closeRequestTab } = useApiClientStore.getState();
  if (!activeRequestTabId) return;
  closeRequestTab(activeRequestTabId);
}

export function useApiClientActionsAction(): void {
  useBindShortcutActions({
    "apiclient.sendRequest": sendRequest,
    "apiclient.closeTab": closeTab,
  });
}
