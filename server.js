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
const dailyNewsCache = new Map();
const FOOTBALL_STANDINGS_SOURCES = [
  {
    id: "serie-a",
    url: "https://www.footmercato.net/italie/serie-a/classement?partial=1&type=total",
    siteName: "Foot Mercato",
    leagueLabels: {
      fr: "Serie A",
      en: "Serie A",
      es: "Serie A"
    },
    keywords: ["serie a", "seriea", "italie"]
  }
];

const DAILY_NEWS_THEMES = ["none", "music", "politics", "economy", "sport"];
const DAILY_NEWS_QUERIES = {
  music: {
    fr: "musique actualite du jour",
    en: "music news today",
    es: "musica noticias del dia"
  },
  politics: {
    fr: "politique actualite du jour",
    en: "politics news today",
    es: "politica noticias del dia"
  },
  economy: {
    fr: "economie actualite du jour",
    en: "economy news today",
    es: "economia noticias del dia"
  },
  sport: {
    fr: "sport actualite du jour",
    en: "sports news today",
    es: "deporte noticias del dia"
  }
};
const DAILY_NEWS_LOCALES = {
  fr: { hl: "fr", gl: "FR", ceid: "FR:fr" },
  en: { hl: "en-US", gl: "US", ceid: "US:en" },
  es: { hl: "es", gl: "ES", ceid: "ES:es" }
};

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "milo-backend" });
});

function sanitizeDailyNewsTheme(theme) {
  return DAILY_NEWS_THEMES.includes(theme) ? theme : "none";
}

function sanitizeDailyNewsLanguage(language) {
  return ["fr", "en", "es"].includes(language) ? language : "fr";
}

function getDailyNewsDateKey() {
  return new Date().toISOString().slice(0, 10);
}

function getDailyNewsCacheKey(theme, language) {
  return `${getDailyNewsDateKey()}::${sanitizeDailyNewsTheme(theme)}::${sanitizeDailyNewsLanguage(language)}`;
}

function decodeHtmlEntities(value = "") {
  return String(value)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, "/")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function stripHtml(value = "") {
  const decodedValue = decodeHtmlEntities(String(value));
  return decodedValue.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function sanitizeFetchedWebText(html = "") {
  const withoutBlockedTags = String(html)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, " ");

  return stripHtml(withoutBlockedTags);
}

function extractHtmlTitle(html = "") {
  const match = String(html).match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? stripHtml(match[1]).slice(0, 160) : "";
}

function extractHtmlTableRows(html = "") {
  const rows = [...String(html).matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)]
    .map((match) => {
      const cells = [...String(match[1]).matchAll(/<(?:th|td)\b[^>]*>([\s\S]*?)<\/(?:th|td)>/gi)]
        .map((cellMatch) => stripHtml(cellMatch[1]))
        .filter(Boolean);

      return cells.length ? cells.join(" | ") : "";
    })
    .filter(Boolean);

  return rows.slice(0, 20);
}

function normalizeFetchableUrl(url) {
  const rawUrl = typeof url === "string" ? url.trim() : "";
  if (!rawUrl) return "";

  try {
    const parsedUrl = new URL(rawUrl);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return "";
    }
    return parsedUrl.toString();
  } catch {
    return "";
  }
}

async function fetchWebpage(url) {
  const normalizedUrl = normalizeFetchableUrl(url);
  if (!normalizedUrl) {
    return { ok: false, error: "Invalid URL" };
  }

  try {
    const html = await fetchTextWithTimeout(normalizedUrl, {
      headers: {
        "User-Agent": "Milo/1.0",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8"
      },
      timeoutMs: 10000
    });
    const title = extractHtmlTitle(html);
    const text = sanitizeFetchedWebText(html).slice(0, 12000);
    const tableRows = extractHtmlTableRows(html);

    return {
      ok: Boolean(title || text || tableRows.length),
      url: normalizedUrl,
      title,
      text,
      tableRows,
      excerpt: text.slice(0, 1500)
    };
  } catch (error) {
    return {
      ok: false,
      url: normalizedUrl,
      error: typeof error?.message === "string" ? error.message : "Fetch failed"
    };
  }
}

function detectFootballStandingsSource(message = "") {
  const normalizedMessage = normalizeText(typeof message === "string" ? message : "");
  if (!normalizedMessage) return null;

  const standingsKeywords = ["classement", "standing", "standings", "ranking", "table"];
  if (!standingsKeywords.some(keyword => normalizedMessage.includes(keyword))) {
    return null;
  }

  return FOOTBALL_STANDINGS_SOURCES.find((source) => (
    source.keywords.some(keyword => normalizedMessage.includes(keyword))
      || normalizedMessage.includes(normalizeText(source.siteName))
  )) || null;
}

function parseFootballStandingsRows(html = "") {
  return extractHtmlTableRows(html)
    .map((row) => row.split("|").map(cell => cell.trim()).filter(Boolean))
    .map((cells) => {
      const rank = Number.parseInt(cells[0], 10);
      const points = Number.parseInt(cells[2], 10);
      const played = Number.parseInt(cells[3], 10);
      const won = Number.parseInt(cells[5], 10);
      const drawn = Number.parseInt(cells[6], 10);
      const lost = Number.parseInt(cells[7], 10);
      const goalsFor = Number.parseInt(cells[8], 10);
      const goalsAgainst = Number.parseInt(cells[9], 10);

      if (!Number.isInteger(rank) || !cells[1] || !Number.isInteger(points) || !Number.isInteger(played)) {
        return null;
      }

      return {
        rank,
        team: cells[1],
        points,
        played,
        goalDifference: cells[4] || "0",
        won: Number.isInteger(won) ? won : null,
        drawn: Number.isInteger(drawn) ? drawn : null,
        lost: Number.isInteger(lost) ? lost : null,
        goalsFor: Number.isInteger(goalsFor) ? goalsFor : null,
        goalsAgainst: Number.isInteger(goalsAgainst) ? goalsAgainst : null
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.rank - right.rank);
}

function buildFootballStandingsReply(source, rows, language = "fr") {
  const safeLanguage = sanitizeDailyNewsLanguage(language);
  const leagueLabel = source.leagueLabels[safeLanguage] || source.leagueLabels.fr;
  const topRows = rows.slice(0, 5);
  const leader = topRows[0];
  const runnerUp = topRows[1];
  const third = topRows[2];

  if (!leader) return null;

  const podiumText = topRows
    .slice(0, 3)
    .map((entry) => `${entry.rank}. ${entry.team} (${entry.points} pts)`)
    .join(", ");
  const topFiveText = topRows
    .map((entry) => `${entry.rank}. ${entry.team} ${entry.points} pts`)
    .join(" · ");
  const gapText = runnerUp ? leader.points - runnerUp.points : 0;

  if (safeLanguage === "en") {
    return [
      `According to ${source.siteName}, ${leader.team} lead ${leagueLabel} with ${leader.points} points from ${leader.played} matches.` ,
      runnerUp && third ? `The podium is ${podiumText}, with a ${gapText}-point gap between first and second.` : "",
      `Current top 5: ${topFiveText}.`,
      `Source read directly from ${source.siteName}: ${source.url}`
    ].filter(Boolean).join(" ");
  }

  if (safeLanguage === "es") {
    return [
      `Segun ${source.siteName}, ${leader.team} lidera la ${leagueLabel} con ${leader.points} puntos en ${leader.played} partidos.`,
      runnerUp && third ? `El podio actual es ${podiumText}, con ${gapText} puntos de diferencia entre el primero y el segundo.` : "",
      `Top 5 actual: ${topFiveText}.`,
      `Fuente leida directamente en ${source.siteName}: ${source.url}`
    ].filter(Boolean).join(" ");
  }

  return [
    `Selon ${source.siteName}, ${leader.team} est leader de ${leagueLabel} avec ${leader.points} points en ${leader.played} matchs.`,
    runnerUp && third ? `Le podium actuel est ${podiumText}, avec ${gapText} points d'avance entre le premier et le deuxième.` : "",
    `Top 5 actuel: ${topFiveText}.`,
    `Source lue directement sur ${source.siteName} : ${source.url}`
  ].filter(Boolean).join(" ");
}

async function maybeBuildDirectWebFallback({ message, language }) {
  const source = detectFootballStandingsSource(message);
  if (!source) {
    return null;
  }

  try {
    const html = await fetchTextWithTimeout(source.url, {
      headers: {
        "User-Agent": "Milo/1.0",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8"
      },
      timeoutMs: 10000
    });
    const rows = parseFootballStandingsRows(html);
    const reply = buildFootballStandingsReply(source, rows, language);

    if (!reply) {
      return null;
    }

    return {
      reply,
      source: source.siteName,
      mode: "direct-web-fallback"
    };
  } catch (error) {
    console.error("Direct web fallback error:", error);
    return null;
  }
}

function extractRssTag(content, tagName) {
  const match = content.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, "i"));
  return match ? stripHtml(match[1]) : "";
}

