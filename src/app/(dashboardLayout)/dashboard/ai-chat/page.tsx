import AiChatWorkspace from "@/components/modules/AiChat/AiChatWorkspace";

export const metadata = {
  title: "AI Assistant | ConsultEdge",
  description: "Chat with your AI assistant. Ask anything about experts, bookings, or consultations.",
};

export default function AiChatPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col p-4 md:p-6">
      <div className="mb-4">
        <h1 className="text-xl font-bold">AI Assistant</h1>
        <p className="text-sm text-muted-foreground">
          Chat with AI to find experts, get advice, or manage your consultations.
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <AiChatWorkspace />
      </div>
    </div>
  );
}
