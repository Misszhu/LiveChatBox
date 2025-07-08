import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// 存储所有已连接的客户端
const clients = new Set<WebSocket>();

wss.on("connection", (ws: WebSocket) => {
  // 将新连接的客户端添加到集合中
  clients.add(ws);

  // 监听客户端发送的消息
  ws.on("message", (message) => {
    // 将消息广播给所有已连接的客户端
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        console.log("message", typeof message);
        client.send(message);
      }
    }
  });

  // 监听客户端关闭连接
  ws.on("close", () => {
    clients.delete(ws);
  });
});

// 每隔10秒向所有客户端推送一条系统消息
setInterval(() => {
  const msg = `系统消息：${new Date().toLocaleTimeString()}`;
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  }
}, 60000);

const PORT = process.env.PORT || 30001;
server.listen(PORT, () => {
  console.log(`WebSocket 服务器已启动，端口: ${PORT}`);
});