import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Clear the session cookie
  const response = NextResponse.json({ success: true });

  response.cookies.set("admin_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0, // expires immediately
  });

  // Suppress unused variable warning
  void request;

  return response;
}
