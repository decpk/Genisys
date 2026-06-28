import { useMemo } from "react";

import { useApiClientStore } from "@/store/api-client-store";

import type { HttpMethod } from "../../../APIClient.types";

interface RequestMeta {
  name: string;
  method: HttpMethod;
  url: string;
}

export function useRequestMeta(requestId: string | null): RequestMeta {
  const requests = useApiClientStore((state) => state.requests);

  return useMemo(() => {
    const found = requests.find((request) => request.id === requestId);
    if (!found) return { name: "Request", method: "GET", url: "" };
    return { name: found.name, method: found.method, url: found.url };
  }, [requests, requestId]);
}
