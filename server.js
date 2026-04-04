import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config({ override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
const sessionMemoryStore = new Map();

function getAIProvider() {
  const explicitProvider = (process.env.AI_PROVIDER || process.env.PROVIDER || "").toLowerCase().trim();
  if (explicitProvider === "gemini") return "gemini";
  if (explicitProvider === "xai") return "xai";
  if (explicitProvider === "openai") return "openai";
  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) return "gemini";
  if (process.env.XAI_API_KEY) return "xai";
  return "openai";
}

function getAIProviderLabel() {
  const provider = getAIProvider();
  if (provider === "gemini") return "Gemini";
  if (provider === "xai") return "Grok";
  return "OpenAI";
}

function getAIKeyEnvName() {
  const provider = getAIProvider();
  if (provider === "gemini") {
    return "GEMINI_API_KEY ou GOOGLE_API_KEY";
  }

  return provider === "xai" ? "XAI_API_KEY" : "OPENAI_API_KEY";
}

function getAIKey() {
  if (getAIProvider() === "gemini") {
    return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
  }

  const envName = getAIKeyEnvName();
  return process.env[envName] || "";
}

function getAIModel() {
  if (getAIProvider() === "gemini") {
    return process.env.GEMINI_MODEL || "gemini-2.5-flash";
  }

  if (getAIProvider() === "xai") {
    return process.env.XAI_MODEL || "grok-4-0709";
  }

  return process.env.OPENAI_MODEL || "gpt-5.4";
}

function createAIClient() {
  const provider = getAIProvider();
  const options = {
    apiKey: getAIKey()
  };

  if (provider === "gemini") {
    options.baseURL = process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai/";
  }

  if (provider === "xai") {
    options.baseURL = process.env.XAI_BASE_URL || "https://api.x.ai/v1";
  }

  return new OpenAI(options);
}

function getAssistantSystemPrompt() {
  return [
    "Tu es Milo, un assistant personnel agentique.",
    "Ton rôle est de comprendre la demande réelle de l'utilisateur, même si elle est vague, puis d'agir avec les outils disponibles quand cela est utile.",
    "Réponds dans la langue de l'utilisateur.",
    "Quand la demande concerne le planning, consulte le planning puis utilise l'outil d'ajout si nécessaire au lieu de juste décrire quoi faire.",
    "Quand l'utilisateur demande de renommer, modifier ou déplacer un rappel existant, mets à jour l'événement existant au lieu d'en créer un nouveau.",
    "Quand une information durable sur l'utilisateur apparaît, tu peux l'enregistrer en mémoire avec l'outil adapté.",
    "Quand une question nécessite des informations récentes ou externes, utilise la recherche web.",
    "Sois concret, exact et utile."
  ].join(" ");
}

function getNoUnderstandingReply(language = "fr") {
  return language === "en"
    ? "I didn't understand your request clearly. Can you rephrase it more precisely?"
    : "Je n'ai pas bien compris ta demande. Reformule-la plus précisément.";
}

function extractAssistantReply(response) {
  if (response?.output_text) {
    return response.output_text;
  }

  return response?.choices?.[0]?.message?.content || null;
}

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .filter(message => message && typeof message.text === "string" && typeof message.role === "string")
    .slice(-12)
    .map(message => ({
      role: message.role === "milo" ? "assistant" : "user",
      content: message.text
    }));
}

function sanitizeProfile(profile = {}) {
  return {
    firstName: typeof profile.firstName === "string" ? profile.firstName : "",
    email: typeof profile.email === "string" ? profile.email : "",
    phone: typeof profile.phone === "string" ? profile.phone : "",
    language: typeof profile.language === "string" ? profile.language : "Français",
    accountType: typeof profile.accountType === "string" ? profile.accountType : "Personnel"
  };
}

function sanitizePlanning(planning = {}) {
  const events = Array.isArray(planning.events) ? planning.events : [];
  return {
    view: planning.view === "month" ? "month" : "day",
    currentDate: typeof planning.currentDate === "string" ? planning.currentDate : new Date().toISOString(),
    selectedEventId: typeof planning.selectedEventId === "number" ? planning.selectedEventId : null,
    events: events
      .filter(event => event && typeof event.title === "string")
      .map(event => ({
        id: typeof event.id === "number" ? event.id : null,
        date: typeof event.date === "string" ? event.date : "",
        time: typeof event.time === "string" ? event.time : "",
        title: event.title,
        description: typeof event.description === "string" ? event.description : "",
        meta: typeof event.meta === "string" ? event.meta : ""
      }))
  };
}

