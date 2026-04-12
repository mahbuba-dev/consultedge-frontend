export type SupportChatContext =
  | "general"
  | "homepage"
  | "booking"
  | "expert"
  | "payment"
  | "technical";

export type SupportChatRole = "user" | "assistant";

export interface SupportHistoryItem {
  role: SupportChatRole;
  content: string;
}

export interface SupportChatMessage {
  id: string;
  role: SupportChatRole;
  content: string;
  createdAt: string;
  suggestedActions?: string[];
  escalatedToHuman?: boolean;
  isError?: boolean;
}

export interface AiSupportApiPayload {
  message: string;
  context?: SupportChatContext;
  history?: SupportHistoryItem[];
}

export interface AiSupportApiResult {
  reply: string;
  suggestedActions?: string[];
  escalatedToHuman?: boolean;
  provider?: string;
  model?: string;
  timestamp?: string;
}

export interface AiSupportApiResponse {
  success?: boolean;
  message?: string;
  data?: AiSupportApiResult;
}

export interface QuickActionChip {
  id: string;
  label: string;
  prompt: string;
  context: SupportChatContext;
}

export const SUPPORT_QUICK_ACTIONS: QuickActionChip[] = [
  {
    id: "find-expert",
    label: "Find an expert",
    prompt: "Help me find the right expert for my business or career question.",
    context: "expert",
  },
  {
    id: "book-session",
    label: "Book a session",
    prompt: "I want to book a consultation.",
    context: "booking",
  },
  {
    id: "payment-help",
    label: "Payment help",
    prompt: "I need help with payment, checkout, or a refund.",
    context: "payment",
  },
  {
    id: "technical-issue",
    label: "Tech support",
    prompt: "I need help with login or a technical issue.",
    context: "technical",
  },
];