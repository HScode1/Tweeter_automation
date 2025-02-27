import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { timezone, tweetsPerPage, sortOrder, autoImport, importSource } = await req.json();

  const updatedPrefs = await prisma.userPreferences.upsert({
    where: { userId },
    update: { timezone, tweetsPerPage, sortOrder, autoImport, importSource },
    create: { userId, timezone, tweetsPerPage, sortOrder, autoImport, importSource },
  });

  return NextResponse.json(updatedPrefs);
}
