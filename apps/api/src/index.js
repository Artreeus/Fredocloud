const { env } = require("./config/env");
const { app } = require("./app");

app.listen(env.port, () => {
  console.log(`API server listening on http://localhost:${env.port}`);
});
