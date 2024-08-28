import { NextResponse } from "next/server";

export async function POST(req) {
  const { username, password } = await req.json();

  const response = await fetch("https://pos.koyeb.app/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const result = await response.json();

  if (result.code === 200) {
    // Set cookies for access and refresh tokens
    const accessTokenCookie = `accessToken=${
      result.data.access
    }; Path=/; HttpOnly; Expires=${new Date(
      result.data.access_valid_until
    ).toUTCString()}`;
    const refreshTokenCookie = `refreshToken=${
      result.data.refresh
    }; Path=/; HttpOnly; Expires=${new Date(
      result.data.refresh_valid_until
    ).toUTCString()}`;

    return new NextResponse("Login successful", {
      status: 200,
      headers: {
        "Set-Cookie": [accessTokenCookie, refreshTokenCookie],
      },
    });
  } else {
    return new NextResponse("Login failed", { status: 401 });
  }
}
