
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// Helper to adapt Node request to Web Request
async function nodeToWebRequest(req: any) {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host || 'localhost';
  const url = `${protocol}://${host}${req.originalUrl}`;
  
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      value.forEach(v => headers.append(key, v as string));
    } else if (value) {
      headers.set(key, value as string);
    }
  }

  const method = req.method;
  let body = null;

  if (method !== 'GET' && method !== 'HEAD') {
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    body = Buffer.concat(buffers);
  }

  return new Request(url, {
    method,
    headers,
    body
  });
}

// Helper to send Web Response to Node response
async function sendWebResponse(res: any, webRes: Response) {
  res.statusCode = webRes.status;
  webRes.headers.forEach((val, key) => {
    res.setHeader(key, val);
  });
  
  const body = await webRes.text();
  res.end(body);
}

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  console.log("Loading Vite Config...");
  // Load env from project root (../)
  const envDir = path.resolve(__dirname, "..");
  const env = loadEnv(mode, envDir, ""); 
  // Inject into process.env for the handlers
  Object.assign(process.env, env);

  return {
    plugins: [
      vue(),
      {
        name: 'api-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (!req.url?.startsWith('/api')) {
               return next();
            }

            try {
              // Map URL to handler
              const urlPath = req.url.split('?')[0];
              
              let handlerModule;
              // Use dynamic import to avoid load issues
              if (urlPath === '/api/generate') {
                  handlerModule = await import('../api/generate');
              } else if (urlPath === '/api/translate') {
                  handlerModule = await import('../api/translate');
              } else if (urlPath === '/api/auth/login') {
                  handlerModule = await import('../api/auth/login');
              } else if (urlPath === '/api/auth/register') {
                  handlerModule = await import('../api/auth/register');
              } else if (urlPath === '/api/read-url') {
                  handlerModule = await import('../api/read-url');
              }
              
              if (handlerModule) {
                const method = req.method || 'GET';
                const handler = handlerModule[method] || handlerModule.default;

                if (handler) {
                  const webReq = await nodeToWebRequest(req);
                  const webRes = await handler(webReq);
                  await sendWebResponse(res, webRes);
                } else {
                  console.warn(`No handler found for ${method} ${urlPath}`);
                  next();
                }
              } else {
                next();
              }
            } catch (e: any) {
              console.error("API Middleware Error:", e);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: e.message }));
            }
          });
        }
      }
    ],

    // Vite options tailored for Tauri development
    clearScreen: false,
    server: {
      port: 1420,
      strictPort: true,
      host: host || false,
      hmr: host
        ? {
            protocol: "ws",
            host,
            port: 1421,
          }
        : undefined,
      watch: {
        ignored: ["**/src-tauri/**"],
      },
    },
  };
});
