import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function getAssistantErrorReply(error) {
  if (!process.env.OPENAI_API_KEY) {
    return "La clé OpenAI n'est pas configurée. Ajoute OPENAI_API_KEY dans le fichier .env pour activer Milo.";
  }

  if (error?.code === "insufficient_quota" || (error?.status === 429 && error?.type === "insufficient_quota")) {
    return "Milo est temporairement indisponible car le quota OpenAI du projet est atteint. Vérifie la facturation ou utilise une autre clé API.";
  }

  if (error?.status === 429) {
    return "Milo reçoit trop de requêtes en ce moment. Réessaie dans quelques instants.";
  }

  if (error?.status === 401 || error?.code === "invalid_api_key") {
    return "La clé OpenAI semble invalide. Vérifie OPENAI_API_KEY dans le fichier .env.";
  }

  return "Milo ne peut pas répondre pour le moment. Réessaie dans un instant.";
}

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    const input = [
      {
        role: "system",
        content: "Tu es Milo, un assistant qui rend accessible l’automatisation de l’IA au quotidien. Réponds en français, clairement et de façon utile."
      },
      ...history,
      {
        role: "user",
        content: message
      }
    ];

    const response = await client.responses.create({
      model: "gpt-5.4",
      input
    });

    res.json({
      reply: response.output_text || "Je n'ai pas de réponse pour le moment."
    });
  } catch (error) {
    console.error("Erreur OpenAI :", error);
    const statusCode = error?.status && Number.isInteger(error.status) ? error.status : 500;

    res.status(statusCode).json({
      reply: getAssistantErrorReply(error)
    });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serveur Milo lancé sur http://localhost:${port}`);
});