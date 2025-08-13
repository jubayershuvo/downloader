import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return new Response("Missing url", { status: 400 });
  }

  // Fetch the file from the remote URL
  const fileRes = await fetch(url);

  if (!fileRes.ok) {
    return new Response("Failed to fetch file", { status: 500 });
  }

  // Get content type
  const contentType = fileRes.headers.get("content-type") || "application/octet-stream";

  // Get content length
  const contentLength = fileRes.headers.get("content-length") || undefined;

  // Decode filename from URL
  const rawFilename = url.split("/").pop() || "file";
  const filename = decodeURIComponent(rawFilename);

  return new Response(fileRes.body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      ...(contentLength && { "Content-Length": contentLength }),
    },
  });
}

