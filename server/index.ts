import { WebSocketServer } from "ws";
import { setupWSConnection } from "y-websocket/bin/utils";

const PORT = Number(process.env.PORT) || 1234;
const HOST = process.env.HOST || "0.0.0.0";

const wss = new WebSocketServer({ port: PORT, host: HOST });

wss.on("connection", (ws, req) => {
  console.log(
    `[NexusCode] Client connected (${wss.clients.size} total) from ${req.socket.remoteAddress}`,
  );
  setupWSConnection(ws, req);
});

wss.on("listening", () => {
  console.log(`[NexusCode] y-websocket server running on ws://${HOST}:${PORT}`);
});

wss.on("error", (err) => {
  console.error("[NexusCode] WebSocket server error:", err);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n[NexusCode] Shutting down…");
  wss.close(() => process.exit(0));
});

process.on("SIGTERM", () => {
  wss.close(() => process.exit(0));
});
