import ChatWorkspace from "@/components/modules/ChatRoom/ChatWorkspace";

type ClientChatPageProps = {
  searchParams?: Promise<{
    expertId?: string | string[];
    participantId?: string | string[];
  }>;
};

export default async function ClientChatPage({ searchParams }: ClientChatPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const requestedParticipant = resolvedSearchParams.participantId ?? resolvedSearchParams.expertId;
  const participantId = Array.isArray(requestedParticipant)
    ? requestedParticipant[0]
    : requestedParticipant;

  return (
    <ChatWorkspace
      basePath="/dashboard/chat"
      dashboardHref="/dashboard"
      participantId={participantId}
      title="Client messages"
      description="Message experts, share files, and manage active consultations."
    />
  );
}
