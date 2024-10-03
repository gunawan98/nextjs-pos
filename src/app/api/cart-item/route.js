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

  // Parse the request URL to get the cartId
  const { searchParams } = new URL(request.url);
  const cartID = searchParams.get("cartId");

  if (!cartID) {
    return NextResponse.json(
      { message: "Cart ID is required" },
      { status: 400 }
    );
  }

  try {
    const productResponse = await fetch(
      `${process.env.HOST_NAME}/api/cart-item/${cartID}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${validAccessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!productResponse.ok) {
      return NextResponse.json(
        { message: "Failed to fetch cart items" },
        { status: productResponse.status }
      );
    }

    const products = await productResponse.json();

    // If the response already has cookies set, return that response
    if (response) {
      const newResponse = NextResponse.json(products, { status: 200 });
      newResponse.headers.set("Set-Cookie", response.headers.get("Set-Cookie"));
      return newResponse;
    }

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Error fetching cart items:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
