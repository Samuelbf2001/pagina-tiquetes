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
const openaiApiKey = process.env.OPENAI_API_KEY;
const openaiModel = process.env.OPENAI_MODEL || "gpt-5.6-luna";
const openaiReasoningEffort = process.env.OPENAI_REASONING_EFFORT || "high";

const airportSchema = (extraDescription = "") => ({
  type: "object",
  additionalProperties: false,
  properties: {
    code: {
      type: "string",
      description: `Codigo IATA real de tres letras del aeropuerto. ${extraDescription}`.trim(),
    },
    name: {
      type: "string",
      description: "Nombre del aeropuerto, por ejemplo Aeropuerto Internacional El Dorado.",
    },
    city: {
      type: "string",
      description: "Ciudad del aeropuerto en espanol sin tildes.",
    },
    country: {
      type: "string",
      description: "Pais del aeropuerto en espanol sin tildes.",
    },
  },
  required: ["code", "name", "city", "country"],
});

const flightOptionSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    airline: {
      type: "string",
      description: "Nombre de la aerolinea, plausible para la ruta.",
    },
    airlineCode: {
      type: "string",
      description: "Codigo IATA de la aerolinea, dos caracteres, por ejemplo AV, IB, TK.",
    },
    flightNumber: {
      type: "string",
      description: "Numero de vuelo, por ejemplo AV245 o TK801.",
    },
    aircraft: {
      type: "string",
      description: "Equipo del vuelo, por ejemplo Boeing 787-9 o Airbus A350-900.",
    },
    origin: airportSchema("Debe corresponder al origen del pasajero."),
    destination: airportSchema("Debe corresponder al destino solicitado."),
    stops: {
      type: "array",
      description:
        "Escalas intermedias en orden. Vacio para vuelos directos. Maximo dos escalas por opcion.",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          code: { type: "string", description: "Codigo IATA real de tres letras de la escala." },
          name: { type: "string", description: "Nombre del aeropuerto de escala." },
          city: { type: "string", description: "Ciudad de la escala en espanol sin tildes." },
          country: { type: "string", description: "Pais de la escala en espanol sin tildes." },
          layoverDuration: {
            type: "string",
            description: "Duracion de la conexion con formato Xh Ym, por ejemplo 2h 15m.",
          },
        },
        required: ["code", "name", "city", "country", "layoverDuration"],
      },
    },
    durationTotal: {
      type: "string",
      description:
        "Duracion total puerta a puerta con formato Xh Ym, por ejemplo 14h 25m. Debe ser coherente con la distancia y las escalas.",
    },
    departureDate: {
      type: "string",
      description:
        "Fecha de salida en formato YYYY-MM-DD. Debe ser futura y coherente con lo que pidio el usuario.",
    },
    departureTime: {
      type: "string",
      description: "Hora local de salida en formato de 24 horas HH:MM, por ejemplo 23:45.",
    },
    arrivalDate: {
      type: "string",
      description:
        "Fecha de llegada en formato YYYY-MM-DD. Igual o posterior a departureDate segun la duracion.",
    },
    arrivalTime: {
      type: "string",
      description: "Hora local de llegada en formato de 24 horas HH:MM.",
    },
    currency: {
      type: "string",
      description: "Moneda de la tarifa con codigo ISO de tres letras, normalmente USD.",
    },
    publicPrice: {
      type: "number",
      description: "Tarifa publica por pasajero, sin impuestos, mayor que agencyPrice.",
    },
    agencyPrice: {
      type: "number",
      description: "Tarifa neta de agencia por pasajero, siempre menor que publicPrice.",
    },
    seatsAvailable: {
      type: "integer",
      description: "Asientos disponibles en la clase cotizada, entre 1 y 40.",
    },
    cabinClass: {
      type: "string",
      enum: ["economy", "premium-economy", "business", "first"],
      description: "Cabina de la opcion cotizada.",
    },
    baggageIncluded: {
      type: "boolean",
      description: "True si la tarifa incluye equipaje en bodega.",
    },
    refundable: {
      type: "boolean",
      description: "True si la tarifa es reembolsable.",
    },
    highlight: {
      type: "string",
      enum: ["cheapest", "fastest", "most_comfortable", "none"],
      description:
        "Etiqueta que resalta por que esta opcion es la mejor en su categoria dentro de la respuesta actual. Usa cheapest solo en la opcion de menor agencyPrice, fastest solo en la de menor durationTotal, most_comfortable solo en la de mejor balance de escalas cortas y cabina. Cada etiqueta debe usarse como maximo una vez por respuesta. El resto de opciones usa none.",
    },
    highlightReason: {
      type: "string",
      description:
        "Cuando highlight no es none, una frase corta y humana explicando por que esta opcion gana esa categoria, mencionando la logica de construccion de ruta si aplica, por ejemplo la conexion via un hub que baja el precio. Cadena vacia cuando highlight es none.",
    },
  },
  required: [
    "airline",
    "airlineCode",
    "flightNumber",
    "aircraft",
    "origin",
    "destination",
    "stops",
    "durationTotal",
    "departureDate",
    "departureTime",
    "arrivalDate",
    "arrivalTime",
    "currency",
    "publicPrice",
    "agencyPrice",
    "seatsAvailable",
    "cabinClass",
    "baggageIncluded",
    "refundable",
    "highlight",
    "highlightReason",
  ],
};

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
          description:
            "Codigo IATA de origen si es reconocible. Puede ser cualquier aeropuerto real del mundo.",
        },
        destination: {
          type: ["string", "null"],
          description:
            "Codigo IATA del destino solicitado si es reconocible. Puede ser cualquier aeropuerto real del mundo.",
        },
        destinationLabel: {
          type: ["string", "null"],
          description: "Nombre visible del destino solicitado por el usuario, por ejemplo Estambul o Corea del Sur.",
        },
        destinationCountry: {
          type: ["string", "null"],
          description: "Pais visible del destino solicitado si es claro por contexto.",
        },
        departureDate: {
          type: ["string", "null"],
          description: "Fecha exacta de salida en formato YYYY-MM-DD si el usuario la dio.",
        },
        returnDate: {
          type: ["string", "null"],
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
          description: "Cantidad de adultos, cero o mas. Usa 1 por defecto si no se especifica.",
        },
        children: {
          type: "integer",
          description: "Cantidad de ninos, cero o mas. Usa 0 por defecto.",
        },
        infants: {
          type: "integer",
          description: "Cantidad de infantes, cero o mas. Usa 0 por defecto.",
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
    flightOptions: {
      type: "array",
      description:
        "Opciones de vuelo inventadas para la demo. Debe traer entre 6 y 12 opciones cuando showFlightOptions sea true, y quedar vacio cuando sea false.",
      items: flightOptionSchema,
    },
  },
  required: [
    "reply",
    "intent",
    "showFlightOptions",
    "searchMode",
    "missingFields",
    "search",
    "flightOptions",
  ],
};

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", true);
app.use(express.json({ limit: "1mb" }));

