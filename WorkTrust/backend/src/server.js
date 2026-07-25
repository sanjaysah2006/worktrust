import dotenv from "dotenv";
import app from "./app.js";
import pool from "./config/database.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Test database connection
pool.query("SELECT NOW()")
  .then(() => {
    console.log("✅ PostgreSQL Connected");
  })
  .catch((err) => {
    console.error("❌ Database Connection Failed");
    console.error(err.message);
  });

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});