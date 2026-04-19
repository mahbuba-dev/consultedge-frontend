import ChatWorkspace from "@/components/modules/ChatRoom/ChatWorkspace";

type AdminMessageRoomPageProps = {
  params: Promise<{
    roomId: string;
  }>;
};

export default async function AdminMessageRoomPage({ params }: AdminMessageRoomPageProps) {
  const { roomId } = await params;

  return (
    <ChatWorkspace
      basePath="/admin/dashboard/messages"
      dashboardHref="/admin/dashboard"
      selectedRoomId={roomId}
      title="Admin message desk"
      description="Monitor and join live conversations from the admin workspace."
    />
  );
}
