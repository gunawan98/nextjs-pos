import { NextResponse } from "next/server";
import { isTokenExpired } from "../../../lib/auth";

/**
 * Fetches products from the external API, handling token expiration and refreshing.
 * @param {Request} request - The incoming request.
 * @returns {Response} - The response containing product data or an error.
 */
export async function GET(request) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (!accessToken) {
    // No access token, user is not authenticated
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  let validAccessToken = accessToken;
  let newAccessToken = null;
  let newRefreshToken = null;
  let accessValidUntil = null;
  let refreshValidUntil = null;

  // Check if the access token is expired
  if (isTokenExpired(accessToken)) {
    if (!refreshToken) {
      // No refresh token available, user needs to log in again
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Attempt to refresh the access token using the refresh token
    try {
      const refreshResponse = await fetch("https://pos.koyeb.app/api/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      const refreshResult = await refreshResponse.json();

      if (refreshResult.code === 200) {
        // Successfully refreshed tokens
        newAccessToken = refreshResult.data.access;
        newRefreshToken = refreshResult.data.refresh;
        accessValidUntil = new Date(refreshResult.data.access_valid_until);
        refreshValidUntil = new Date(refreshResult.data.refresh_valid_until);

        validAccessToken = newAccessToken;
      } else {
        // Refresh token invalid or expired
        return NextResponse.json(
          { message: "Not authenticated" },
          { status: 401 }
        );
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      return NextResponse.json(
        { message: "Internal Server Error" },
        { status: 500 }
      );
    }
  }

  // Fetch product data with the valid access token
  try {
    const productResponse = await fetch("https://pos.koyeb.app/api/product", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${validAccessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!productResponse.ok) {
      // External API returned an error
      return NextResponse.json(
        { message: "Failed to fetch products" },
        { status: productResponse.status }
      );
    }

    const products = await productResponse.json();

    // If tokens were refreshed, set new cookies
    if (
      newAccessToken &&
      newRefreshToken &&
      accessValidUntil &&
      refreshValidUntil
    ) {
      const response = NextResponse.json(products, { status: 200 });

      response.cookies.set("accessToken", newAccessToken, {
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "strict",
        expires: accessValidUntil,
      });

      response.cookies.set("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "strict",
        expires: refreshValidUntil,
      });

      return response;
    }

    // If tokens were not refreshed, return the products directly
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