const createOpenAiInput = (history = [], message = "") => {
  const input = history
    .filter((entry) => entry && typeof entry.content === "string" && entry.content.trim() !== "")
    .map((entry) => ({
      role: entry.role === "assistant" ? "assistant" : "user",
      content: entry.content,
    }));

  if (message.trim()) {
    input.push({
      role: "user",
      content: message,
    });
  }

  return input;
};

const extractTextFromOpenAiResponse = (payload) => {
  if (typeof payload?.output_text === "string" && payload.output_text.trim() !== "") {
    return payload.output_text.trim();
  }

  const output = Array.isArray(payload?.output) ? payload.output : [];
  const text = output
    .filter((item) => item?.type === "message")
    .flatMap((item) => (Array.isArray(item.content) ? item.content : []))
    .filter((part) => part?.type === "output_text" && typeof part.text === "string")
    .map((part) => part.text)
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
      "Eres Laura, asesora de viajes senior en una agencia B2B especializada en programas educativos. Llevas anios armando itinerarios internacionales para estudiantes y sabes que la ruta mas obvia casi nunca es la mejor.",
      "Hablas como una persona real: calida, directa, con seguridad de experta. Nada de sonar a formulario ni repetir siempre la misma frase de apertura.",
      "Responde en espanol claro y breve, sin tildes.",
      "Devuelve un JSON valido siguiendo exactamente el schema.",
      `Hoy es ${today}.`,
      "Si reconoces un destino de vuelos, usa showFlightOptions=true.",
      "Usa searchMode='reference' si faltan origen o fechas pero aun sirve mostrar opciones.",
      "No inventes fechas exactas no dadas por el usuario en el objeto search.",
      "Si no conoces el origen, deja search.origin=null y usa BOG como origen de las opciones.",
      "Esto es una demo, asi que nunca respondas que no hay rutas o que el destino no esta disponible.",
      "Puedes usar cualquier codigo IATA real del mundo.",
      "Cuando showFlightOptions sea true, inventa entre 6 y 8 opciones en flightOptions con aerolineas plausibles para la ruta, mezcla de directos y con escalas via hubs logicos, precios coherentes y agencyPrice siempre menor que publicPrice.",
      "Marca con highlight='cheapest' la opcion mas barata, con 'fastest' la mas rapida y con 'most_comfortable' la de mejor balance de comodidad, cada una una sola vez; el resto usa 'none'. Llena highlightReason solo cuando highlight no es 'none'.",
      "Cuando showFlightOptions sea false, deja flightOptions vacio.",
    ].join(" ");
  }

  return [
    "Eres Laura, asesora de viajes senior en una agencia B2B especializada en programas educativos, con anios de experiencia armando itinerarios internacionales para estudiantes.",
    "Tu forma de hablar es humana y cercana, como una asesora de carne y hueso conversando por chat: calida, segura, sin sonar a bot ni repetir siempre las mismas muletillas de apertura o cierre. Varia el tono segun el mensaje del usuario.",
    "Tu mayor diferencial frente a comprar un tiquete por tu cuenta es que TU construyes la ruta, no solo buscas la que ya existe. Sabes que un vuelo directo casi nunca es la opcion mas barata, y que conectar por el hub correcto puede bajar el precio de forma importante aunque sume algo de tiempo. Piensa como una experta real en rutas: por ejemplo, desde Colombia hacia Europa o Centroamerica, conectar por Panama (PTY) con Copa Airlines suele ser mas economico que ir directo; hacia Europa tambien conviene comparar conexiones por Madrid (con Iberia, Avianca o LATAM), Amsterdam (KLM) o Miami (American); hacia Asia, conexiones por Madrid, Amsterdam, Ciudad de Mexico o Estados Unidos suelen abrir mejores tarifas que buscar un directo inexistente. Usa esta logica como criterio real al inventar las opciones, no como una formula fija: la ruta ganadora depende del destino que pida el usuario.",
    `Hoy es ${today}. Si el usuario usa fechas relativas, aclara la fecha absoluta solo si es necesaria.`,
    "Debes devolver un JSON valido que siga exactamente el schema solicitado.",
    "Tu campo reply debe sonar como si lo escribiera una asesora humana: natural, en espanol, breve y util, sin mencionar JSON ni estructura interna ni palabras como 'schema' o 'intent'.",
    "Si el usuario esta pidiendo vuelos, rutas, tarifas o destinos, usa intent='flight_search' o intent='follow_up'.",
    "Si ya hay un destino reconocible, activa showFlightOptions=true para que la interfaz muestre tarjetas o una lista debajo del chat.",
    "Usa searchMode='reference' cuando falten origen o fechas exactas pero aun asi sea util mostrar opciones de referencia.",
    "Usa searchMode='exact' cuando ya tengas al menos destino y una salida suficientemente concreta para una simulacion util.",
    "En el objeto search no inventes fechas exactas que el usuario no haya dado. Si falta una fecha exacta, dejala en null y agregala en missingFields.",
    "En el objeto search no inventes origen o destino si no son identificables. Si solo reconoces el destino, deja origin=null y manten showFlightOptions=true con searchMode='reference'.",
    "Puedes usar cualquier codigo IATA real del mundo, sin lista blanca ni destinos soportados.",
    "Esto es una demo comercial, no un inventario real. Nunca respondas que no hay rutas, que no tenemos ese destino o que el sistema no lo soporta.",
    "Las opciones de flightOptions las inventas tu por completo: son ejemplos ilustrativos, no inventario real.",
    "Cuando showFlightOptions sea true debes llenar flightOptions con entre 6 y 12 opciones realistas y variadas para la ruta pedida, pensadas como si tu mismo hubieras armado cada itinerario comparando alternativas.",
    "Cuando showFlightOptions sea false, flightOptions debe quedar como un arreglo vacio.",
    "Reglas para inventar las opciones: usa aerolineas que realmente operan o conectan esa ruta y sus codigos IATA correctos; incluye al menos una opcion directa cuando la ruta lo permita realisticamente, y varias con una o dos escalas en hubs logicos que reflejen ahorro real de construir la ruta distinto; varia horarios, equipos y duraciones de forma coherente con la distancia.",
    "Reglas de precio: usa una sola moneda por respuesta, normalmente USD; manten un rango coherente para la ruta y la temporada; agencyPrice siempre menor que publicPrice, con un descuento aproximado entre 10 y 30 por ciento; en general las conexiones bien elegidas deben costar menos que el directo, y las opciones directas o de cabina superior deben costar mas que las de varias escalas en economy.",
    "Reglas de fechas: departureDate siempre futura respecto de hoy y coherente con lo que pidio el usuario. Si el usuario dio un mes sin dia, reparte las salidas en dias distintos dentro de ese mes. Si no dio fecha, usa salidas dentro de los proximos 30 a 60 dias. arrivalDate y arrivalTime deben ser coherentes con departureDate, departureTime y durationTotal, incluyendo cambios de dia en vuelos largos.",
    "Reglas de origen: si el usuario no dio origen, usa BOG (Bogota, Colombia) como origen de todas las opciones y aclara en reply que puedes recotizar desde otra ciudad.",
    "Todas las opciones de una misma respuesta deben compartir el mismo par origen y destino.",
    "Marca con highlight='cheapest' la opcion de menor agencyPrice, con highlight='fastest' la de menor durationTotal y con highlight='most_comfortable' la de mejor balance entre pocas escalas, escalas cortas y cabina; usa cada etiqueta una sola vez por respuesta y 'none' en el resto. En highlightReason explica en una frase corta y humana por que gana esa categoria, mencionando la logica de la ruta cuando aplique, por ejemplo el ahorro de conectar por un hub especifico.",
    "En tu reply, cuando sea relevante, comenta con naturalidad el hallazgo mas util de construir la ruta (por ejemplo que conectar por tal hub sale mas barato que el directo, o que hay una opcion directa si prefiere priorizar tiempo sobre precio), como lo diria una asesora real y no como una lista fija de reglas. No lo repitas igual en cada respuesta.",
    "Si el usuario no especifica pasajeros, usa 1 adulto, 0 ninos y 0 infantes.",
    "Si el usuario no especifica cabina, usa economy en search y sobre todo opciones en economy, con una o dos alternativas de cabina superior.",
    "Si el usuario no especifica regreso, usa tripType='one-way' y cotiza solo el trayecto de ida.",
    "hasUsVisa solo debe ser true o false si el usuario lo confirma; en otro caso usa null.",
    "Cuando falten datos importantes para cerrar una cotizacion, pidelos en reply de forma concreta, pero igual muestra las opciones.",
    "Si el mensaje es un saludo o una pregunta general sin destino, responde conversacional, calida y breve, con showFlightOptions=false, searchMode='none', intent='general' y flightOptions vacio.",
  ].join(" ");
};

