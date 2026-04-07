import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Calendar,
  DollarSign,
  Loader2,
  MapPin,
  MessageCircle,
  Plane,
  Send,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { searchFlightsWithMinimumResults } from "@/data/mockFlights";
import type { Flight, FlightSearchCriteria } from "@/types/flight";
import { normalizeIsoDate } from "@/utils/dateUtils";

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  flights?: Flight[];
}

interface ChatAssistantProps {
  onFlightsDetected?: (flights: Flight[]) => void;
  className?: string;
}

type ChatIntent = "flight_search" | "follow_up" | "general";
type ChatSearchMode = "none" | "reference" | "exact";

interface GeminiChatAction {
  reply: string;
  intent: ChatIntent;
  showFlightOptions: boolean;
  searchMode: ChatSearchMode;
  missingFields: string[];
  search: {
    origin: string | null;
    destination: string | null;
    destinationLabel: string | null;
    destinationCountry: string | null;
    simulationDestination: string | null;
    simulationOrigin: string | null;
    departureDate: string | null;
    returnDate: string | null;
    tripType: string;
    cabinClass: string;
    adults: number;
    children: number;
    infants: number;
    hasUsVisa: boolean | null;
  };
}

interface GeminiChatApiResponse {
  output?: string;
  model?: string;
  chatAction?: GeminiChatAction | null;
}

const supportedAirportCodes = new Set([
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
]);

const supportedCabinClasses = new Set(["economy", "premium-economy", "business", "first"]);
const supportedTripTypes = new Set(["one-way", "round-trip"]);

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isGeminiChatAction = (value: unknown): value is GeminiChatAction => {
  if (!isObject(value) || !isObject(value.search)) {
    return false;
  }

  return (
    typeof value.reply === "string" &&
    typeof value.intent === "string" &&
    typeof value.showFlightOptions === "boolean" &&
    typeof value.searchMode === "string" &&
    Array.isArray(value.missingFields)
  );
};

const parseChatActionFromOutput = (output?: string) => {
  if (typeof output !== "string" || output.trim() === "") {
    return null;
  }

  try {
    const parsedOutput = JSON.parse(output);
    return isGeminiChatAction(parsedOutput) ? parsedOutput : null;
  } catch {
    return null;
  }
};

const getSupportedAirportCode = (value: unknown) => {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedCode = value.trim().toUpperCase();
  return supportedAirportCodes.has(normalizedCode) ? normalizedCode : null;
};

const normalizeTripType = (value: unknown): FlightSearchCriteria["tripType"] =>
  typeof value === "string" && supportedTripTypes.has(value)
    ? (value as FlightSearchCriteria["tripType"])
    : "one-way";

const normalizeCabinClass = (value: unknown): FlightSearchCriteria["cabinClass"] =>
  typeof value === "string" && supportedCabinClasses.has(value)
    ? (value as FlightSearchCriteria["cabinClass"])
    : "economy";

const normalizePassengerCount = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : fallback;

const buildSearchCriteriaFromAction = (
  action: GeminiChatAction | null | undefined
): FlightSearchCriteria | null => {
  if (!action?.showFlightOptions || !isObject(action.search)) {
    return null;
  }

  const destination =
    getSupportedAirportCode(action.search.simulationDestination) ||
    getSupportedAirportCode(action.search.destination);
  if (!destination) {
    return null;
  }

  const tripType = normalizeTripType(action.search.tripType);
  const departureDate = normalizeIsoDate(
    typeof action.search.departureDate === "string" ? action.search.departureDate : undefined,
    21
  );
  const returnDate =
    tripType === "round-trip"
      ? normalizeIsoDate(
          typeof action.search.returnDate === "string" ? action.search.returnDate : undefined,
          30
        )
      : undefined;

  return {
    origin:
      getSupportedAirportCode(action.search.simulationOrigin) ||
      getSupportedAirportCode(action.search.origin) ||
      "BOG",
    destination,
    departureDate,
    returnDate,
    passengers: {
      adults: Math.max(1, normalizePassengerCount(action.search.adults, 1)),
      children: normalizePassengerCount(action.search.children, 0),
      infants: normalizePassengerCount(action.search.infants, 0),
    },
    cabinClass: normalizeCabinClass(action.search.cabinClass),
    tripType,
    flexibility: "exact",
    hasUsVisa: typeof action.search.hasUsVisa === "boolean" ? action.search.hasUsVisa : true,
  };
};

const getDemoDestinationCode = (action: GeminiChatAction) => {
  if (typeof action.search.destination === "string" && /^[A-Za-z]{3}$/.test(action.search.destination)) {
    return action.search.destination.toUpperCase();
  }

  const fallbackCode =
    getSupportedAirportCode(action.search.destination) ||
    getSupportedAirportCode(action.search.simulationDestination);

  return fallbackCode || "DEM";
};

const applyDemoDestinationPresentation = (
  flights: Flight[],
  action: GeminiChatAction | null | undefined
) => {
  if (!action || !isObject(action.search)) {
    return flights;
  }

  const requestedLabel =
    typeof action.search.destinationLabel === "string" && action.search.destinationLabel.trim() !== ""
      ? action.search.destinationLabel.trim()
      : null;
  const requestedCountry =
    typeof action.search.destinationCountry === "string" && action.search.destinationCountry.trim() !== ""
      ? action.search.destinationCountry.trim()
      : null;
  const supportedDestination = getSupportedAirportCode(action.search.destination);

  if (!requestedLabel || supportedDestination) {
    return flights;
  }

  const destinationCode = getDemoDestinationCode(action);

  return flights.map((flight, index) => ({
    ...flight,
    id: `${flight.id}_demo_${destinationCode}_${index}`,
    route: {
      ...flight.route,
      destination: {
        ...flight.route.destination,
        code: destinationCode,
        city: requestedLabel,
        name: `${requestedLabel} - Referencia demo`,
        country: requestedCountry || flight.route.destination.country,
      },
    },
  }));
};

