import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";
import express from "express";

dotenv.config({ path: ".env.local" });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.argv.includes("--prod");
const host = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || 4173);
const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiModel = process.env.GEMINI_MODEL || "gemini-3.1-pro-preview";
const supportedAirportCodes = [
  "BOG",
  "MDE",
  "CLO",
  "CTG",
  "BAQ",
  "BGA",
  "PEI",
  "SMR",
  "CUC",
  "VVC",
  "MIA",
  "MAD",
  "CDG",
  "LHR",
  "AMS",
  "PEK",
  "NRT",
  "ICN",
  "DXB",
  "SJO",
];

const chatResponseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    reply: {
      type: "string",
      description: "Respuesta visible para el usuario, en espanol, breve y accionable.",
    },
    intent: {
      type: "string",
      enum: ["flight_search", "follow_up", "general"],
      description: "Tipo de accion principal que debe seguir la interfaz.",
    },
    showFlightOptions: {
      type: "boolean",
      description: "True cuando la interfaz debe mostrar tarjetas o lista de vuelos simulados.",
    },
    searchMode: {
      type: "string",
      enum: ["none", "reference", "exact"],
      description:
        "reference cuando hay que mostrar opciones de referencia por falta de datos; exact cuando hay suficientes datos para una simulacion mas precisa.",
    },
    missingFields: {
      type: "array",
      description: "Campos que aun faltan para afinar la cotizacion.",
      items: {
        type: "string",
        enum: [
          "origin",
          "destination",
          "departureDate",
          "returnDate",
          "programDuration",
          "studentAge",
          "passengers",
          "hasUsVisa",
        ],
      },
    },
    search: {
      type: "object",
      additionalProperties: false,
      properties: {
        origin: {
          type: ["string", "null"],
          description: "Codigo IATA de origen si es reconocible. Usa solo codigos soportados.",
        },
        destination: {
          type: ["string", "null"],
          description:
            "Codigo IATA del destino solicitado si es reconocible. Puede ser soportado o un codigo solicitado por el usuario.",
        },
        destinationLabel: {
          type: ["string", "null"],
          description: "Nombre visible del destino solicitado por el usuario, por ejemplo Estambul o Corea del Sur.",
        },
        destinationCountry: {
          type: ["string", "null"],
          description: "Pais visible del destino solicitado si es claro por contexto.",
        },
        simulationDestination: {
          type: ["string", "null"],
          description:
            "Codigo IATA soportado que servira como base interna para generar opciones demo cuando el destino real no este soportado.",
        },
        simulationOrigin: {
          type: ["string", "null"],
          description:
            "Codigo IATA soportado que servira como base interna para generar opciones demo cuando el origen real no este soportado.",
        },
        departureDate: {
          type: ["string", "null"],
          format: "date",
          description: "Fecha exacta de salida en formato YYYY-MM-DD si el usuario la dio.",
        },
        returnDate: {
          type: ["string", "null"],
          format: "date",
          description: "Fecha exacta de regreso en formato YYYY-MM-DD si aplica y el usuario la dio.",
        },
        tripType: {
          type: "string",
          enum: ["one-way", "round-trip"],
          description: "Tipo de viaje. Usa round-trip solo si el usuario indica regreso.",
        },
        cabinClass: {
          type: "string",
          enum: ["economy", "premium-economy", "business", "first"],
          description: "Cabina solicitada o economy por defecto.",
        },
        adults: {
          type: "integer",
          minimum: 0,
          description: "Cantidad de adultos. Usa 1 por defecto si no se especifica.",
        },
        children: {
          type: "integer",
          minimum: 0,
          description: "Cantidad de ninos. Usa 0 por defecto.",
        },
        infants: {
          type: "integer",
          minimum: 0,
          description: "Cantidad de infantes. Usa 0 por defecto.",
        },
        hasUsVisa: {
          type: ["boolean", "null"],
          description:
            "True o false solo si el usuario lo confirma. Null si no se sabe si tiene visa americana.",
        },
      },
      required: [
        "origin",
        "destination",
        "destinationLabel",
        "destinationCountry",
        "simulationDestination",
        "simulationOrigin",
        "departureDate",
        "returnDate",
        "tripType",
        "cabinClass",
        "adults",
        "children",
        "infants",
        "hasUsVisa",
      ],
    },
  },
  required: ["reply", "intent", "showFlightOptions", "searchMode", "missingFields", "search"],
};

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", true);
app.use(express.json({ limit: "1mb" }));

