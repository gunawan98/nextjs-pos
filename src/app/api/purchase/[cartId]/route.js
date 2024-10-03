import { validateAndRefreshToken } from "@/lib/validate_token";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { validAccessToken, response } = await validateAndRefreshToken(request);

  if (!validAccessToken) {
    return (
      response ||
      NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    );
  }

  if (!params.cartId) {
    return NextResponse.json(
      { message: "Cart ID is required" },
      { status: 400 }
    );
  }

  try {
    const purchaseResponse = await fetch(
      `${process.env.HOST_NAME}/api/purchase/${params.cartId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${validAccessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!purchaseResponse.ok) {
      return NextResponse.json(
        { message: "Failed to fetch purchase" },
        { status: purchaseResponse.status }
      );
    }

    const purchase = await purchaseResponse.json();

    // If the response already has cookies set, return that response
    if (response) {
      // Here, response.json is not a method. We need to create a new response with the product data.
      const newResponse = NextResponse.json(purchase, { status: 200 });
      newResponse.headers.set("Set-Cookie", response.headers.get("Set-Cookie"));
      return newResponse;
    }

    // Otherwise, just return the product data
    return NextResponse.json(purchase, { status: 200 });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
