import { NextRequest } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://livadai-backend-production.up.railway.app";

const DEFAULT_ALLOWED_ORIGINS = [
  "https://livadai.com",
  "https://www.livadai.com",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const allowedOrigins = new Set([
  ...DEFAULT_ALLOWED_ORIGINS,
  ...(process.env.ALLOWED_WEB_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),
]);

const isAllowedOrigin = (origin: string | null) => !origin || allowedOrigins.has(origin);

const buildCorsHeaders = (origin: string | null): Record<string, string> => {
  const headers: Record<string, string> = {
    Vary: "Origin",
  };
  if (origin && allowedOrigins.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,PATCH,DELETE,OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
  }
  return headers;
};

const handler = async (req: NextRequest) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api/, "");
  const targetUrl = `${API_BASE}${path}${url.search}`;

  const headers = new Headers(req.headers);
  headers.delete("host");

  const origin = req.headers.get("origin");
  if (!isAllowedOrigin(origin)) {
    return new Response(JSON.stringify({ message: "Origin not allowed" }), {
      status: 403,
      headers: {
        "Content-Type": "application/json",
        Vary: "Origin",
      },
    });
  }

  const corsHeaders = buildCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  try {
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
    Object.entries(corsHeaders).forEach(([key, value]) => response.headers.set(key, value));
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Proxy error";
    return new Response(JSON.stringify({ message }), {
      status: 502,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  }
};

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE, handler as OPTIONS };
