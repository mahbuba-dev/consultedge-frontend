import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth"; // If using next-auth
// import { prisma } from "@/src/lib/prisma"; // If using Prisma

// TODO: Replace with your real DB/message fetch logic
const mockMessages = [
  { id: "1", userId: "user1", roomId: "roomA", text: "Hello!", createdAt: new Date() },
  { id: "2", userId: "user2", roomId: "roomA", text: "Hi!", createdAt: new Date() },
];

export async function GET(req: NextRequest, { params }: { params: { roomId: string } }) {
  // const session = await getServerSession();
  // const userId = session?.user?.id;
  const userId = "user1"; // TODO: Replace with real user auth
  const { roomId } = params;

  // Filter messages by room and user
  const messages = mockMessages.filter(
    (m) => m.roomId === roomId && m.userId === userId
  );

  return NextResponse.json({ data: { messages } });
}
