import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { role } = await req.json();

  if (!role) {
    return new NextResponse("Role is required", { status: 400 });
  }

  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: role,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clerk metadata update failed", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
