import ChatWorkspace from "@/components/modules/ChatRoom/ChatWorkspace";

type ExpertMessagesPageProps = {
  searchParams?: Promise<{
    expertId?: string | string[];
    clientId?: string | string[];
    participantId?: string | string[];
  }>;
};

export default async function ExpertMessagesPage({ searchParams }: ExpertMessagesPageProps) {
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
      basePath="/expert/dashboard/messages"
      dashboardHref="/expert/dashboard"
      participantId={participantId}
      title="Expert messages"
      description="Respond to clients quickly and keep every consultation thread organized."
    />
  );
}
