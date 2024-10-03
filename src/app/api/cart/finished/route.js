import { validateAndRefreshToken } from "@/lib/validate_token";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { validAccessToken, response } = await validateAndRefreshToken(request);

  if (!validAccessToken) {
    return (
      response ||
      NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    );
  }

  try {
    const cartResponse = await fetch(
      `${process.env.HOST_NAME}/api/cart/finished`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${validAccessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!cartResponse.ok) {
      return NextResponse.json(
        { message: "Failed to fetch carts" },
        { status: cartResponse.status }
      );
    }

    const carts = await cartResponse.json();

    // If the response already has cookies set, return that response
    if (response) {
      // Here, response.json is not a method. We need to create a new response with the product data.
      const newResponse = NextResponse.json(carts, { status: 200 });
      newResponse.headers.set("Set-Cookie", response.headers.get("Set-Cookie"));
      return newResponse;
    }

    // Otherwise, just return the product data
    return NextResponse.json(carts, { status: 200 });
  } catch (error) {
    console.error("Error fetching carts:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
