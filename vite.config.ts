import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

/**
 * Dev-only mirror of the Vercel function in api/feedback.ts so the full
 * loop can run locally with `vite dev`. Production traffic never touches this.
 */
function devApi(): Plugin {
  return {
    name: "orato-dev-api",
    configureServer(server) {
      server.middlewares.use("/api/feedback", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "method_not_allowed" }));
          return;
        }
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(chunk as Buffer);
        const bodyText = Buffer.concat(chunks).toString("utf8");
        try {
          const { handleFeedback } = await server.ssrLoadModule("/server/coach.ts");
          const out = await handleFeedback(bodyText, process.env);
          res.statusCode = out.status;
          res.setHeader("content-type", "application/json");
          res.end(out.body);
        } catch (err) {
          res.statusCode = 500;
          res.setHeader("content-type", "application/json");
          res.end(JSON.stringify({ error: "server_error", detail: String(err) }));
        }
      });
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
      includeAssets: ["favicon.svg", "icons/*.png", "orato-icon*.png", "orato-icon.svg"],
      manifest: {
        name: "Orato — Speech Training Studio",
        short_name: "Orato",
        description:
          "Daily speaking challenges and AI speech coaching. Train like a future politician, storyteller, and communication expert.",
        theme_color: "#17110F",
        background_color: "#17110F",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "/orato-icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/orato-icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/orato-icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
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
