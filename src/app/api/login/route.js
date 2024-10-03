import { NextResponse } from "next/server";

export async function POST(req) {
  const { username, password } = await req.json();

  const response = await fetch(`${process.env.HOST_NAME}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const result = await response.json();

  if (result.code === 200) {
    const res = new NextResponse("Login successful", { status: 200 });

    // Set cookies for access and refresh tokens
    res.cookies.set("accessToken", result.data.access, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(result.data.access_valid_until),
      // maxAge: 5, // 1 hour, in seconds
    });

    res.cookies.set("accessValidUntil", result.data.access_valid_until, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(result.data.access_valid_until),
      // maxAge: 5, // 1 hour, in seconds
    });

    res.cookies.set("refreshToken", result.data.refresh, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(result.data.refresh_valid_until),
      // maxAge: 7 * 24 * 60 * 60, // 7 days, in seconds
    });

    res.cookies.set("refreshValidUntil", result.data.refresh_valid_until, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(result.data.refresh_valid_until),
      // maxAge: 7 * 24 * 60 * 60, // 7 days, in seconds
    });

    return res;
  } else {
    return new NextResponse("Login failed", { status: 401 });
  }
}
