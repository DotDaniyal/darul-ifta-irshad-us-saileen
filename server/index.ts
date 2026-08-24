import { createServer } from "http";
import { createApp } from "./app";
function resolvePort(value = process.env.PORT) {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(
      "A valid PORT environment variable is required to start the server."
    );
  }
  return port;
}
async function startServer() {
  const app = createApp();
  const server = createServer(app);
  const port = resolvePort();
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(error => {
  console.error("Server startup failed.", error);
  process.exitCode = 1;
});
