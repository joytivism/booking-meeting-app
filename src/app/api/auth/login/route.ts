import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    const validUsername = process.env.ADMIN_USERNAME;
    const validPassword = process.env.ADMIN_PASSWORD;
    const secret = process.env.ADMIN_SESSION_SECRET || "fallback-secret";

    if (!validUsername || !validPassword) {
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 }
      );
    }

    if (username === validUsername && password === validPassword) {
      // Create a simple token: base64 of username + timestamp + secret hash
      const timestamp = Date.now();
      const tokenPayload = `${username}:${timestamp}:${secret}`;
      const token = Buffer.from(tokenPayload).toString("base64");

      const response = NextResponse.json({ success: true });

      // Set HTTP-only cookie with the session token (7 days expiry)
      response.cookies.set("admin_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    return NextResponse.json(
      { error: "Username atau password salah." },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: "Request tidak valid." },
      { status: 400 }
    );
  }
}