const ChatAssistant = ({ onFlightsDetected, className = "" }: ChatAssistantProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "Hola. Soy tu asistente de vuelos y puedo ayudarte a encontrar rutas, tarifas y opciones segun destino o presupuesto.",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isConnectedToAI, setIsConnectedToAI] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendToGemini = async (message: string): Promise<GeminiChatApiResponse> => {
    try {
      const history = messages
        .filter((entry) => entry.type === "user" || entry.type === "assistant")
        .slice(-6)
        .map((entry) => ({
          role: entry.type,
          content: entry.content,
        }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          history,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as GeminiChatApiResponse;
      const recoveredChatAction = data.chatAction ?? parseChatActionFromOutput(data.output);

      if (recoveredChatAction) {
        return {
          ...data,
          output: recoveredChatAction.reply,
          chatAction: recoveredChatAction,
        };
      }

      if (typeof data.output === "string" && data.output.trim() !== "") {
        return data;
      }

      return {
        output: "Recibi tu mensaje, pero Gemini devolvio un formato inesperado.",
        chatAction: null,
      };
    } catch (error) {
      console.error("Gemini error:", error);
      setIsConnectedToAI(false);
      return {
        output: "Hay un problema temporal con Gemini. Intenta nuevamente en unos segundos.",
        chatAction: null,
      };
    }
  };

  const processUserMessage = async (message: string): Promise<ChatMessage> => {
    setIsConnectedToAI(true);

    const geminiResponse = await sendToGemini(message);
    const response =
      typeof geminiResponse.output === "string" && geminiResponse.output.trim() !== ""
        ? geminiResponse.output
        : "Cuentame origen, destino y fecha estimada, y te ayudo con opciones.";
    const searchCriteria = buildSearchCriteriaFromAction(geminiResponse.chatAction);
    const detectedFlights =
      searchCriteria && geminiResponse.chatAction?.showFlightOptions
        ? applyDemoDestinationPresentation(
            searchFlightsWithMinimumResults(searchCriteria, 20),
            geminiResponse.chatAction
          )
        : [];

    if (geminiResponse.chatAction?.showFlightOptions) {
      onFlightsDetected?.(detectedFlights);
    } else {
      onFlightsDetected?.([]);
    }

    return {
      id: Date.now().toString(),
      type: "assistant",
      content: response,
      timestamp: new Date(),
      flights: detectedFlights,
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) {
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const assistantResponse = await processUserMessage(userMessage.content);
      setMessages((currentMessages) => [...currentMessages, assistantResponse]);
    } catch (_error) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now().toString(),
          type: "assistant",
          content: "Lo siento, hubo un error al procesar tu mensaje. Intenta nuevamente.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <Card className={`mx-auto w-full max-w-4xl ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          Asistente de vuelos
          <Badge variant={isConnectedToAI ? "secondary" : "destructive"} className="ml-auto">
            <Bot className="mr-1 h-3 w-3" />
            {isConnectedToAI ? "Gemini conectada" : "Modo local"}
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Preguntame por destinos, tarifas o fechas y te devuelvo una guia rapida.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <ScrollArea className="h-96 w-full rounded-md border p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.type === "assistant" && (
                  <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>

                  {(message.flights ?? []).length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.flights?.slice(0, 4).map((flight) => (
                        <div key={flight.id} className="rounded-md border bg-background p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Plane className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium">
                                {flight.flightNumber} - {flight.airline}
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              <DollarSign className="mr-1 h-3 w-3" />
                              ${flight.pricing.agencyPrice.toLocaleString()}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {flight.route.origin.code} - {flight.route.destination.code}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {flight.schedule.departure.date}
                            </div>
                          </div>
                        </div>
                      ))}
                      {message.flights && message.flights.length > 4 && (
                        <p className="text-xs text-muted-foreground">
                          +{message.flights.length - 4} opciones mas en la seccion de resultados.
                        </p>
                      )}
                    </div>
                  )}

                  <p className="mt-1 text-xs opacity-70">{formatTime(message.timestamp)}</p>
                </div>

                {message.type === "user" && (
                  <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start gap-3">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
                <div className="rounded-lg bg-muted px-4 py-2">
                  <div className="flex items-center gap-1">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Escribiendo...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(event) => setInputMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Escribe tu mensaje... (ej: 'Busco vuelos a Madrid')"
            className="flex-1"
            disabled={isTyping}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-muted"
            onClick={() => setInputMessage("Busco vuelos a Madrid")}
          >
            Vuelos a Madrid
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-muted"
            onClick={() => setInputMessage("Cuales son las tarifas B2B?")}
          >
            Tarifas B2B
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-muted"
            onClick={() => setInputMessage("Vuelos baratos a Miami")}
          >
            Vuelos a Miami
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-muted"
            onClick={() => setInputMessage("Busco viajes a Corea del Sur")}
          >
            Viajes a Corea
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export { ChatAssistant };
export default ChatAssistant;