const createGeminiContents = (history = [], message = "") => {
  const contents = history
    .filter((entry) => entry && typeof entry.content === "string" && entry.content.trim() !== "")
    .map((entry) => ({
      role: entry.role === "assistant" ? "model" : "user",
      parts: [{ text: entry.content }],
    }));

  if (message.trim()) {
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });
  }

  return contents;
};

const extractTextFromGeminiResponse = (payload) => {
  const candidate = payload?.candidates?.[0];
  const parts = candidate?.content?.parts ?? [];
  const text = parts
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .join("\n")
    .trim();

  return text;
};

const parseStructuredResponse = (rawText) => {
  if (typeof rawText !== "string" || rawText.trim() === "") {
    return null;
  }

  const sanitizedText = rawText
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");

  try {
    return JSON.parse(sanitizedText);
  } catch {
    return null;
  }
};

const buildSystemInstruction = (compact = false) => {
  const today = new Date().toISOString().slice(0, 10);

  if (compact) {
    return [
      "Eres un agente de viajes B2B para programas educativos.",
      "Responde en espanol claro y breve.",
      "Devuelve un JSON valido siguiendo exactamente el schema.",
      "Si reconoces un destino de vuelos, usa showFlightOptions=true.",
      "Usa searchMode='reference' si faltan origen o fechas pero aun sirve mostrar opciones.",
      "No inventes fechas exactas no dadas por el usuario.",
      "Si no conoces el origen, deja origin=null.",
      "Esto es una demo, asi que nunca respondas que no hay rutas o que el sistema no soporta un destino.",
      "Si el destino pedido no esta soportado internamente, igual debes devolver ejemplos simulados.",
      "En esos casos, conserva el destino pedido en destination o destinationLabel y elige simulationDestination con un hub soportado parecido para generar la demo.",
      "Mapeos: Corea del Sur, Seul, Seoul, Incheon => ICN; Japon, Tokio, Tokyo, Narita => NRT; China, Pekin, Beijing => PEK; Madrid => MAD; Paris => CDG; Londres => LHR; Amsterdam => AMS; Miami => MIA; Dubai => DXB; San Jose Costa Rica => SJO.",
      "Ejemplos de simulacion: Estambul o Turquia => simulationDestination DXB, MAD o CDG; Berlin o Alemania => LHR, AMS o CDG; Roma o Italia => MAD o CDG.",
      `Usa solo estos IATA: ${supportedAirportCodes.join(", ")}.`,
    ].join(" ");
  }

  return [
    "Eres un agente de viajes B2B especializado en programas educativos.",
    "Siempre respondes en espanol claro, breve y util.",
    `Hoy es ${today}. Si el usuario usa fechas relativas, aclara la fecha absoluta solo si es necesaria.`,
    "Debes devolver un JSON valido que siga exactamente el schema solicitado.",
    "Tu campo reply debe ser natural para el usuario y no debe mencionar JSON ni estructura interna.",
    "Si el usuario esta pidiendo vuelos, rutas, tarifas o destinos, usa intent='flight_search' o intent='follow_up'.",
    "Si ya hay un destino reconocible, activa showFlightOptions=true para que la interfaz muestre tarjetas o una lista debajo del chat.",
    "Usa searchMode='reference' cuando falten origen o fechas exactas pero aun asi sea util mostrar opciones de referencia.",
    "Usa searchMode='exact' cuando ya tengas al menos destino y una salida suficientemente concreta para una simulacion util.",
    "No inventes fechas exactas que el usuario no haya dado. Si falta una fecha exacta, dejala en null y agregala en missingFields.",
    "No inventes origen o destino si no son identificables. Si solo reconoces el destino, puedes dejar origin=null y mantener showFlightOptions=true con searchMode='reference'.",
    "Esto es una demo comercial, no un inventario real. Nunca respondas que no hay rutas, que no tenemos ese destino o que el sistema no lo soporta.",
    "Siempre que el usuario pida un destino, debes intentar mostrar ejemplos simulados de como se verian las opciones.",
    "Si el destino real no esta soportado internamente, guarda el nombre pedido en destinationLabel y usa simulationDestination con un hub soportado parecido para generar la demo.",
    "Si el usuario menciona un pais o ciudad que corresponde claramente a uno de los destinos soportados, mapealo al aeropuerto principal soportado.",
    "Mapeos importantes: Corea del Sur, Seul, Seoul e Incheon => ICN; Japon, Tokio, Tokyo, Narita => NRT; China, Pekin, Beijing => PEK; Espana, Madrid => MAD; Francia, Paris => CDG; Reino Unido, Londres => LHR; Paises Bajos, Amsterdam => AMS; Estados Unidos, Miami => MIA; Emiratos Arabes Unidos, Dubai => DXB; Costa Rica, San Jose => SJO.",
    "Ejemplos de fallback para demo: Estambul o Turquia => simulationDestination DXB, MAD o CDG; Berlin o Alemania => LHR, AMS o CDG; Roma o Italia => MAD o CDG.",
    `Solo puedes usar estos codigos IATA soportados: ${supportedAirportCodes.join(", ")}.`,
    "Si el usuario no especifica pasajeros, usa 1 adulto, 0 ninos y 0 infantes.",
    "Si el usuario no especifica cabina, usa economy.",
    "Si el usuario no especifica regreso, usa tripType='one-way'.",
    "hasUsVisa solo debe ser true o false si el usuario lo confirma; en otro caso usa null.",
    "Cuando falten datos importantes para cerrar una cotizacion, pidelos en reply de forma concreta.",
  ].join(" ");
};

