import ChatWorkspace from "@/components/modules/ChatRoom/ChatWorkspace";

type AdminMessagesPageProps = {
  searchParams?: Promise<{
    expertId?: string | string[];
    clientId?: string | string[];
    participantId?: string | string[];
  }>;
};

export default async function AdminMessagesPage({ searchParams }: AdminMessagesPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const requestedParticipant =
    resolvedSearchParams.participantId ??
    resolvedSearchParams.clientId ??
    resolvedSearchParams.expertId;
  const participantId = Array.isArray(requestedParticipant)
    ? requestedParticipant[0]
    : requestedParticipant;

  return (
    <ChatWorkspace
      basePath="/admin/dashboard/messages"
      dashboardHref="/admin/dashboard"
      participantId={participantId}
      title="Admin message desk"
      description="Monitor live conversations in a read-only, support-friendly workspace."
      readOnly
    />
  );
}
