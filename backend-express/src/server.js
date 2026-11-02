import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = Number(process.env.PORT || 5002);

async function start() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `VC Tech Express API: http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

start();
