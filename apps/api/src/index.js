const { app } = require("./app");
const { env } = require("./config/env");

if (require.main === module) {
  app.listen(env.port, () => {
    console.log(`API server listening on http://localhost:${env.port}`);
  });
}

module.exports = app;
