import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

/**
 * Dev-only mirror of the Vercel functions in api/ so the full loop can run
 * locally with `vite dev`. Production traffic never touches this.
 */
function devApi(): Plugin {
  return {
    name: "orato-dev-api",
    configureServer(server) {
      const mount = (route: string, handlerName: "handleFeedback" | "handleWordCheck") => {
        server.middlewares.use(route, async (req, res) => {
          if (req.method !== "POST") {
            res.statusCode = 405;
            res.end(JSON.stringify({ error: "method_not_allowed" }));
            return;
          }
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);
          const bodyText = Buffer.concat(chunks).toString("utf8");
          try {
            const mod = await server.ssrLoadModule("/server/coach.ts");
            const out = await mod[handlerName](bodyText, process.env);
            res.statusCode = out.status;
            res.setHeader("content-type", "application/json");
            res.end(out.body);
          } catch (err) {
            res.statusCode = 500;
            res.setHeader("content-type", "application/json");
            res.end(JSON.stringify({ error: "server_error", detail: String(err) }));
          }
        });
      };
      mount("/api/feedback", "handleFeedback");
      mount("/api/word-check", "handleWordCheck");
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    devApi(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/*.png", "favicon-16.png", "favicon-32.png"],
      manifest: {
        name: "Orato — Speech Training Studio",
        short_name: "Orato",
        description:
          "Daily speaking challenges and AI speech coaching. Train like a future politician, storyteller, and communication expert.",
        theme_color: "#0D0B0A",
        background_color: "#0D0B0A",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        // All generated from public/icons/orato-logo-source.png by
        // `npm run icons` — change the logo there, not here.
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          {
            src: "/icons/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          { src: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        // The 1024px master and its fallback SVG are inputs to `npm run icons`,
        // not runtime assets — no reason to spend precache budget on them.
        globIgnores: ["**/icons/orato-logo-source.png", "**/icons/orato-emblem.svg"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^\/api\//,
            handler: "NetworkOnly",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
});
