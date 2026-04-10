import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = request.cookies.get("admin_session");
  const secret = process.env.ADMIN_SESSION_SECRET || "fallback-secret";

  if (!session?.value) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const decoded = Buffer.from(session.value, "base64").toString("utf-8");
    // token format: username:timestamp:secret
    const parts = decoded.split(":");
    if (parts.length >= 3 && parts[parts.length - 1] === secret) {
      return NextResponse.json({ authenticated: true });
    }
    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
