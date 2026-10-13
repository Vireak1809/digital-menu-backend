"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = require("node:http");
const app_1 = require("./app");
const env_1 = require("./config/env");
const sockets_1 = require("./sockets");
const server = (0, node_http_1.createServer)(app_1.app);
(0, sockets_1.attachSockets)(server);
server.listen(env_1.env.PORT, () => console.log(`Digital Menu API listening on port ${env_1.env.PORT}`));