function getSessionId(rawSessionId) {
  if (typeof rawSessionId === "string" && rawSessionId.trim()) {
    return rawSessionId.trim();
  }

  return "default-session";
}

function getSessionMemory(sessionId) {
  if (!sessionMemoryStore.has(sessionId)) {
    sessionMemoryStore.set(sessionId, {
      notes: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }

  const memory = sessionMemoryStore.get(sessionId);
  memory.updatedAt = Date.now();
  return memory;
}

function rememberNote(sessionId, note) {
  const normalizedNote = typeof note === "string" ? note.trim() : "";
  if (!normalizedNote) {
    return { ok: false, saved: false };
  }

  const memory = getSessionMemory(sessionId);
  if (!memory.notes.includes(normalizedNote)) {
    memory.notes.push(normalizedNote);
  }

  memory.notes = memory.notes.slice(-20);
  memory.updatedAt = Date.now();

  return { ok: true, saved: true, notes: memory.notes };
}

function getMemorySnapshot(sessionId) {
  const memory = getSessionMemory(sessionId);
  return {
    notes: memory.notes,
    updatedAt: memory.updatedAt
  };
}

function buildContextMessage({ language, profile, planning, sessionId }) {
  const memory = getMemorySnapshot(sessionId);
  const upcomingEvents = planning.events.slice(0, 12).map(event => ({
    id: event.id,
    date: event.date,
    time: event.time,
    title: event.title,
    description: event.description
  }));

  return JSON.stringify({
    language,
    profile,
    planning: {
      view: planning.view,
      currentDate: planning.currentDate,
      selectedEventId: planning.selectedEventId,
      upcomingEvents
    },
    memory
  });
}

function getNextPlanningEventId(planning) {
  const maxId = planning.events.reduce((currentMax, event) => {
    if (typeof event.id !== "number") return currentMax;
    return Math.max(currentMax, event.id);
  }, 0);

  return maxId + 1;
}

function findPlanningEvent(planning, { eventId = null, title = "", date = "", time = "" }) {
  if (typeof eventId === "number") {
    return planning.events.find(event => event.id === eventId) || null;
  }

  const normalizedTitle = typeof title === "string" ? title.trim().toLowerCase() : "";
  const normalizedDate = typeof date === "string" ? date.trim() : "";
  const normalizedTime = typeof time === "string" ? time.trim() : "";
  const matches = planning.events.filter((event) => {
    if (normalizedTitle && event.title.trim().toLowerCase() !== normalizedTitle) return false;
    if (normalizedDate && event.date !== normalizedDate) return false;
    if (normalizedTime && event.time !== normalizedTime) return false;
    return normalizedTitle || normalizedDate || normalizedTime;
  });

  if (matches.length === 1) {
    return matches[0];
  }

  return null;
}

function parseJsonArguments(rawArguments) {
  if (!rawArguments) return {};

  try {
    return JSON.parse(rawArguments);
  } catch {
    return {};
  }
}

function isValidDateKey(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date || "");
}

function isValidTimeKey(time) {
  return /^\d{2}:\d{2}$/.test(time || "");
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isRateLimitError(error) {
  const rawMessage = typeof error?.message === "string"
    ? error.message.toLowerCase()
    : typeof error?.error === "string"
      ? error.error.toLowerCase()
      : "";

  return error?.status === 429
    || error?.code === "insufficient_quota"
    || rawMessage.includes("rate limit")
    || rawMessage.includes("too many requests")
    || rawMessage.includes("resource_exhausted")
    || rawMessage.includes("quota");
}

function getModelCandidates(model) {
  if (getAIProvider() !== "gemini") {
    return [model];
  }

  const fallbackModels = [
    model,
    "gemini-2.5-flash"
  ];

  return [...new Set(fallbackModels.filter(Boolean))];
}

async function createChatCompletionWithRetry(client, payload, maxAttempts = 3) {
  let lastError = null;

  for (const candidateModel of getModelCandidates(payload.model)) {
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        return await client.chat.completions.create({
          ...payload,
          model: candidateModel
        });
      } catch (error) {
        lastError = error;
        if (!isRateLimitError(error)) {
          throw error;
        }

        if (attempt < maxAttempts) {
          await delay(1200 * attempt);
          continue;
        }
      }
    }
  }

  throw lastError;
}

