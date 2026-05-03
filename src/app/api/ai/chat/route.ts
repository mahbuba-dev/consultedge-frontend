import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MODEL = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

const SYSTEM_PROMPT =
  "You are ConsultEdge AI assistant. Help users with experts, bookings, payments, sessions, and account support. Keep responses practical, concise, and friendly. Do not assume the user is on the dashboard unless they explicitly mention dashboard.";

type ChatHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

type ChatBody = {
  message?: string;
  context?: string;
  history?: ChatHistoryItem[];
};

const buildLocalReply = (message: string, context?: string) => {
  const normalized = message.toLowerCase();

  if (normalized.includes("book") || normalized.includes("session")) {
    return "To book quickly: open an expert profile, choose an available slot, and confirm payment. If you share your industry and goal, I can suggest what kind of expert to book first.";
  }

  if (normalized.includes("payment") || normalized.includes("refund")) {
    return "For payment issues, first verify transaction status in your dashboard and email receipt. If a payment failed or refund is delayed, share the error text and I will guide you step by step.";
  }

  if (normalized.includes("expert") || normalized.includes("consultant")) {
    return "I can help you pick the right expert. Tell me your industry, budget range, and what outcome you want in the next 30 days, and I will narrow down the best fit.";
  }

  return context
    ? `I can help with ${context}. Share a little more detail about your goal and timeline, and I will suggest the best next step.`
    : "I can help with experts, bookings, payments, and sessions. Share your goal and I will suggest the next best step.";
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatBody;
    const message = (body.message || "").trim();

    if (!message) {
      return NextResponse.json(
        { success: false, message: "Message is required." },
        { status: 400 },
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: true,
        data: {
          reply: buildLocalReply(message, body.context),
          provider: "local-fallback",
          model: "heuristic",
          timestamp: new Date().toISOString(),
        },
      });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const history = Array.isArray(body.history) ? body.history.slice(-10) : [];

    const completion = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.5,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...(body.context
          ? [{ role: "system" as const, content: `Context: ${body.context}` }]
          : []),
        ...history.map((item) => ({
          role: item.role,
          content: item.content,
        })),
        { role: "user", content: message },
      ],
    });

    const reply =
      completion.choices[0]?.message?.content?.trim() ||
      "I can help with that. Could you share a little more detail?";

    return NextResponse.json({
      success: true,
      data: {
        reply,
        provider: "openai",
        model: MODEL,
        timestamp: new Date().toISOString(),
      },
    });
  } catch {
    const safeReply = "AI is currently busy. I can still help: tell me your goal, timeline, and budget, and I will suggest your next step.";
    return NextResponse.json({
      success: true,
      data: {
        reply: safeReply,
        provider: "local-fallback",
        model: "heuristic",
        timestamp: new Date().toISOString(),
      },
    });
  }
}
