import { NextRequest } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://livadai-backend-production.up.railway.app";

const handler = async (req: NextRequest) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api/, "");
  const targetUrl = `${API_BASE}${path}${url.search}`;

  const headers = new Headers(req.headers);
  headers.delete("host");

  const init: RequestInit = {
    method: req.method,
    headers,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : await req.arrayBuffer(),
  };

  const res = await fetch(targetUrl, init);
  const body = await res.arrayBuffer();

  return new Response(body, {
    status: res.status,
    headers: res.headers,
  });
};

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