async function searchWeb(query) {
  const normalizedQuery = typeof query === "string" ? query.trim() : "";
  if (!normalizedQuery) {
    return { ok: false, results: [] };
  }

  const response = await fetch(`https://duckduckgo.com/html/?q=${encodeURIComponent(normalizedQuery)}`, {
    headers: {
      "User-Agent": "Milo/1.0"
    }
  });

  if (!response.ok) {
    return { ok: false, results: [], error: `HTTP ${response.status}` };
  }

  const html = await response.text();
  const matches = [...html.matchAll(/<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g)].slice(0, 5);
  const results = matches.map((match) => {
    const rawHref = match[1] || "";
    const title = (match[2] || "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim();
    let url = rawHref;

    if (rawHref.includes("uddg=")) {
      const uddg = rawHref.match(/[?&]uddg=([^&]+)/)?.[1];
      if (uddg) {
        url = decodeURIComponent(uddg);
      }
    }

    return { title, url };
  }).filter(result => result.title && result.url);

  return { ok: true, results };
}

function getAgentTools() {
  return [
    {
      type: "function",
      function: {
        name: "get_current_datetime",
        description: "Retourne la date et l'heure actuelles pour aider sur une demande temporelle.",
        parameters: { type: "object", properties: {}, additionalProperties: false }
      }
    },
    {
      type: "function",
      function: {
        name: "get_user_profile",
        description: "Retourne les informations du profil utilisateur connues par l'application.",
        parameters: { type: "object", properties: {}, additionalProperties: false }
      }
    },
    {
      type: "function",
      function: {
        name: "get_planning_snapshot",
        description: "Retourne l'état actuel du planning et les événements connus.",
        parameters: { type: "object", properties: {}, additionalProperties: false }
      }
    },
    {
      type: "function",
      function: {
        name: "add_planning_event",
        description: "Ajoute un événement au planning de l'utilisateur.",
        parameters: {
          type: "object",
          properties: {
            date: { type: "string", description: "Date au format YYYY-MM-DD" },
            time: { type: "string", description: "Heure au format HH:mm" },
            title: { type: "string", description: "Titre de la tâche" },
            description: { type: "string", description: "Description éventuelle" }
          },
          required: ["date", "time", "title"],
          additionalProperties: false
        }
      }
    },
    {
      type: "function",
      function: {
        name: "update_planning_event",
        description: "Modifie un événement existant du planning, par exemple pour changer son nom, son heure, sa date ou sa description.",
        parameters: {
          type: "object",
          properties: {
            eventId: { type: "number", description: "Identifiant de l'événement à modifier si connu" },
            currentTitle: { type: "string", description: "Titre actuel de l'événement à retrouver" },
            currentDate: { type: "string", description: "Date actuelle au format YYYY-MM-DD pour aider à cibler l'événement" },
            currentTime: { type: "string", description: "Heure actuelle au format HH:mm pour aider à cibler l'événement" },
            newTitle: { type: "string", description: "Nouveau titre de l'événement" },
            newDate: { type: "string", description: "Nouvelle date au format YYYY-MM-DD" },
            newTime: { type: "string", description: "Nouvelle heure au format HH:mm" },
            newDescription: { type: "string", description: "Nouvelle description" }
          },
          additionalProperties: false
        }
      }
    },
    {
      type: "function",
      function: {
        name: "save_memory_note",
        description: "Enregistre une préférence ou un fait durable utile sur l'utilisateur.",
        parameters: {
          type: "object",
          properties: {
            note: { type: "string", description: "Note concise à mémoriser" }
          },
          required: ["note"],
          additionalProperties: false
        }
      }
    },
    {
      type: "function",
      function: {
        name: "get_memory_notes",
        description: "Retourne les notes de mémoire connues pour cette session utilisateur.",
        parameters: { type: "object", properties: {}, additionalProperties: false }
      }
    },
    {
      type: "function",
      function: {
        name: "web_search",
        description: "Recherche des informations récentes ou externes sur le web.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "Requête à rechercher sur le web" }
          },
          required: ["query"],
          additionalProperties: false
        }
      }
    }
  ];
}

