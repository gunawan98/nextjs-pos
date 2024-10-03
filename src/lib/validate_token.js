import { NextResponse } from "next/server";

/**
 * Validates the access token and refreshes it if expired, then sets new tokens in cookies if needed.
 * @param {NextRequest} request - The incoming request object.
 * @returns {Object} - An object containing the valid access token and the response to return (if any).
 */
export async function validateAndRefreshToken(request) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (!refreshToken) {
    return {
      validAccessToken: null,
      response: NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      ),
    };
  }

  let validAccessToken = accessToken;
  let newAccessToken = null;
  let newRefreshToken = null;
  let accessValidUntil = null;
  let refreshValidUntil = null;

  // Check if the access token is expired
  if (!accessToken && refreshToken) {
    try {
      // Attempt to refresh the access token using the refresh token
      const refreshResponse = await fetch(
        `${process.env.HOST_NAME}/api/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh: refreshToken }),
        }
      );

      const refreshResult = await refreshResponse.json();

      if (refreshResult.code === 200) {
        // Successfully refreshed tokens
        newAccessToken = refreshResult.data.access;
        newRefreshToken = refreshResult.data.refresh;
        accessValidUntil = new Date(refreshResult.data.access_valid_until);
        refreshValidUntil = new Date(refreshResult.data.refresh_valid_until);

        validAccessToken = newAccessToken;

        // Create a response with the new cookies
        const response = NextResponse.json(
          { message: "Token refreshed successfully" },
          { status: 200 }
        );

        response.cookies.set("accessToken", newAccessToken, {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          expires: accessValidUntil,
        });

        response.cookies.set("accessValidUntil", accessValidUntil, {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          expires: accessValidUntil,
        });

        response.cookies.set("refreshToken", newRefreshToken, {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          expires: refreshValidUntil,
        });

        response.cookies.set("refreshValidUntil", refreshValidUntil, {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          expires: refreshValidUntil,
        });

        return {
          validAccessToken,
          response,
        };
      } else {
        return {
          validAccessToken: null,
          response: NextResponse.json(
            { message: "Not authenticated" },
            { status: 401 }
          ),
        };
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      return {
        validAccessToken: null,
        response: NextResponse.json(
          { message: "Internal Server Error" },
          { status: 500 }
        ),
      };
    }
  }

  // If no refresh was needed, return the valid access token
  return {
    validAccessToken,
    response: null,
  };
}
