import { NextRequest } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://livadai-backend-production.up.railway.app";

const handler = async (req: NextRequest) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api/, "");
  const targetUrl = `${API_BASE}${path}${url.search}`;

  const headers = new Headers(req.headers);
  headers.delete("host");

  const origin = req.headers.get("origin") || "*";

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
        Vary: "Origin",
      },
    });
  }

  const init: RequestInit = {
    method: req.method,
    headers,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : await req.arrayBuffer(),
  };

  const res = await fetch(targetUrl, init);
  const body = await res.arrayBuffer();

  const response = new Response(body, {
    status: res.status,
    headers: res.headers,
  });
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Vary", "Origin");
  return response;
};

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
