import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)));
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 3001);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8"
};

function getRequestPath(requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl, "http://localhost").pathname);
  return pathname === "/" ? "/index.html" : pathname;
}

async function resolveFile(requestUrl) {
  const requestPath = getRequestPath(requestUrl);
  const requested = resolve(root, `.${requestPath}`);

  if (requested !== root && !requested.startsWith(`${root}${sep}`)) {
    return null;
  }

  const info = await stat(requested).catch(() => null);
  if (info?.isFile()) {
    return requested;
  }

  if (info?.isDirectory()) {
    const indexFile = join(requested, "index.html");
    const indexInfo = await stat(indexFile).catch(() => null);
    return indexInfo?.isFile() ? indexFile : null;
  }

  if (!extname(requested)) {
    const indexFile = join(requested, "index.html");
    const indexInfo = await stat(indexFile).catch(() => null);
    return indexInfo?.isFile() ? indexFile : null;
  }

  return null;
}

const server = createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end("Method Not Allowed");
    return;
  }

  try {
    const filePath = await resolveFile(request.url || "/");
    if (!filePath) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not Found");
      return;
    }

    const contentType = mimeTypes[extname(filePath).toLowerCase()] || "application/octet-stream";
    const headers = { "Content-Type": contentType };
    const fileInfo = await stat(filePath);
    headers["Content-Length"] = fileInfo.size;
    response.writeHead(200, headers);

    if (request.method === "HEAD") {
      response.end();
      return;
    }

    createReadStream(filePath).pipe(response);
  } catch (error) {
    console.error(error);
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Internal Server Error");
  }
});

server.listen(port, host, () => {
  console.log(`Unique Fitness Gym: http://${host}:${port}`);
});