async function executeAgentTool(toolName, args, runtime) {
  switch (toolName) {
    case "get_current_datetime":
      return {
        nowIso: new Date().toISOString(),
        today: new Date().toLocaleDateString(runtime.locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
    case "get_user_profile":
      return runtime.profile;
    case "get_planning_snapshot":
      return runtime.planning;
    case "add_planning_event": {
      const date = typeof args.date === "string" ? args.date.trim() : "";
      const time = typeof args.time === "string" ? args.time.trim() : "";
      const title = typeof args.title === "string" ? args.title.trim() : "";
      const description = typeof args.description === "string" ? args.description.trim() : "";

      if (!isValidDateKey(date) || !isValidTimeKey(time) || !title) {
        return { ok: false, error: "Invalid planning event payload" };
      }

      const event = {
        id: getNextPlanningEventId(runtime.planning),
        date,
        time,
        title,
        description,
        meta: "Ajouté par Milo"
      };

      runtime.planning.events.push(event);
      runtime.planning.selectedEventId = event.id;

      runtime.actions.push({
        type: "add_planning_event",
        event,
        openPlanning: true
      });

      return { ok: true, event };
    }
    case "update_planning_event": {
      const eventId = typeof args.eventId === "number" ? args.eventId : null;
      const currentTitle = typeof args.currentTitle === "string" ? args.currentTitle.trim() : "";
      const currentDate = typeof args.currentDate === "string" ? args.currentDate.trim() : "";
      const currentTime = typeof args.currentTime === "string" ? args.currentTime.trim() : "";
      const newTitle = typeof args.newTitle === "string" ? args.newTitle.trim() : "";
      const newDate = typeof args.newDate === "string" ? args.newDate.trim() : "";
      const newTime = typeof args.newTime === "string" ? args.newTime.trim() : "";
      const newDescription = typeof args.newDescription === "string" ? args.newDescription : undefined;

      const existingEvent = findPlanningEvent(runtime.planning, {
        eventId,
        title: currentTitle,
        date: currentDate,
        time: currentTime
      });

      if (!existingEvent) {
        return { ok: false, error: "Planning event not found" };
      }

      if (newDate && !isValidDateKey(newDate)) {
        return { ok: false, error: "Invalid new date" };
      }

      if (newTime && !isValidTimeKey(newTime)) {
        return { ok: false, error: "Invalid new time" };
      }

      const updatedEvent = {
        ...existingEvent,
        title: newTitle || existingEvent.title,
        date: newDate || existingEvent.date,
        time: newTime || existingEvent.time,
        description: newDescription ?? existingEvent.description
      };

      const eventIndex = runtime.planning.events.findIndex(event => event.id === existingEvent.id);
      if (eventIndex !== -1) {
        runtime.planning.events[eventIndex] = updatedEvent;
      }
      runtime.planning.selectedEventId = updatedEvent.id;

      runtime.actions.push({
        type: "update_planning_event",
        eventId: updatedEvent.id,
        event: updatedEvent,
        openPlanning: true
      });

      return { ok: true, event: updatedEvent };
    }
    case "save_memory_note":
      return rememberNote(runtime.sessionId, args.note);
    case "get_memory_notes":
      return getMemorySnapshot(runtime.sessionId);
    case "web_search":
      return searchWeb(args.query);
    default:
      return { ok: false, error: `Unknown tool: ${toolName}` };
  }
}

async function runAgentCompletion({ client, model, message, history, language, profile, planning, sessionId }) {
  const runtime = {
    sessionId,
    locale: language === "en" ? "en-US" : "fr-FR",
    profile,
    planning,
    actions: []
  };
  const tools = getAgentTools();
  const messages = [
    { role: "system", content: getAssistantSystemPrompt() },
    { role: "system", content: `Contexte applicatif JSON: ${buildContextMessage({ language, profile, planning, sessionId })}` },
    ...sanitizeHistory(history),
    { role: "user", content: message }
  ];

  let finalReply = null;

  for (let step = 0; step < 6; step += 1) {
    const response = await createChatCompletionWithRetry(client, {
      model,
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0.4
    });

    const assistantMessage = response?.choices?.[0]?.message;
    if (!assistantMessage) {
      break;
    }

    messages.push(assistantMessage);

    const toolCalls = Array.isArray(assistantMessage.tool_calls) ? assistantMessage.tool_calls : [];
    const assistantContent = typeof assistantMessage.content === "string"
      ? assistantMessage.content
      : Array.isArray(assistantMessage.content)
        ? assistantMessage.content.map(part => part?.text || "").join(" ").trim()
        : "";

    if (!toolCalls.length) {
      finalReply = assistantContent;
      break;
    }

    for (const toolCall of toolCalls) {
      const args = parseJsonArguments(toolCall.function?.arguments);
      const result = await executeAgentTool(toolCall.function?.name, args, runtime);
      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(result)
      });
    }
  }

  return {
    reply: finalReply || getNoUnderstandingReply(language),
    actions: runtime.actions,
    memory: getMemorySnapshot(sessionId)
  };
}