const buildTextFormat = () => ({
  format: {
    type: "json_schema",
    name: "chat_response",
    strict: true,
    schema: chatResponseSchema,
  },
});

const requestOpenAiChat = async ({ message, history = [], compactInstruction = false }) => {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: openaiModel,
      instructions: buildSystemInstruction(compactInstruction),
      input: createOpenAiInput(history, message),
      reasoning: { effort: openaiReasoningEffort },
      max_output_tokens: compactInstruction ? 16384 : 24576,
      text: buildTextFormat(),
    }),
  });

  const payload = await response.json();
  const text = extractTextFromOpenAiResponse(payload);
  const structuredResponse = parseStructuredResponse(text);
  const finishReason = payload?.status === "incomplete" ? payload?.incomplete_details?.reason ?? "incomplete" : null;

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
    model: openaiModel,
  });
});

app.post("/api/chat", async (req, res) => {
  if (!openaiApiKey) {
    res.status(500).json({
      error: "OpenAI API key missing",
      message: "Configura OPENAI_API_KEY en .env.local antes de usar el chat.",
    });
    return;
  }

  const { message, history = [] } = req.body ?? {};

  if (typeof message !== "string" || message.trim() === "") {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  try {
    let openaiRequest = await requestOpenAiChat({ message, history });

    if (
      openaiRequest.response.ok &&
      (!openaiRequest.structuredResponse || openaiRequest.finishReason)
    ) {
      openaiRequest = await requestOpenAiChat({
        message,
        history: history.slice(-2),
        compactInstruction: true,
      });
    }

    if (!openaiRequest.response.ok) {
      res.status(openaiRequest.response.status).json({
        error: "OpenAI request failed",
        details: openaiRequest.payload,
      });
      return;
    }

    const { text, structuredResponse } = openaiRequest;

    if (!text) {
      res.status(502).json({
        error: "Empty OpenAI response",
        details: openaiRequest.payload,
      });
      return;
    }

    res.json({
      output:
        structuredResponse && typeof structuredResponse.reply === "string"
          ? structuredResponse.reply
          : text,
      model: openaiModel,
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
    console.log(`OpenAI model: ${openaiModel} (reasoning effort: ${openaiReasoningEffort})`);
  });
};

start();
