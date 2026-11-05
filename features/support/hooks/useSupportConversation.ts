"use client";

import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSupportConversation,
  sendSupportMessage,
} from "@/features/support/services/support-chat-service";
import type { PendingSupportMessage, SupportConversation } from "@/features/support/types";
import { isCompanyAdmin, useAuthStore } from "@/store/auth-store";

export const supportConversationQueryKey = ["support-conversation"] as const;
const POLL_INTERVAL_MS = 5_000;

let clientMessageCounter = 0;
function createClientMessageId() {
  clientMessageCounter += 1;
  return `client_${Date.now()}_${clientMessageCounter}`;
}

export function useSupportConversation() {
  const queryClient = useQueryClient();
  const { hasHydrated, token, user } = useAuthStore();
  const [pending, setPending] = useState<PendingSupportMessage[]>([]);

  const query = useQuery({
    queryKey: supportConversationQueryKey,
    queryFn: getSupportConversation,
    enabled: hasHydrated && Boolean(token && isCompanyAdmin(user)),
    refetchInterval: POLL_INTERVAL_MS,
  });

  const deliver = useCallback(
    async (tempId: string, body: string) => {
      setPending((current) =>
        current.map((message) => (message.tempId === tempId ? { ...message, status: "sending" } : message)),
      );

      try {
        const message = await sendSupportMessage(body, tempId);
        queryClient.setQueryData<SupportConversation>(supportConversationQueryKey, (conversation) =>
          conversation && !conversation.messages.some((item) => item.id === message.id)
            ? { ...conversation, messages: [...conversation.messages, message] }
            : conversation,
        );
        setPending((current) => current.filter((item) => item.tempId !== tempId));
      } catch {
        setPending((current) =>
          current.map((item) => (item.tempId === tempId ? { ...item, status: "failed" } : item)),
        );
      }
    },
    [queryClient],
  );

  /** Shows the message immediately, then confirms it with the server. */
  const send = useCallback(
    (body: string) => {
      const tempId = createClientMessageId();
      setPending((current) => [...current, { tempId, body: body.trim(), status: "sending" }]);
      void deliver(tempId, body);
    },
    [deliver],
  );

  /** Re-sends with the same client id so the server can de-duplicate. */
  const retry = useCallback(
    (tempId: string) => {
      const message = pending.find((item) => item.tempId === tempId);
      if (message) {
        void deliver(tempId, message.body);
      }
    },
    [deliver, pending],
  );

  const discard = useCallback((tempId: string) => {
    setPending((current) => current.filter((item) => item.tempId !== tempId));
  }, []);

  return { ...query, pending, send, retry, discard };
}