function getAssistantErrorReply(error) {
  const providerLabel = getAIProviderLabel();
  const keyEnvName = getAIKeyEnvName();
  const rawMessage = typeof error?.message === "string"
    ? error.message
    : typeof error?.error === "string"
      ? error.error
      : "";

  if (!getAIKey()) {
    return `La clé ${providerLabel} n'est pas configurée. Ajoute ${keyEnvName} dans le fichier .env pour activer Milo.`;
  }

  if (rawMessage.includes("Incorrect API key provided")) {
    return `La clé ${providerLabel} est invalide. Remplace ${keyEnvName} par une vraie clé API générée depuis la console du provider.`;
  }

  if (rawMessage.includes("API key not valid") || rawMessage.includes("invalid API key") || rawMessage.includes("API_KEY_INVALID")) {
    return `La clé ${providerLabel} est invalide. Vérifie ${keyEnvName} dans le fichier .env.`;
  }

  if (rawMessage.includes("does not have permission to execute the specified operation") || rawMessage.includes("doesn't have any credits or licenses yet")) {
    return `Le compte ${providerLabel} est bien connecté, mais cette équipe n'a pas encore de crédits ou de licence active. Active la facturation dans la console xAI puis réessaie.`;
  }

  if (rawMessage.includes("PERMISSION_DENIED") || rawMessage.includes("SERVICE_DISABLED") || rawMessage.includes("API has not been used") || rawMessage.includes("Generative Language API")) {
    return `Le compte ${providerLabel} n'est pas autorisé à utiliser l'API pour ce projet. Vérifie l'activation de l'API Gemini et les autorisations du projet Google AI Studio.`;
  }

  if (rawMessage.includes("RESOURCE_EXHAUSTED") || rawMessage.includes("quota") || rawMessage.includes("rate limit")) {
    return `Le quota ${providerLabel} est atteint ou limité pour le moment. Réessaie plus tard ou augmente les quotas du projet.`;
  }

  if (error?.code === "insufficient_quota" || (error?.status === 429 && error?.type === "insufficient_quota")) {
    return `Milo est temporairement indisponible car le quota ${providerLabel} du projet est atteint. Vérifie la facturation ou utilise une autre clé API.`;
  }

  if (error?.status === 429) {
    return "Milo reçoit trop de requêtes en ce moment. Réessaie dans quelques instants.";
  }

  if (error?.status === 401 || error?.code === "invalid_api_key") {
    return `La clé ${providerLabel} semble invalide. Vérifie ${keyEnvName} dans le fichier .env.`;
  }

  return "Milo ne peut pas répondre pour le moment. Réessaie dans un instant.";
}

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [], language = "fr", profile = {}, planning = {}, sessionId } = req.body;
    const client = createAIClient();
    const model = getAIModel();
    const safeProfile = sanitizeProfile(profile);
    const safePlanning = sanitizePlanning(planning);
    const safeSessionId = getSessionId(sessionId);

    const response = await runAgentCompletion({
      client,
      model,
      message,
      history,
      language,
      profile: safeProfile,
      planning: safePlanning,
      sessionId: safeSessionId
    });

    res.json({
      reply: response.reply,
      actions: response.actions,
      memory: response.memory,
      provider: getAIProviderLabel(),
      model
    });
  } catch (error) {
    console.error(`Erreur ${getAIProviderLabel()} :`, error);
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