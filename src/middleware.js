import { NextResponse } from "next/server";

export async function middleware(request) {
  const url = new URL(request.url);
  const { pathname } = url;

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // Redirect to dashboard if user is authenticated and tries to access the login page
  if (accessToken && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect to login if no access token and user tries to access protected pages
  const protectedPaths = ["/dashboard", "/profile", "/api/product"];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (!accessToken && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // (Optional) Implement token expiration check here
  const isTokenExpired = false; // Replace with actual token expiration logic

  if (isTokenExpired && refreshToken) {
    // Attempt to refresh the access token
    try {
      const refreshResponse = await fetch("/api/refresh-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshResponse.ok) {
        const newTokens = await refreshResponse.json();

        // Update cookies with new tokens
        const response = NextResponse.next();
        response.cookies.set("accessToken", newTokens.accessToken);
        response.cookies.set("refreshToken", newTokens.refreshToken);

        return response;
      } else {
        // Refresh token failed, redirect to login
        return NextResponse.redirect(new URL("/login", request.url));
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/login", "/api/product"],
};
