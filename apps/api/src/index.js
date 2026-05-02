const http = require("http");
const { env } = require("./config/env");
const { app } = require("./app");
const { initSocketServer } = require("./lib/socket");

const server = http.createServer(app);

initSocketServer(server);

server.listen(env.port, () => {
  console.log(`API server listening on http://localhost:${env.port}`);
});
