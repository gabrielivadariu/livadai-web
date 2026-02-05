import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: "/:path*",
};

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");

  if (!isLocal && host === "livadai.com") {
    const url = req.nextUrl.clone();
    url.hostname = "www.livadai.com";
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}