function parseNewsRss(xml = "") {
  return [...String(xml).matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)]
    .map((match) => {
      const itemContent = match[1] || "";
      const title = extractRssTag(itemContent, "title").replace(/\s+-\s+[^-]+$/, "").trim();
      const description = extractRssTag(itemContent, "description");
      const link = extractRssTag(itemContent, "link");
      const pubDate = extractRssTag(itemContent, "pubDate");

      return {
        title,
        description,
        link,
        pubDate
      };
    })
    .filter((item) => item.title && item.link)
    .slice(0, 6);
}

async function fetchTextWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 8000);

  try {
    const response = await fetch(url, {
      headers: options.headers,
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function buildGoogleNewsRssUrl(theme, language) {
  const safeTheme = sanitizeDailyNewsTheme(theme);
  const safeLanguage = sanitizeDailyNewsLanguage(language);
  const locale = DAILY_NEWS_LOCALES[safeLanguage];
  const query = DAILY_NEWS_QUERIES[safeTheme]?.[safeLanguage] || DAILY_NEWS_QUERIES[safeTheme]?.fr || "actualite du jour";

  return `https://news.google.com/rss/search?q=${encodeURIComponent(`${query} when:1d`)}&hl=${encodeURIComponent(locale.hl)}&gl=${encodeURIComponent(locale.gl)}&ceid=${encodeURIComponent(locale.ceid)}`;
}

function buildGoogleNewsSearchUrl(query, language, recency = "when:3d") {
  const safeLanguage = sanitizeDailyNewsLanguage(language);
  const locale = DAILY_NEWS_LOCALES[safeLanguage];
  const normalizedQuery = typeof query === "string" ? query.trim() : "";

  return `https://news.google.com/rss/search?q=${encodeURIComponent(`${normalizedQuery} ${recency}`.trim())}&hl=${encodeURIComponent(locale.hl)}&gl=${encodeURIComponent(locale.gl)}&ceid=${encodeURIComponent(locale.ceid)}`;
}

async function fetchDailyNewsCandidates(theme, language) {
  const safeTheme = sanitizeDailyNewsTheme(theme);
  if (safeTheme === "none") return [];

  const rssUrl = buildGoogleNewsRssUrl(safeTheme, language);
  const xml = await fetchTextWithTimeout(rssUrl, {
    headers: {
      "User-Agent": "Milo/1.0"
    }
  });

  return parseNewsRss(xml);
}

async function fetchNewsArticlesForQuery(query, language) {
  const normalizedQuery = typeof query === "string" ? query.trim() : "";
  if (!normalizedQuery) return [];

  const rssUrl = buildGoogleNewsSearchUrl(normalizedQuery, language);
  const xml = await fetchTextWithTimeout(rssUrl, {
    headers: {
      "User-Agent": "Milo/1.0"
    },
    timeoutMs: 10000
  });

  return parseNewsRss(xml).slice(0, 5);
}

function getDailyNewsThemeLabel(theme, language) {
  const safeLanguage = sanitizeDailyNewsLanguage(language);
  const labelMap = {
    fr: { music: "musique", politics: "politique", economy: "economie", sport: "sport" },
    en: { music: "music", politics: "politics", economy: "economy", sport: "sport" },
    es: { music: "musica", politics: "politica", economy: "economia", sport: "deporte" }
  };

  return labelMap[safeLanguage]?.[theme] || labelMap.fr[theme] || theme;
}

function buildDailyNewsFallbackEntry(theme, language, articles = []) {
  const safeLanguage = sanitizeDailyNewsLanguage(language);
  const firstArticle = articles[0];
  if (!firstArticle) return null;

  if (safeLanguage === "en") {
    return {
      title: `Today in ${getDailyNewsThemeLabel(theme, language)}`,
      sub: firstArticle.description || firstArticle.title
    };
  }

  if (safeLanguage === "es") {
    return {
      title: `Hoy en ${getDailyNewsThemeLabel(theme, language)}`,
      sub: firstArticle.description || firstArticle.title
    };
  }

  return {
    title: `A retenir en ${getDailyNewsThemeLabel(theme, language)}`,
    sub: firstArticle.description || firstArticle.title
  };
}

function normalizeDailyNewsModelEntry(payload) {
  if (!payload || typeof payload !== "object") return null;

  const title = typeof payload.title === "string" ? payload.title.trim().slice(0, 140) : "";
  const sub = typeof payload.sub === "string" ? payload.sub.trim().slice(0, 320) : "";

  if (!title || !sub) return null;
  return { title, sub };
}

async function generateDailyNewsSummary({ client, model, theme, language, articles }) {
  const safeLanguage = sanitizeDailyNewsLanguage(language);
  const themeLabel = getDailyNewsThemeLabel(theme, safeLanguage);
  const serializedArticles = articles.map((article, index) => ([
    `${index + 1}. Titre: ${article.title}`,
    `Resume: ${article.description || ""}`,
    `Date: ${article.pubDate || ""}`,
    `Lien: ${article.link}`
  ].join("\n"))).join("\n\n");

  const systemPrompt = safeLanguage === "en"
    ? "You write a concise daily news card for a personal dashboard. Return strict JSON with keys title and sub only. Be factual and use only the provided articles."
    : safeLanguage === "es"
      ? "Escribes una tarjeta breve de noticias diarias para un panel personal. Devuelve un JSON estricto con solo las claves title y sub. Se factual y usa solo los articulos proporcionados."
      : "Tu rediges une carte de news quotidienne concise pour un tableau de bord personnel. Retourne un JSON strict avec uniquement les cles title et sub. Sois factuel et utilise seulement les articles fournis.";

  const userPrompt = safeLanguage === "en"
    ? `Theme: ${themeLabel}. Summarize the main signal from these recent articles into one short dashboard card.\n\n${serializedArticles}`
    : safeLanguage === "es"
      ? `Tema: ${themeLabel}. Resume la idea principal de estos articulos recientes en una sola tarjeta breve de panel.\n\n${serializedArticles}`
      : `Theme: ${themeLabel}. Resume l'idee principale de ces articles recents dans une seule carte breve de tableau de bord.\n\n${serializedArticles}`;

  const response = await createChatCompletionWithRetry(client, {
    model,
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]
  }, 2);

  const rawContent = response?.choices?.[0]?.message?.content || "";
  const parsed = JSON.parse(rawContent);
  return normalizeDailyNewsModelEntry(parsed);
}

function getAIProviderLabel() {
  return "OpenAI";
}

function getAIKeyEnvName() {
  return "OPENAI_API_KEY";
}

function getAIKey() {
  return process.env.OPENAI_API_KEY || "";
}

function getAIModel() {
  return process.env.OPENAI_MODEL || "gpt-4.1-mini";
}

function getAIFallbackModels() {
  const rawValue = typeof process.env.OPENAI_FALLBACK_MODELS === "string"
    ? process.env.OPENAI_FALLBACK_MODELS
    : "";

  return rawValue
    .split(",")
    .map(model => model.trim())
    .filter(Boolean);
}

function createAIClient() {
  const options = {
    apiKey: getAIKey()
  };
  const baseURL = typeof process.env.OPENAI_BASE_URL === "string"
    ? process.env.OPENAI_BASE_URL.trim()
    : "";

  if (baseURL) {
    options.baseURL = baseURL;
  }

  return new OpenAI(options);
}

function getAssistantSystemPrompt(agentType = "general") {
  if (agentType === "education") {
    return [
      "Tu es Milo Éducation, un assistant pédagogique spécialisé.",
      "Ta mission est de travailler à partir d'un texte collé ou d'un document importé par l'utilisateur.",
      "Tu peux créer des fiches de révision, des reformulations, des quiz, des résumés, des explications et des plans de révision.",
      "Réponds dans la langue de l'utilisateur.",
      "Quand l'utilisateur demande une fiche, produis un document directement exploitable avec un titre clair, des sections courtes, des points clés et un mini-résumé final.",
      "Quand l'utilisateur demande un quiz, produis un quiz propre avec une section Questions puis une section Corrigé séparée.",
      "Évite les longues introductions et les gros blocs de texte. Préfère des rubriques courtes, des listes et des formulations simples.",
      "Si l'utilisateur demande plusieurs livrables à la fois, sépare-les clairement avec des titres explicites.",
      "Si la demande nécessite un texte source mais qu'aucun texte collé ni document importé n'est disponible, demande clairement à l'utilisateur de coller un texte ou d'importer un document texte.",
      "N'invente pas le contenu du document si le contexte fourni est vide.",
      "Sois structuré, clair et utile pour les études."
    ].join(" ");
  }

  return [
    "Tu es Milo, un assistant personnel agentique.",
    "Ton rôle est de comprendre la demande réelle de l'utilisateur, même si elle est vague, puis d'agir avec les outils disponibles quand cela est utile.",
    "Réponds dans la langue de l'utilisateur.",
    "Quand la demande concerne le planning, consulte le planning puis utilise l'outil d'ajout si nécessaire au lieu de juste décrire quoi faire.",
    "Quand l'utilisateur demande de renommer, modifier ou déplacer un rappel existant, mets à jour l'événement existant au lieu d'en créer un nouveau.",
    "Quand l'utilisateur demande de supprimer, annuler ou retirer un rappel existant, utilise l'outil de suppression du planning.",
    "Quand une information durable sur l'utilisateur apparaît, tu peux l'enregistrer en mémoire avec l'outil adapté.",
    "Quand une question nécessite des informations récentes ou externes, utilise d'abord l'outil de recherche web enrichie.",
    "Quand tu fais une recherche web, synthétise les faits à partir de plusieurs sources lues et mentionne les sources utiles dans la réponse finale.",
    "Quand l'utilisateur demande un résumé basé sur un site précis ou sur un résultat web, ouvre d'abord la page avec l'outil de lecture de page avant de répondre.",
    "Ne te contente pas de renvoyer un lien si l'utilisateur demande une synthèse ou des données précises.",
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

function sanitizeStudyContext(studyContext = {}) {
  const documents = Array.isArray(studyContext.documents) ? studyContext.documents : [];
  return {
    pastedText: typeof studyContext.pastedText === "string" ? studyContext.pastedText.trim().slice(0, 20000) : "",
    selectedDocumentId: typeof studyContext.selectedDocumentId === "string" ? studyContext.selectedDocumentId : null,
    documents: documents
      .filter(document => document && typeof document.name === "string")
      .map(document => ({
        id: typeof document.id === "string" ? document.id : `doc-${Math.random().toString(36).slice(2, 10)}`,
        name: document.name,
        content: typeof document.content === "string" ? document.content.trim().slice(0, 20000) : ""
      }))
      .filter(document => document.content)
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
      learningPlanDraft: null,
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

function getLearningPlanDraft(sessionId) {
  return getSessionMemory(sessionId).learningPlanDraft || null;
}

function saveLearningPlanDraft(sessionId, draft) {
  const memory = getSessionMemory(sessionId);
  memory.learningPlanDraft = draft;
  memory.updatedAt = Date.now();
  return memory.learningPlanDraft;
}

function clearLearningPlanDraft(sessionId) {
  const memory = getSessionMemory(sessionId);
  memory.learningPlanDraft = null;
  memory.updatedAt = Date.now();
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

function buildEducationContextMessage({ language, profile, studyContext, sessionId }) {
  const memory = getMemorySnapshot(sessionId);
  const selectedDocument = studyContext.documents.find(document => document.id === studyContext.selectedDocumentId) || null;

  return JSON.stringify({
    language,
    profile,
    memory,
    studyContext: {
      pastedText: studyContext.pastedText,
      selectedDocumentId: studyContext.selectedDocumentId,
      selectedDocumentName: selectedDocument?.name || null,
      selectedDocumentContent: selectedDocument?.content || "",
      documents: studyContext.documents.map(document => ({
        id: document.id,
        name: document.name,
        contentPreview: document.content.slice(0, 1200)
      }))
    }
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

function normalizeText(value = "") {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function formatDateKeyFromDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey) {
  if (!isValidDateKey(dateKey)) return null;
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function normalizeLearningTopic(topic = "") {
  return topic
    .trim()
    .replace(/^[\s'’"-]+|[\s'’"-]+$/g, "")
    .replace(/^(?:le|la|les|l'|l’|du|de la|des|the)\s+/i, "")
    .replace(/[?.!,;:]+$/g, "");
}

function formatLearningTopicTitle(topic = "") {
  const normalizedTopic = normalizeLearningTopic(topic);
  if (!normalizedTopic) return "Apprentissage";
  return normalizedTopic.charAt(0).toUpperCase() + normalizedTopic.slice(1);
}

function detectLearningGoalIntent(message) {
  const rawMessage = typeof message === "string" ? message.trim() : "";
  if (!rawMessage) return null;

  const patterns = [
    /(?:je veux|j'aimerais|j aimerais|aide-moi a|aide moi a|je souhaite)\s+(?:apprendre|etudier|reviser)\s+(.+)/i,
    /(?:i want to|help me)\s+learn\s+(.+)/i,
    /learn\s+(.+)/i
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(normalizeText(rawMessage));
    if (!match?.[1]) continue;

    const topic = match[1]
      .split(/\b(?:pendant|durant|sur|avec|a raison de|for|over|with)\b/i)[0]
      .trim();

    if (topic) {
      return {
        rawTopic: topic,
        topic: normalizeLearningTopic(topic)
      };
    }
  }

  return null;
}

function parseSessionsPerWeek(message) {
  const normalizedMessage = normalizeText(message);
  const match = /(?:(\d+)\s*(?:seances?|sessions?)\s*(?:par|\/)?\s*(?:semaine|week)|(?:par|\/)?\s*(?:semaine|week)\s*:?\s*(\d+)|(?:\b|^)(\d+)\s*x\s*(?:par|\/)?\s*(?:semaine|week))/i.exec(normalizedMessage);
  const value = Number(match?.[1] || match?.[2] || match?.[3] || 0);
  return Number.isInteger(value) && value > 0 ? value : null;
}

function parseSessionDurationMinutes(message) {
  const normalizedMessage = normalizeText(message);
  const patterns = [
    /(?:seances?|sessions?)\s*de\s*(\d+(?:[.,]\d+)?)\s*(h|heure|heures|hour|hours|min|mins|minute|minutes)/i,
    /(\d+(?:[.,]\d+)?)\s*(h|heure|heures|hour|hours|min|mins|minute|minutes)\s*(?:par|\/)?\s*(?:seance|session)/i,
    /(?:par|\/)?\s*(?:seance|session)\s*:?\s*(\d+(?:[.,]\d+)?)\s*(h|heure|heures|hour|hours|min|mins|minute|minutes)/i
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(normalizedMessage);
    if (!match) continue;

    const value = Number(match[1].replace(",", "."));
    const unit = match[2];
    if (!Number.isFinite(value) || value <= 0) continue;

    if (/^h|heure|hour/.test(unit)) {
      return Math.round(value * 60);
    }

    return Math.round(value);
  }

  return null;
}

function parseLearningDuration(message) {
  const normalizedMessage = normalizeText(message);
  const keywordMatch = /(?:pendant|durant|sur|for|over)\s*(\d+(?:[.,]\d+)?)\s*(jour|jours|day|days|semaine|semaines|week|weeks|mois|month|months|an|ans|annee|annees|year|years)/i.exec(normalizedMessage);
  const genericMatch = /(\d+(?:[.,]\d+)?)\s*(jour|jours|day|days|semaine|semaines|week|weeks|mois|month|months|an|ans|annee|annees|year|years)/i.exec(normalizedMessage);
  const match = keywordMatch || genericMatch;

  if (!match) return null;

  const value = Number(match[1].replace(",", "."));
  const unit = match[2];
  if (!Number.isFinite(value) || value <= 0) return null;

  if (/jour|day/.test(unit)) {
    return {
      label: `${value} ${value > 1 ? "jours" : "jour"}`,
      totalDays: Math.ceil(value),
      totalWeeks: Math.max(1, Math.ceil(value / 7))
    };
  }

  if (/semaine|week/.test(unit)) {
    return {
      label: `${value} ${value > 1 ? "semaines" : "semaine"}`,
      totalDays: Math.ceil(value * 7),
      totalWeeks: Math.max(1, Math.ceil(value))
    };
  }

  if (/mois|month/.test(unit)) {
    return {
      label: `${value} ${value > 1 ? "mois" : "mois"}`,
      totalDays: Math.ceil(value * 30),
      totalWeeks: Math.max(1, Math.ceil((value * 30) / 7))
    };
  }

  return {
    label: `${value} ${value > 1 ? "ans" : "an"}`,
    totalDays: Math.ceil(value * 365),
    totalWeeks: Math.max(1, Math.ceil(value * 52))
  };
}

function parsePreferredTime(message) {
  const rawMessage = typeof message === "string" ? message : "";
  const patterns = [
    /(\d{1,2}):(\d{2})/,
    /(\d{1,2})[hH](\d{2})?\b/,
    /(?:a|à|vers|around)\s*(\d{1,2})\s*heures?\b/i
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(rawMessage);
    if (!match) continue;

    const hours = Number(match[1]);
    const minutes = Number(match[2] || "0");
    if (hours > 23 || minutes > 59) continue;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  return null;
}

function parsePreferredDays(message) {
  const normalizedMessage = normalizeText(message);
  if (!normalizedMessage) return [];

  if (normalizedMessage.includes("tous les jours") || normalizedMessage.includes("every day")) {
    return [1, 2, 3, 4, 5, 6, 0];
  }

  if (normalizedMessage.includes("en semaine") || normalizedMessage.includes("weekdays")) {
    return [1, 2, 3, 4, 5];
  }

  if (normalizedMessage.includes("week-end") || normalizedMessage.includes("weekend")) {
    return [6, 0];
  }

  const dayPatterns = [
    { day: 1, pattern: /\b(?:lundi|lun|monday|mon)\b/g },
    { day: 2, pattern: /\b(?:mardi|mar|tuesday|tue|tues)\b/g },
    { day: 3, pattern: /\b(?:mercredi|mer|wednesday|wed)\b/g },
    { day: 4, pattern: /\b(?:jeudi|jeu|thursday|thu|thurs)\b/g },
    { day: 5, pattern: /\b(?:vendredi|ven|friday|fri)\b/g },
    { day: 6, pattern: /\b(?:samedi|sam|saturday|sat)\b/g },
    { day: 0, pattern: /\b(?:dimanche|dim|sunday|sun)\b/g }
  ];

  const matches = [];
  for (const { day, pattern } of dayPatterns) {
    for (const match of normalizedMessage.matchAll(pattern)) {
      matches.push({ day, index: match.index ?? 0 });
    }
  }

  matches.sort((left, right) => left.index - right.index);
  return [...new Set(matches.map(match => match.day))];
}

function mergeLearningPlanDraft(draft, message) {
  const nextDraft = {
    ...draft,
    topic: draft.topic,
    topicTitle: draft.topicTitle,
    totalDuration: draft.totalDuration || null,
    sessionsPerWeek: draft.sessionsPerWeek || null,
    minutesPerSession: draft.minutesPerSession || null,
    preferredDays: Array.isArray(draft.preferredDays) ? draft.preferredDays : [],
    preferredTime: draft.preferredTime || null
  };

  const parsedDuration = parseLearningDuration(message);
  const parsedSessionsPerWeek = parseSessionsPerWeek(message);
  const parsedMinutesPerSession = parseSessionDurationMinutes(message);
  const parsedPreferredDays = parsePreferredDays(message);
  const parsedPreferredTime = parsePreferredTime(message);
  const trimmedMessage = typeof message === "string" ? message.trim() : "";

  if (parsedDuration) {
    nextDraft.totalDuration = parsedDuration;
  } else if (!nextDraft.totalDuration && /^\d+\s*(?:semaines?|mois|jours?|ans?)$/i.test(trimmedMessage)) {
    nextDraft.totalDuration = parseLearningDuration(trimmedMessage);
  }

  if (parsedSessionsPerWeek) {
    nextDraft.sessionsPerWeek = parsedSessionsPerWeek;
  } else if (!nextDraft.sessionsPerWeek && /^\d+$/.test(trimmedMessage)) {
    nextDraft.sessionsPerWeek = Number(trimmedMessage);
  }

  if (parsedMinutesPerSession) {
    nextDraft.minutesPerSession = parsedMinutesPerSession;
  } else if (!nextDraft.minutesPerSession && /^\d+\s*(?:min|minutes?)?$/i.test(trimmedMessage)) {
    nextDraft.minutesPerSession = Number(trimmedMessage.replace(/\D/g, ""));
  }

  if (parsedPreferredDays.length) {
    nextDraft.preferredDays = parsedPreferredDays;
  }

  if (parsedPreferredTime) {
    nextDraft.preferredTime = parsedPreferredTime;
  }

  return nextDraft;
}

function getLearningDraftMissingFields(draft) {
  const missingFields = [];

  if (!draft.totalDuration) {
    missingFields.push("duration");
  }

  if (!draft.sessionsPerWeek) {
    missingFields.push("sessionsPerWeek");
  }

  if (!draft.minutesPerSession) {
    missingFields.push("minutesPerSession");
  }

  if (!Array.isArray(draft.preferredDays) || draft.preferredDays.length === 0) {
    missingFields.push("preferredDays");
  }

  return missingFields;
}

function getWeekdayLabel(day, language = "fr") {
  const labels = language === "en"
    ? { 0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday" }
    : { 0: "dimanche", 1: "lundi", 2: "mardi", 3: "mercredi", 4: "jeudi", 5: "vendredi", 6: "samedi" };

  return labels[day] || "";
}

function formatPreferredDays(days = [], language = "fr") {
  return days.map(day => getWeekdayLabel(day, language)).filter(Boolean).join(language === "en" ? ", " : ", ");
}

function buildLearningPlanPrompt(draft, language = "fr") {
  const topicTitle = draft.topicTitle || formatLearningTopicTitle(draft.topic);
  const missingFields = getLearningDraftMissingFields(draft);

  if (missingFields.length === 4) {
    return language === "en"
      ? `Okay for ${topicTitle}. Tell me the total duration, how many sessions per week, how long each session should last, and which days you prefer.`
      : `D'accord pour ${topicTitle}. Dis-moi pendant combien de temps tu veux travailler ce sujet, combien de séances par semaine, combien de temps par séance, et quels jours tu préfères.`;
  }

  const parts = missingFields.map((field) => {
    if (field === "duration") return language === "en" ? "the total duration" : "la durée totale";
    if (field === "sessionsPerWeek") return language === "en" ? "the number of sessions per week" : "le nombre de séances par semaine";
    if (field === "minutesPerSession") return language === "en" ? "the duration of each session" : "la durée de chaque séance";
    return language === "en" ? "your preferred days" : "tes jours préférés";
  });

  return language === "en"
    ? `I still need ${parts.join(", ")} for ${topicTitle}.`
    : `Il me manque encore ${parts.join(", ")} pour ${topicTitle}.`;
}

function getPlanningStartDate(planning) {
  const parsedDate = parseDateKey(typeof planning?.currentDate === "string" ? planning.currentDate.slice(0, 10) : "");
  if (parsedDate) return parsedDate;
  return new Date();
}

function buildWeeklyLearningDays(preferredDays, sessionsPerWeek) {
  const uniquePreferredDays = [...new Set(preferredDays)];
  const fallbackDays = [1, 2, 3, 4, 5, 6, 0];
  const weeklyDays = uniquePreferredDays.slice(0, sessionsPerWeek);

  for (const day of fallbackDays) {
    if (weeklyDays.length >= sessionsPerWeek) break;
    if (!weeklyDays.includes(day)) {
      weeklyDays.push(day);
    }
  }

  return weeklyDays;
}

function createLearningPlanEvents({ planning, draft, language = "fr" }) {
  const startDate = getPlanningStartDate(planning);
  const weeklyDays = buildWeeklyLearningDays(draft.preferredDays, draft.sessionsPerWeek);
  const weeklyDaySet = new Set(weeklyDays);
  const totalSessions = Math.max(1, draft.totalDuration.totalWeeks * draft.sessionsPerWeek);
  const defaultTime = draft.preferredTime || "18:00";
  const topicTitle = draft.topicTitle || formatLearningTopicTitle(draft.topic);
  const actions = [];

  let cursor = new Date(startDate);
  cursor.setHours(12, 0, 0, 0);

  while (actions.length < totalSessions) {
    if (weeklyDaySet.has(cursor.getDay())) {
      const event = {
        id: getNextPlanningEventId(planning),
        date: formatDateKeyFromDate(cursor),
        time: defaultTime,
        title: `${topicTitle} séance ${actions.length + 1}`,
        description: language === "en"
          ? `${draft.minutesPerSession} min learning session`
          : `Séance de ${draft.minutesPerSession} min`,
        meta: "Ajouté par Milo"
      };

      planning.events.push(event);
      planning.selectedEventId = event.id;
      actions.push({
        type: "add_planning_event",
        event,
        openPlanning: actions.length === 0
      });
    }

    cursor = addDays(cursor, 1);
  }

  return {
    actions,
    totalSessions,
    defaultTime,
    weeklyDays,
    topicTitle
  };
}

function buildLearningPlanCreatedReply({ draft, totalSessions, defaultTime, weeklyDays, topicTitle, language = "fr" }) {
  const daysLabel = formatPreferredDays(weeklyDays, language);

  if (language === "en") {
    return `I added ${totalSessions} reminders for ${topicTitle}: ${draft.sessionsPerWeek} sessions per week, ${draft.minutesPerSession} min each, on ${daysLabel}, at ${defaultTime}.`;
  }

  return `J'ai ajouté ${totalSessions} rappels pour ${topicTitle} : ${draft.sessionsPerWeek} séances par semaine, ${draft.minutesPerSession} min par séance, les ${daysLabel}, à ${defaultTime}.`;
}

function maybeHandleMiloAcronymQuery({ message, language, sessionId }) {
  const normalizedMessage = normalizeText(typeof message === "string" ? message : "");
  if (!normalizedMessage) {
    return null;
  }

  const mentionsMilo = normalizedMessage.includes("milo");
  const asksMeaning = [
    "stand for",
    "stands for",
    "acronyme",
    "acronym",
    "signifie",
    "veut dire",
    "meaning",
    "meaning of",
    "quoi signifie",
    "what is milo"
  ].some(fragment => normalizedMessage.includes(fragment));

  if (!mentionsMilo || !asksMeaning) {
    return null;
  }

  if (language === "en") {
    return {
      reply: "Milo stands for Machine Intelligence for Live Optimization.",
      actions: [],
      memory: getMemorySnapshot(sessionId)
    };
  }

  if (language === "es") {
    return {
      reply: "Milo significa Machine Intelligence for Live Optimization.",
      actions: [],
      memory: getMemorySnapshot(sessionId)
    };
  }

  return {
    reply: "Milo signifie Machine Intelligence for Live Optimization.",
    actions: [],
    memory: getMemorySnapshot(sessionId)
  };
}

function extractDirectWebResearchQuery(message = "") {
  const normalizedMessage = typeof message === "string" ? message.trim() : "";
  if (!normalizedMessage) return "";

  return normalizedMessage
    .replace(/^(?:fais|fait|lance|effectue|peux-tu faire|peux tu faire|tu peux faire)\s+(?:une\s+)?(?:vraie\s+)?recherche\s+web\s+sur\s+/i, "")
    .replace(/^(?:cherche|recherche)\s+(?:sur le web\s+|sur internet\s+)?/i, "")
    .replace(/\s+(?:et\s+)?(?:resume-les|résume-les|resume-moi|résume-moi|resume|résume|fais un resume|fais une synthese|fais une synthèse)\b[\s\S]*$/i, "")
    .replace(/\s+(?:en citant les sources|avec sources|avec les sources|cite les sources)\b[\s\S]*$/i, "")
    .replace(/^[\s:,-]+|[\s:,-]+$/g, "")
    .trim();
}

function isExplicitWebResearchRequest(message = "") {
  const normalizedMessage = normalizeText(typeof message === "string" ? message : "");
  if (!normalizedMessage) return false;

  const explicitResearchKeywords = [
    "recherche web",
    "sur le web",
    "sur internet",
    "web research",
    "search the web",
    "search web",
    "cite les sources",
    "with sources",
    "source web"
  ];

  return explicitResearchKeywords.some(keyword => normalizedMessage.includes(keyword));
}

function buildDirectWebResearchReply({ query, language = "fr", research }) {
  const topResults = Array.isArray(research?.results) ? research.results.filter(result => result.fetchOk || result.snippet).slice(0, 3) : [];
  if (!topResults.length) {
    return language === "en"
      ? `I couldn't find enough reliable web results for: ${query}.`
      : language === "es"
        ? `No encontre suficientes resultos web fiables para: ${query}.`
        : `Je n'ai pas trouvé assez de résultats web fiables pour : ${query}.`;
  }

  const summaryLines = topResults.map((result, index) => {
    const detail = result.excerpt || result.snippet || result.pageTitle || result.title;
    return `${index + 1}. ${result.title} (${result.source || getHostnameLabel(result.url)}) : ${detail}`;
  });

  if (language === "en") {
    return [
      `Here is a web-based summary for: ${query}.`,
      ...summaryLines,
      `Sources: ${topResults.map(result => result.url).join(" | ")}`
    ].join(" ");
  }

  if (language === "es") {
    return [
      `Aqui tienes una synthese web para: ${query}.`,
      ...summaryLines,
      `Fuentes: ${topResults.map(result => result.url).join(" | ")}`
    ].join(" ");
  }

  return [
    `Voici une synthèse web pour : ${query}.`,
    ...summaryLines,
    `Sources : ${topResults.map(result => result.url).join(" | ")}`
  ].join(" ");
}

function isNewsResearchQuery(query = "") {
  const normalizedQuery = normalizeText(typeof query === "string" ? query : "");
  return ["actualite", "actualites", "news", "dernieres infos", "derniere info", "latest news"].some(keyword => normalizedQuery.includes(keyword));
}

function buildDirectNewsResearchReply({ query, language = "fr", articles = [] }) {
  const topArticles = articles.slice(0, 3);
  if (!topArticles.length) {
    return language === "en"
      ? `I couldn't find recent news for: ${query}.`
      : language === "es"
        ? `No encontre noticias recientes para: ${query}.`
        : `Je n'ai pas trouvé d'actualités récentes pour : ${query}.`;
  }

  const lines = topArticles.map((article, index) => `${index + 1}. ${article.title} : ${article.description || article.pubDate || article.link}`);
  const sourceLinks = topArticles.map(article => article.link).join(" | ");

  if (language === "en") {
    return [`Here is a web news summary for: ${query}.`, ...lines, `Sources: ${sourceLinks}`].join(" ");
  }

  if (language === "es") {
    return [`Aqui tienes un resumen web de noticias para: ${query}.`, ...lines, `Fuentes: ${sourceLinks}`].join(" ");
  }

  return [`Voici une synthèse d'actualités web pour : ${query}.`, ...lines, `Sources : ${sourceLinks}`].join(" ");
}

async function maybeHandleDirectWebResearch({ message, language, sessionId }) {
  if (!isExplicitWebResearchRequest(message)) {
    return null;
  }

  const query = extractDirectWebResearchQuery(message) || String(message || "").trim();
  if (!query) {
    return null;
  }

  if (isNewsResearchQuery(query)) {
    try {
      const articles = await fetchNewsArticlesForQuery(query, language);
      return {
        reply: buildDirectNewsResearchReply({ query, language, articles }),
        actions: [],
        memory: getMemorySnapshot(sessionId),
        sources: articles.map(article => ({ title: article.title, url: article.link })),
        fallback: "direct-news-research"
      };
    } catch (error) {
      return {
        reply: language === "en"
          ? `The news research failed temporarily for: ${query}.`
          : language === "es"
            ? `La busqueda de noticias fallo temporalmente para: ${query}.`
            : `La recherche d'actualités a échoué temporairement pour : ${query}.`,
        actions: [],
        memory: getMemorySnapshot(sessionId),
        error: typeof error?.message === "string" ? error.message : "News research failed",
        fallback: "direct-news-research-error"
      };
    }
  }

  let research;
  try {
    research = await researchWeb(query);
  } catch (error) {
    return {
      reply: language === "en"
        ? `The web research failed temporarily for: ${query}.`
        : language === "es"
          ? `La busqueda web fallo temporalmente para: ${query}.`
          : `La recherche web a échoué temporairement pour : ${query}.`,
      actions: [],
      memory: getMemorySnapshot(sessionId),
      error: typeof error?.message === "string" ? error.message : "Web research failed",
      fallback: "direct-web-research-error"
    };
  }

  if (!research?.ok) {
    return {
      reply: language === "en"
        ? `I couldn't complete the web research for: ${query}.`
        : language === "es"
          ? `No pude completar la busqueda web para: ${query}.`
          : `Je n'ai pas pu terminer la recherche web pour : ${query}.`,
      actions: [],
      memory: getMemorySnapshot(sessionId),
      sources: research?.sources || []
    };
  }

  return {
    reply: buildDirectWebResearchReply({ query, language, research }),
    actions: [],
    memory: getMemorySnapshot(sessionId),
    sources: research.sources || [],
    fallback: "direct-web-research"
  };
}

function maybeHandleLearningPlanFlow({ message, language, planning, sessionId }) {
  const normalizedMessage = normalizeText(typeof message === "string" ? message : "");
  const existingDraft = getLearningPlanDraft(sessionId);

  if (existingDraft && /\b(?:annule|annuler|stop|cancel)\b/i.test(normalizedMessage)) {
    const topicTitle = existingDraft.topicTitle || formatLearningTopicTitle(existingDraft.topic);
    clearLearningPlanDraft(sessionId);
    return {
      reply: language === "en"
        ? `Okay, I cancelled the plan for ${topicTitle}.`
        : `D'accord, j'ai annulé la planification pour ${topicTitle}.`,
      actions: [],
      memory: getMemorySnapshot(sessionId)
    };
  }

  if (!existingDraft) {
    const learningIntent = detectLearningGoalIntent(message);
    if (!learningIntent?.topic) {
      return null;
    }

    const initialDraft = mergeLearningPlanDraft({
      topic: learningIntent.topic,
      topicTitle: formatLearningTopicTitle(learningIntent.rawTopic),
      totalDuration: null,
      sessionsPerWeek: null,
      minutesPerSession: null,
      preferredDays: [],
      preferredTime: null
    }, message);

    const missingFields = getLearningDraftMissingFields(initialDraft);
    if (missingFields.length > 0) {
      saveLearningPlanDraft(sessionId, initialDraft);
      return {
        reply: buildLearningPlanPrompt(initialDraft, language),
        actions: [],
        memory: getMemorySnapshot(sessionId)
      };
    }

    const planResult = createLearningPlanEvents({ planning, draft: initialDraft, language });
    clearLearningPlanDraft(sessionId);
    return {
      reply: buildLearningPlanCreatedReply({
        draft: initialDraft,
        totalSessions: planResult.totalSessions,
        defaultTime: planResult.defaultTime,
        weeklyDays: planResult.weeklyDays,
        topicTitle: planResult.topicTitle,
        language
      }),
      actions: planResult.actions,
      memory: getMemorySnapshot(sessionId)
    };
  }

  const updatedDraft = mergeLearningPlanDraft(existingDraft, message);

  if (updatedDraft.sessionsPerWeek && updatedDraft.sessionsPerWeek > 7) {
    saveLearningPlanDraft(sessionId, {
      ...updatedDraft,
      sessionsPerWeek: null
    });

    return {
      reply: language === "en"
        ? "I need a number of sessions per week between 1 and 7."
        : "J'ai besoin d'un nombre de séances par semaine compris entre 1 et 7.",
      actions: [],
      memory: getMemorySnapshot(sessionId)
    };
  }

  if (updatedDraft.minutesPerSession && updatedDraft.minutesPerSession > 480) {
    saveLearningPlanDraft(sessionId, {
      ...updatedDraft,
      minutesPerSession: null
    });

    return {
      reply: language === "en"
        ? "Tell me a session duration shorter than 8 hours."
        : "Indique-moi une durée de séance inférieure à 8 heures.",
      actions: [],
      memory: getMemorySnapshot(sessionId)
    };
  }

  const missingFields = getLearningDraftMissingFields(updatedDraft);
  if (missingFields.length > 0) {
    saveLearningPlanDraft(sessionId, updatedDraft);
    return {
      reply: buildLearningPlanPrompt(updatedDraft, language),
      actions: [],
      memory: getMemorySnapshot(sessionId)
    };
  }

  const planResult = createLearningPlanEvents({ planning, draft: updatedDraft, language });
  clearLearningPlanDraft(sessionId);

  return {
    reply: buildLearningPlanCreatedReply({
      draft: updatedDraft,
      totalSessions: planResult.totalSessions,
      defaultTime: planResult.defaultTime,
      weeklyDays: planResult.weeklyDays,
      topicTitle: planResult.topicTitle,
      language
    }),
    actions: planResult.actions,
    memory: getMemorySnapshot(sessionId)
  };
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

function isTransientNetworkError(error) {
  const rawMessage = typeof error?.message === "string"
    ? error.message.toLowerCase()
    : typeof error?.error === "string"
      ? error.error.toLowerCase()
      : "";
  const causeMessage = typeof error?.cause?.message === "string"
    ? error.cause.message.toLowerCase()
    : "";
  const errorCode = typeof error?.code === "string" ? error.code.toLowerCase() : "";
  const causeCode = typeof error?.cause?.code === "string" ? error.cause.code.toLowerCase() : "";

  return rawMessage.includes("fetch failed")
    || rawMessage.includes("socket hang up")
    || rawMessage.includes("econnreset")
    || rawMessage.includes("etimedout")
    || rawMessage.includes("timeout")
    || rawMessage.includes("network")
    || causeMessage.includes("econnreset")
    || causeMessage.includes("etimedout")
    || causeMessage.includes("timeout")
    || ["econnreset", "etimedout", "eai_again", "enotfound", "econnrefused"].includes(errorCode)
    || ["econnreset", "etimedout", "eai_again", "enotfound", "econnrefused"].includes(causeCode);
}

function isRetryableOpenAIError(error) {
  return isRateLimitError(error) || isTransientNetworkError(error);
}

function getModelCandidates(model) {
  const normalizedModel = typeof model === "string" ? model.trim() : "";
  const configuredFallbacks = getAIFallbackModels();
  const defaultFallbacks = normalizedModel === "gpt-4.1-nano"
    ? ["gpt-4.1-mini"]
    : ["gpt-4.1-mini", "gpt-4.1-nano"];

  return [...new Set([normalizedModel, ...configuredFallbacks, ...defaultFallbacks].filter(Boolean))];
}

function getOpenAIRetryDelayMs(attempt, modelIndex = 0) {
  const exponentialDelay = 1200 * (2 ** Math.max(0, attempt - 1));
  return Math.min(10000, exponentialDelay + (modelIndex * 500));
}

async function createChatCompletionWithRetry(client, payload, maxAttempts = 5) {
  let lastError = null;
  const candidateModels = getModelCandidates(payload.model);

  for (const [modelIndex, candidateModel] of candidateModels.entries()) {
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        return await client.chat.completions.create({
          ...payload,
          model: candidateModel
        });
      } catch (error) {
        lastError = error;
        if (!isRetryableOpenAIError(error)) {
          throw error;
        }

        if (attempt < maxAttempts) {
          await delay(getOpenAIRetryDelayMs(attempt, modelIndex));
          continue;
        }
      }
    }
  }

  throw lastError;
}

function parseSearchResultsHtml(html = "") {
  const resultBlocks = [...html.matchAll(/<div[^>]*class="[^"]*result[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi)]
    .map((match) => match[1] || "")
    .filter(Boolean);

  return resultBlocks.map((block) => {
    const linkMatch = block.match(/<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    const snippetMatch = block.match(/<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/i)
      || block.match(/<div[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/div>/i);

    const rawHref = linkMatch?.[1] || "";
    const title = stripHtml(linkMatch?.[2] || "").trim();
    const snippet = stripHtml(snippetMatch?.[1] || "").trim().slice(0, 240);
    let url = rawHref;

    if (rawHref.includes("uddg=")) {
      const uddg = rawHref.match(/[?&]uddg=([^&]+)/)?.[1];
      if (uddg) {
        url = decodeURIComponent(uddg);
      }
    }

    return { title, url, snippet };
  }).filter(result => result.title && result.url).slice(0, 6);

}

async function searchWeb(query) {
  const normalizedQuery = typeof query === "string" ? query.trim() : "";
  if (!normalizedQuery) {
    return { ok: false, results: [] };
  }

  const searchUrls = [
    `https://duckduckgo.com/html/?q=${encodeURIComponent(normalizedQuery)}`,
    `https://html.duckduckgo.com/html/?q=${encodeURIComponent(normalizedQuery)}`
  ];

  let lastError = null;

  for (const searchUrl of searchUrls) {
    try {
      const html = await fetchTextWithTimeout(searchUrl, {
        headers: {
          "User-Agent": "Milo/1.0",
          "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8"
        },
        timeoutMs: 10000
      });
      const results = parseSearchResultsHtml(html);

      if (results.length) {
        return { ok: true, provider: "duckduckgo", results };
      }
    } catch (error) {
      lastError = error;
    }
  }

  return {
    ok: false,
    provider: "duckduckgo",
    results: [],
    error: typeof lastError?.message === "string" ? lastError.message : "Search failed"
  };
}

function getHostnameLabel(url = "") {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

async function researchWeb(query) {
  const normalizedQuery = typeof query === "string" ? query.trim() : "";
  if (!normalizedQuery) {
    return { ok: false, results: [], sources: [], error: "Empty query" };
  }

  const searchResponse = await searchWeb(normalizedQuery);
  if (!searchResponse.ok || !Array.isArray(searchResponse.results) || !searchResponse.results.length) {
    return {
      ok: false,
      query: normalizedQuery,
      results: searchResponse?.results || [],
      sources: [],
      error: searchResponse?.error || "No search results"
    };
  }

  const enrichedResults = [];

  for (const result of searchResponse.results.slice(0, 3)) {
    const page = await fetchWebpage(result.url);
    enrichedResults.push({
      title: result.title,
      url: result.url,
      snippet: result.snippet,
      source: getHostnameLabel(result.url),
      pageTitle: page?.ok ? page.title : "",
      excerpt: page?.ok ? String(page.excerpt || "").slice(0, 900) : "",
      tableRows: page?.ok ? (Array.isArray(page.tableRows) ? page.tableRows.slice(0, 8) : []) : [],
      fetchOk: Boolean(page?.ok),
      fetchError: page?.ok ? "" : (page?.error || "")
    });
  }

  return {
    ok: true,
    query: normalizedQuery,
    results: enrichedResults,
    sources: enrichedResults.map((result) => ({
      title: result.title,
      url: result.url,
      source: result.source
    }))
  };
}

function getAgentTools(agentType = "general") {
  if (agentType === "education") {
    return [];
  }

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
        name: "delete_planning_event",
        description: "Supprime un événement existant du planning de l'utilisateur.",
        parameters: {
          type: "object",
          properties: {
            eventId: { type: "number", description: "Identifiant de l'événement à supprimer si connu" },
            currentTitle: { type: "string", description: "Titre actuel de l'événement à retrouver" },
            currentDate: { type: "string", description: "Date actuelle au format YYYY-MM-DD pour aider à cibler l'événement" },
            currentTime: { type: "string", description: "Heure actuelle au format HH:mm pour aider à cibler l'événement" }
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
        name: "research_web",
        description: "Effectue une vraie recherche web multi-sources: recherche, ouvre plusieurs pages et renvoie des extraits lisibles.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "Question ou sujet à rechercher sur le web" }
          },
          required: ["query"],
          additionalProperties: false
        }
      }
    },
    {
      type: "function",
      function: {
        name: "web_search",
        description: "Recherche des informations sur le web et retourne les premiers résultats avec snippets.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "Requête à rechercher sur le web" }
          },
          required: ["query"],
          additionalProperties: false
        }
      }
    },
    {
      type: "function",
      function: {
        name: "fetch_webpage",
        description: "Télécharge et extrait le contenu principal lisible d'une page web ou d'un classement public.",
        parameters: {
          type: "object",
          properties: {
            url: { type: "string", description: "URL complète en http ou https" }
          },
          required: ["url"],
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
        meta: ""
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
    case "delete_planning_event": {
      const eventId = typeof args.eventId === "number" ? args.eventId : null;
      const currentTitle = typeof args.currentTitle === "string" ? args.currentTitle.trim() : "";
      const currentDate = typeof args.currentDate === "string" ? args.currentDate.trim() : "";
      const currentTime = typeof args.currentTime === "string" ? args.currentTime.trim() : "";

      const existingEvent = findPlanningEvent(runtime.planning, {
        eventId,
        title: currentTitle,
        date: currentDate,
        time: currentTime
      });

      if (!existingEvent) {
        return { ok: false, error: "Planning event not found" };
      }

      runtime.planning.events = runtime.planning.events.filter(event => event.id !== existingEvent.id);
      if (runtime.planning.selectedEventId === existingEvent.id) {
        runtime.planning.selectedEventId = null;
      }

      runtime.actions.push({
        type: "delete_planning_event",
        eventId: existingEvent.id,
        event: existingEvent,
        openPlanning: true
      });

      return { ok: true, event: existingEvent };
    }
    case "save_memory_note":
      return rememberNote(runtime.sessionId, args.note);
    case "get_memory_notes":
      return getMemorySnapshot(runtime.sessionId);
    case "research_web":
      return researchWeb(args.query);
    case "web_search":
      return searchWeb(args.query);
    case "fetch_webpage":
      return fetchWebpage(args.url);
    default:
      return { ok: false, error: `Unknown tool: ${toolName}` };
  }
}

async function runAgentCompletion({ client, model, message, history, language, profile, planning, studyContext, sessionId, agentType = "general" }) {
  const runtime = {
    sessionId,
    locale: language === "en" ? "en-US" : "fr-FR",
    profile,
    planning,
    actions: []
  };
  const tools = getAgentTools(agentType);
  const contextMessage = agentType === "education"
    ? buildEducationContextMessage({ language, profile, studyContext, sessionId })
    : buildContextMessage({ language, profile, planning, sessionId });
  const messages = [
    { role: "system", content: getAssistantSystemPrompt(agentType) },
    { role: "system", content: `Contexte applicatif JSON: ${contextMessage}` },
    ...sanitizeHistory(history),
    { role: "user", content: message }
  ];

  let finalReply = null;

  for (let step = 0; step < 6; step += 1) {
    const requestPayload = {
      model,
      messages,
      temperature: agentType === "education" ? 0.6 : 0.4
    };

    if (tools.length) {
      requestPayload.tools = tools;
      requestPayload.tool_choice = "auto";
    }

    const response = await createChatCompletionWithRetry(client, requestPayload);

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
  const normalizedMessage = rawMessage.toLowerCase();
  const statusLabel = error?.status ? `HTTP ${error.status}` : "Erreur API";
  const codeLabel = typeof error?.code === "string" ? error.code : "";
  const sanitizedMessage = rawMessage
    .replace(/sk-[A-Za-z0-9_-]+/g, "[redacted-key]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]")
    .trim();

  function withDetails(message) {
    const details = [statusLabel, codeLabel].filter(Boolean).join(" · ");
    if (!sanitizedMessage) {
      return details ? `${message} (${details})` : message;
    }

    return `${message} (${details}${details ? " · " : ""}${sanitizedMessage})`;
  }

  if (!getAIKey()) {
    return `La clé ${providerLabel} n'est pas configurée. Ajoute ${keyEnvName} dans le fichier .env pour activer Milo.`;
  }

  if (rawMessage.includes("Incorrect API key provided")) {
    return withDetails(`La clé ${providerLabel} est invalide. Remplace ${keyEnvName} par une vraie clé API générée depuis la console OpenAI.`);
  }

  if (normalizedMessage.includes("api key not valid") || normalizedMessage.includes("invalid api key") || normalizedMessage.includes("api_key_invalid")) {
    return withDetails(`La clé ${providerLabel} est invalide. Vérifie ${keyEnvName} dans le fichier .env.`);
  }

  if (normalizedMessage.includes("billing") || normalizedMessage.includes("payment") || normalizedMessage.includes("organization must be verified") || normalizedMessage.includes("billing_hard_limit_reached")) {
    return withDetails(`Le compte ${providerLabel} est bien connecté, mais la facturation ou la vérification du compte bloque encore l'accès API. Vérifie ton compte OpenAI puis réessaie.`);
  }

  if (normalizedMessage.includes("does not exist") || normalizedMessage.includes("model_not_found")) {
    return withDetails(`Le modèle configuré dans le fichier .env est introuvable ou indisponible pour ce compte.`);
  }

  if (normalizedMessage.includes("permission") || normalizedMessage.includes("not authorized") || normalizedMessage.includes("unsupported") || error?.status === 403) {
    return withDetails(`Le compte ${providerLabel} n'est pas autorisé à utiliser ce modèle ou cette API. Vérifie les droits du projet et le modèle configuré dans le fichier .env.`);
  }

  if (normalizedMessage.includes("quota") || normalizedMessage.includes("rate limit")) {
    return withDetails(`Le quota ${providerLabel} est atteint ou limité pour le moment. Réessaie plus tard ou augmente les quotas du projet.`);
  }

  if (error?.code === "insufficient_quota" || (error?.status === 429 && error?.type === "insufficient_quota")) {
    return withDetails(`Milo est temporairement indisponible car le quota ${providerLabel} du projet est atteint. Vérifie la facturation ou utilise une autre clé API.`);
  }

  if (error?.status === 429) {
    return withDetails("Milo reçoit trop de requêtes en ce moment. Réessaie dans quelques instants.");
  }

  if (error?.status === 401 || error?.code === "invalid_api_key") {
    return withDetails(`La clé ${providerLabel} semble invalide. Vérifie ${keyEnvName} dans le fichier .env.`);
  }

  if (isTransientNetworkError(error)) {
    return withDetails(`La connexion entre Milo et ${providerLabel} a été interrompue temporairement. Réessaie dans quelques secondes.`);
  }

  return withDetails("Milo ne peut pas répondre pour le moment. Réessaie dans un instant.");
}

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [], language = "fr", profile = {}, planning = {}, studyContext = {}, sessionId, agent = "general" } = req.body;
    const client = createAIClient();
    const model = getAIModel();
    const safeProfile = sanitizeProfile(profile);
    const safePlanning = sanitizePlanning(planning);
    const safeStudyContext = sanitizeStudyContext(studyContext);
    const safeSessionId = getSessionId(sessionId);
    const safeAgentType = agent === "education" ? "education" : "general";

    if (safeAgentType === "general") {
      const miloAcronymResponse = maybeHandleMiloAcronymQuery({
        message,
        language,
        sessionId: safeSessionId
      });

      if (miloAcronymResponse) {
        res.json(miloAcronymResponse);
        return;
      }

      const directWebResearchResponse = await maybeHandleDirectWebResearch({
        message,
        language,
        sessionId: safeSessionId
      });

      if (directWebResearchResponse) {
        res.json(directWebResearchResponse);
        return;
      }

      const learningPlanResponse = maybeHandleLearningPlanFlow({
        message,
        language,
        planning: safePlanning,
        sessionId: safeSessionId
      });

      if (learningPlanResponse) {
        res.json(learningPlanResponse);
        return;
      }

      const directWebResponse = await maybeBuildDirectWebFallback({ message, language });
      if (directWebResponse) {
        res.json({
          reply: directWebResponse.reply,
          actions: [],
          memory: getMemorySnapshot(safeSessionId),
          provider: getAIProviderLabel(),
          model,
          fallback: directWebResponse.mode,
          source: directWebResponse.source
        });
        return;
      }
    }

    let response;
    try {
      response = await runAgentCompletion({
        client,
        model,
        message,
        history,
        language,
        profile: safeProfile,
        planning: safePlanning,
        studyContext: safeStudyContext,
        sessionId: safeSessionId,
        agentType: safeAgentType
      });
    } catch (error) {
      if (safeAgentType === "general" && isTransientNetworkError(error)) {
        const fallbackResponse = await maybeBuildDirectWebFallback({ message, language });
        if (fallbackResponse) {
          res.json({
            reply: fallbackResponse.reply,
            actions: [],
            memory: getMemorySnapshot(safeSessionId),
            provider: getAIProviderLabel(),
            model,
            fallback: fallbackResponse.mode,
            source: fallbackResponse.source
          });
          return;
        }
      }

      throw error;
    }

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

app.get("/api/daily-news", async (req, res) => {
  try {
    const theme = sanitizeDailyNewsTheme(typeof req.query?.theme === "string" ? req.query.theme.trim() : "none");
    const language = sanitizeDailyNewsLanguage(typeof req.query?.language === "string" ? req.query.language.trim() : "fr");

    if (theme === "none") {
      res.json({ ok: true, entry: null, cached: false, source: "none" });
      return;
    }

    const cacheKey = getDailyNewsCacheKey(theme, language);
    const cachedEntry = dailyNewsCache.get(cacheKey);
    if (cachedEntry) {
      res.json({ ok: true, entry: cachedEntry.entry, cached: true, source: cachedEntry.source });
      return;
    }

    const articles = await fetchDailyNewsCandidates(theme, language);
    if (!articles.length) {
      res.status(502).json({ ok: false, error: "No news candidates found" });
      return;
    }

    let entry = null;
    let source = "web-fallback";

    if (getAIKey()) {
      try {
        const client = createAIClient();
        const model = getAIModel();
        entry = await generateDailyNewsSummary({ client, model, theme, language, articles });
        if (entry) {
          source = "web";
        }
      } catch (error) {
        console.error("Daily news summary error:", error);
      }
    }

    if (!entry) {
      entry = buildDailyNewsFallbackEntry(theme, language, articles);
    }

    if (!entry) {
      res.status(502).json({ ok: false, error: "Unable to build daily news entry" });
      return;
    }

    dailyNewsCache.set(cacheKey, {
      entry,
      source,
      createdAt: Date.now()
    });

    res.json({ ok: true, entry, cached: false, source });
  } catch (error) {
    console.error("Daily news fetch error:", error);
    res.status(500).json({ ok: false, error: "Daily news unavailable" });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serveur Milo lancé sur http://localhost:${port}`);
});