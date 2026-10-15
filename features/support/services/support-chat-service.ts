import type { SupportConversation, SupportMessage } from "@/features/support/types";
import { mockRequest } from "@/mocks/mock-request";
import { daysAgo } from "@/mocks/sample-data";

const AGENT_NAME = "Selasi (Sherix Support)";
const AUTO_REPLY_DELAY_MS = process.env.NODE_ENV === "test" ? 0 : 2500;

const sampleConversation: SupportConversation = {
  id: "conv_sample_001",
  status: "open",
  subject: "Payout for SR-24117 not received",
  agent: { name: AGENT_NAME },
  messages: [
    {
      id: "msg_1",
      author: "system",
      authorName: "Sherix",
      body: "Conversation started. A support agent usually replies within 10 minutes during business hours.",
      sentAt: daysAgo(1, 9, 2),
    },
    {
      id: "msg_2",
      author: "company",
      authorName: "You",
      body: "Hi, our mechanic Kofi Mensah completed SR-24117 on Monday but the payout still shows as processing.",
      sentAt: daysAgo(1, 9, 3),
    },
    {
      id: "msg_3",
      author: "agent",
      authorName: AGENT_NAME,
      body: "Thanks for reaching out! I can see the payout was queued. Mobile money transfers can take up to 24 hours. I'll keep an eye on it for you.",
      sentAt: daysAgo(1, 9, 11),
    },
    {
      id: "msg_4",
      author: "agent",
      authorName: AGENT_NAME,
      body: "Update: the transfer has been sent. Kofi should see it shortly. Is there anything else I can help with?",
      sentAt: daysAgo(0, 8, 40),
    },
  ],
};

let messageCounter = sampleConversation.messages.length;

/**
 * TODO: connect to backend — expected endpoint: GET /company/support/conversation
 * (the company's active conversation; create-on-first-message is also fine)
 * Response: {
 *   id, status: "open" | "waiting_on_company" | "closed", subject,
 *   agent: { name } | null,
 *   messages: [{ id, author: "company" | "agent" | "system", authorName, body, sentAt }]   // oldest first
 * }
 * Internal agent notes must never be included. Polled every few seconds by the UI;
 * a WebSocket/SSE channel would replace polling if available.
 */
export async function getSupportConversation(): Promise<SupportConversation> {
  return mockRequest("support", () => sampleConversation);
}

/**
 * TODO: connect to backend — expected endpoint: POST /company/support/conversation/messages
 * Body: { body: string (1–2000 chars), clientMessageId: string }   // clientMessageId de-duplicates retries
 * Response: the created message { id, author: "company", authorName, body, sentAt }
 */
export async function sendSupportMessage(body: string, clientMessageId: string): Promise<SupportMessage> {
  return mockRequest("support", () => {
    const existing = sampleConversation.messages.find((message) => message.id === clientMessageId);
    if (existing) {
      return existing;
    }

    const message: SupportMessage = {
      id: clientMessageId,
      author: "company",
      authorName: "You",
      body: body.trim(),
      sentAt: new Date().toISOString(),
    };
    sampleConversation.messages.push(message);

    // Sample-only: simulate an agent reply that the UI picks up on its next poll.
    setTimeout(() => {
      messageCounter += 1;
      sampleConversation.messages.push({
        id: `msg_${messageCounter}`,
        author: "agent",
        authorName: AGENT_NAME,
        body: "Thanks, I've got your message and I'm looking into it now.",
        sentAt: new Date().toISOString(),
      });
    }, AUTO_REPLY_DELAY_MS);

    return message;
  });
}
