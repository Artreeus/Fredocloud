const dotenv = require("dotenv");

dotenv.config();

const { app } = require("./app");

const port = Number(process.env.PORT) || 4000;

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
