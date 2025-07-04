import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { PrismaClient } from "@prisma/client";

// Load the shared .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Load the server-specific .env file, which will override any shared variables
dotenv.config({ path: path.resolve(__dirname, ".env") });

// Load environment-specific .env file
if (process.env.NODE_ENV) {
  dotenv.config({
    path: path.resolve(__dirname, `.env.${process.env.NODE_ENV}`),
  });
}
const app = express();
const port = process.env.PORT || 3001;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get("/api/comics", async (req, res) => {
  try {
    const comics = await prisma.comic.findMany();
    res.json(comics);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
