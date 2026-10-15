export type SupportMessageAuthor = "company" | "agent" | "system";

export interface SupportMessage {
  id: string;
  author: SupportMessageAuthor;
  authorName: string;
  body: string;
  sentAt: string;
}

export interface SupportConversation {
  id: string;
  status: "open" | "waiting_on_company" | "closed";
  subject: string;
  /** Assigned Sherix agent, null while waiting in the queue. */
  agent: { name: string } | null;
  messages: SupportMessage[];
}

/** A message the user typed that the server has not confirmed yet. */
export interface PendingSupportMessage {
  tempId: string;
  body: string;
  status: "sending" | "failed";
}