const buildGenerationConfig = () => ({
  responseMimeType: "application/json",
  responseJsonSchema: chatResponseSchema,
  thinkingConfig: {
    thinkingLevel: "low",
  },
  temperature: 0.2,
  topP: 0.8,
  maxOutputTokens: 4096,
});

const requestGeminiChat = async ({ message, history = [], compactInstruction = false }) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": geminiApiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: buildSystemInstruction(compactInstruction),
            },
          ],
        },
        contents: createGeminiContents(history, message),
        generationConfig: buildGenerationConfig(),
      }),
    }
  );

  const payload = await response.json();
  const text = extractTextFromGeminiResponse(payload);
  const structuredResponse = parseStructuredResponse(text);
  const finishReason = payload?.candidates?.[0]?.finishReason ?? null;

  return {
    response,
    payload,
    text,
    structuredResponse,
    finishReason,
  };
};

app.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "student-travel-center",
    mode: isProduction ? "production" : "development",
    model: geminiModel,
  });
});

app.post("/api/chat", async (req, res) => {
  if (!geminiApiKey) {
    res.status(500).json({
      error: "Gemini API key missing",
      message: "Configura GEMINI_API_KEY en .env.local antes de usar el chat.",
    });
    return;
  }

  const { message, history = [] } = req.body ?? {};

  if (typeof message !== "string" || message.trim() === "") {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  try {
    let geminiRequest = await requestGeminiChat({ message, history });

    if (
      geminiRequest.response.ok &&
      (!geminiRequest.structuredResponse || geminiRequest.finishReason === "MAX_TOKENS")
    ) {
      geminiRequest = await requestGeminiChat({
        message,
        history: history.slice(-2),
        compactInstruction: true,
      });
    }

    if (!geminiRequest.response.ok) {
      res.status(geminiRequest.response.status).json({
        error: "Gemini request failed",
        details: geminiRequest.payload,
      });
      return;
    }

    const { text, structuredResponse } = geminiRequest;

    if (!text) {
      res.status(502).json({
        error: "Empty Gemini response",
        details: geminiRequest.payload,
      });
      return;
    }

    res.json({
      output:
        structuredResponse && typeof structuredResponse.reply === "string"
          ? structuredResponse.reply
          : text,
      model: geminiModel,
      chatAction: structuredResponse,
    });
  } catch (error) {
    res.status(500).json({
      error: "Unexpected server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

const start = async () => {
  if (isProduction) {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));

    app.use(async (_req, res) => {
      const html = await fs.readFile(path.join(distPath, "index.html"), "utf8");
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    });
  } else {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: {
        middlewareMode: true,
      },
      appType: "spa",
    });

    app.use(vite.middlewares);
  }

  app.listen(port, host, () => {
    const localUrl = `http://127.0.0.1:${port}`;
    console.log(`Server running on ${host}:${port}`);
    console.log(`Local access: ${localUrl}`);
    console.log(`Gemini model: ${geminiModel}`);
  });
};

start();
