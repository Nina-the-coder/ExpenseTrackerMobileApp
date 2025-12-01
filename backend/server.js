import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import connectDB from "./config/db.js"
import authRoutes from "./routes/authRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";

connectDB();

const app = express();
// app.use(cors({
//   origin: "*", // Allows requests from any origin
//   methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allows these HTTP methods
//   credentials: true // Allows cookies/authorization headers
// }));

app.use(express.json());

console.log("2");
// Routes

app.use((req, res, next) => {
  console.log("🔥 Incoming Request:", req.method, req.originalUrl);
  next();
});
app.get("/", (req, res) => {
  res.send("whylo");
})

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
