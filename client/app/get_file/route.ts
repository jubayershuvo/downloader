import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing url", { status: 400 });
  }
  console.log("Fetching file from URL:", url);

  let fileRes;
  try {
    fileRes = await fetch(url);
  } catch {
    return NextResponse.redirect(url);
  }

  if (!fileRes.ok) {
    return NextResponse.redirect(url);
  }

  const contentType = fileRes.headers.get("content-type") || "application/octet-stream";
  const contentLength = fileRes.headers.get("content-length");

  // Decode filename from URL
  const rawFilename = url.split("/").pop() || "file";
  const decodedFilename = decodeURIComponent(rawFilename);

  // Encode safely for Content-Disposition
  const safeFilename = encodeURIComponent(decodedFilename);

  console.log("Serving file:", decodedFilename);

  return new NextResponse(fileRes.body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename*=UTF-8''${safeFilename}`,
      ...(contentLength && { "Content-Length": contentLength })
    },
  });
}
