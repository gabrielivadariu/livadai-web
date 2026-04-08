import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: "/:path*",
};

export function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const hostname = nextUrl.hostname.toLowerCase();

  if (hostname === "app.livadai.com") {
    const redirectUrl = new URL(req.url);
    redirectUrl.protocol = "https:";
    redirectUrl.hostname = "www.livadai.com";
    redirectUrl.port = "";
    return NextResponse.redirect(redirectUrl, 308);
  }

  return NextResponse.next();
}
