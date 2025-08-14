import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import chatRoute from "./routes/chat";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));

app.use(chatRoute);

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`[GarbageAI] Chatbot API listening on :${port}`);
});
