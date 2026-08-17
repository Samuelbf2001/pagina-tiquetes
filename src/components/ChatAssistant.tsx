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
import type { Airport, CabinClass, Flight, Layover } from "@/types/flight";
import {
  buildDateTime,
  formatDateToIso,
  formatTimeTo24Hour,
  normalizeIsoDate,
  parseDurationToMinutes,
} from "@/utils/dateUtils";

type ChatFlightHighlight = "cheapest" | "fastest" | "most_comfortable" | "none";

type ChatFlight = Flight & {
  highlight: ChatFlightHighlight;
  highlightReason: string;
};

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  flights?: ChatFlight[];
}

interface ChatAssistantProps {
  onFlightsDetected?: (flights: Flight[]) => void;
  className?: string;
}

type ChatIntent = "flight_search" | "follow_up" | "general";
type ChatSearchMode = "none" | "reference" | "exact";

interface ChatAction {
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
    departureDate: string | null;
    returnDate: string | null;
    tripType: string;
    cabinClass: string;
    adults: number;
    children: number;
    infants: number;
    hasUsVisa: boolean | null;
  };
  flightOptions?: unknown;
}

interface ChatApiResponse {
  output?: string;
  model?: string;
  chatAction?: ChatAction | null;
}

const MAX_CHAT_FLIGHTS = 12;

const highlightBadgeConfig: Record<ChatFlightHighlight, { label: string; className: string } | null> = {
  cheapest: { label: "Mas economica", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  fastest: { label: "Mas rapida", className: "border-sky-200 bg-sky-50 text-sky-700" },
  most_comfortable: { label: "Mas comoda", className: "border-violet-200 bg-violet-50 text-violet-700" },
  none: null,
};

const sortForDisplay = (flights: ChatFlight[]): ChatFlight[] =>
  [...flights].sort((left, right) => {
    const leftHighlighted = left.highlight !== "none" ? 0 : 1;
    const rightHighlighted = right.highlight !== "none" ? 0 : 1;
    return leftHighlighted - rightHighlighted;
  });

const cabinClasses = new Set<CabinClass>(["economy", "premium-economy", "business", "first"]);

const bookingClassByCabin: Record<CabinClass, string> = {
  economy: "Y",
  "premium-economy": "W",
  business: "J",
  first: "F",
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isFilledString = (value: unknown): value is string =>
  typeof value === "string" && value.trim() !== "";

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const readText = (value: unknown, fallback: string) =>
  isFilledString(value) ? value.trim() : fallback;

const readAirportCode = (value: unknown) => {
  if (!isFilledString(value)) {
    return null;
  }

  const normalizedCode = value.trim().toUpperCase();
  return /^[A-Z]{3}$/.test(normalizedCode) ? normalizedCode : null;
};

const readTime = (value: unknown) => {
  if (!isFilledString(value)) {
    return null;
  }

  const timeMatch = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!timeMatch) {
    return null;
  }

  const hours = Number.parseInt(timeMatch[1], 10);
  const minutes = Number.parseInt(timeMatch[2], 10);
  if (hours > 23 || minutes > 59) {
    return null;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const readIsoDate = (value: unknown) => {
  if (!isFilledString(value) || !/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return null;
  }

  const parsedDate = new Date(`${value.trim()}T12:00:00`);
  return Number.isNaN(parsedDate.getTime()) ? null : formatDateToIso(parsedDate);
};

const formatMinutesToDuration = (totalMinutes: number) =>
  `${Math.floor(totalMinutes / 60)}h ${String(totalMinutes % 60).padStart(2, "0")}m`;

const readAirport = (value: unknown): Airport | null => {
  if (!isObject(value)) {
    return null;
  }

  const code = readAirportCode(value.code);
  if (!code) {
    return null;
  }

  const city = readText(value.city, code);

  return {
    code,
    name: readText(value.name, `Aeropuerto de ${city}`),
    city,
    country: readText(value.country, "Internacional"),
  };
};

const readLayovers = (value: unknown): Layover[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .slice(0, 3)
    .map((stop) => {
      const airport = readAirport(stop);
      if (!airport) {
        return null;
      }

      const rawDuration = isObject(stop) ? stop.layoverDuration : null;
      const layoverMinutes = isFilledString(rawDuration) ? parseDurationToMinutes(rawDuration) : 0;

      return {
        airport,
        duration: formatMinutesToDuration(layoverMinutes > 0 ? layoverMinutes : 120),
      } satisfies Layover;
    })
    .filter((layover): layover is Layover => layover !== null);
};

const readCabinClass = (value: unknown): CabinClass =>
  typeof value === "string" && cabinClasses.has(value as CabinClass)
    ? (value as CabinClass)
    : "economy";

const chatFlightHighlights = new Set<ChatFlightHighlight>([
  "cheapest",
  "fastest",
  "most_comfortable",
  "none",
]);

const readHighlight = (value: unknown): ChatFlightHighlight =>
  typeof value === "string" && chatFlightHighlights.has(value as ChatFlightHighlight)
    ? (value as ChatFlightHighlight)
    : "none";

const buildMealsForDuration = (flyingMinutes: number) => {
  if (flyingMinutes >= 480) {
    return ["Cena", "Desayuno"];
  }

  if (flyingMinutes >= 240) {
    return ["Comida caliente"];
  }

  if (flyingMinutes >= 90) {
    return ["Snack"];
  }

  return [];
};

const mapOptionToFlight = (option: unknown, index: number): ChatFlight | null => {
  if (!isObject(option)) {
    return null;
  }

  const origin = readAirport(option.origin);
  const destination = readAirport(option.destination);
  if (!origin || !destination || origin.code === destination.code) {
    return null;
  }

  const totalMinutes = isFilledString(option.durationTotal)
    ? parseDurationToMinutes(option.durationTotal)
    : 0;
  if (totalMinutes <= 0) {
    return null;
  }

  const publicPriceValue = isFiniteNumber(option.publicPrice) ? Math.round(option.publicPrice) : 0;
  const agencyPriceValue = isFiniteNumber(option.agencyPrice) ? Math.round(option.agencyPrice) : 0;
  if (publicPriceValue <= 0 || agencyPriceValue <= 0) {
    return null;
  }

  const publicPrice = Math.max(publicPriceValue, agencyPriceValue);
  const agencyPrice =
    publicPriceValue === agencyPriceValue
      ? Math.round(publicPrice * 0.85)
      : Math.min(publicPriceValue, agencyPriceValue);

  const layovers = readLayovers(option.stops);
  const layoverMinutes = layovers.reduce(
    (sum, layover) => sum + parseDurationToMinutes(layover.duration),
    0
  );
  const flyingMinutes = totalMinutes - layoverMinutes > 0 ? totalMinutes - layoverMinutes : totalMinutes;

  const departureDate = readIsoDate(option.departureDate) ?? normalizeIsoDate(undefined, 30);
  const departureTime = readTime(option.departureTime) ?? "08:00";
  const fallbackArrival = new Date(
    buildDateTime(departureDate, departureTime).getTime() + totalMinutes * 60 * 1000
  );
  const arrivalDate = readIsoDate(option.arrivalDate) ?? formatDateToIso(fallbackArrival);
  const arrivalTime = readTime(option.arrivalTime) ?? formatTimeTo24Hour(fallbackArrival);

  const cabinClass = readCabinClass(option.cabinClass);
  const currency = readText(option.currency, "USD").toUpperCase().slice(0, 3);
  const airlineCode = readText(option.airlineCode, "XX").toUpperCase().slice(0, 3);
  const airline = readText(option.airline, "Aerolinea demo");
  const flightNumber = readText(option.flightNumber, `${airlineCode}${100 + index}`);
  const baggageIncluded = option.baggageIncluded !== false;
  const refundable = option.refundable === true;

  const taxes = Math.round(agencyPrice * 0.18);
  const fees = Math.round(agencyPrice * 0.04);
  const fuelSurcharge = Math.round(taxes * 0.6);
  const bookingFee = Math.round(fees * 0.6);
  const advancePurchase = Math.max(
    0,
    Math.round(
      (buildDateTime(departureDate, "12:00").getTime() - new Date().setHours(12, 0, 0, 0)) / 86400000
    )
  );

  return {
    id: `chat_${origin.code}_${destination.code}_${flightNumber}_${index}`.toLowerCase(),
    airline,
    airlineCode,
    flightNumber,
    route: {
      origin,
      destination,
      stops: layovers.map((layover) => layover.airport),
      duration: {
        total: formatMinutesToDuration(totalMinutes),
        flying: formatMinutesToDuration(flyingMinutes),
      },
      distance: Math.round((flyingMinutes / 60) * 800),
    },
    schedule: {
      departure: { date: departureDate, time: departureTime, timezone: "Local" },
      arrival: { date: arrivalDate, time: arrivalTime, timezone: "Local" },
      layovers,
    },
    aircraft: readText(option.aircraft, "Airbus A320"),
    pricing: {
      currency,
      publicPrice,
      agencyPrice,
      discount: Math.round(((publicPrice - agencyPrice) / publicPrice) * 100),
      taxes,
      fees,
      total: agencyPrice + taxes + fees,
      priceBreakdown: {
        baseFare: agencyPrice,
        taxes: [
          { code: "YQ", name: "Recargo de combustible", amount: fuelSurcharge },
          { code: "XT", name: "Tasas aeroportuarias", amount: taxes - fuelSurcharge },
        ],
        fees: [
          { type: "booking", description: "Cargo por emision", amount: bookingFee },
          { type: "service", description: "Servicio de agencia", amount: fees - bookingFee },
        ],
      },
    },
    availability: {
      seats:
        isFiniteNumber(option.seatsAvailable) && option.seatsAvailable >= 1
          ? Math.min(40, Math.round(option.seatsAvailable))
          : 9,
      cabinClass,
      bookingClass: bookingClassByCabin[cabinClass],
      refundable,
      changeable: true,
      lastUpdate: new Date().toISOString(),
    },
    services: {
      meals: buildMealsForDuration(flyingMinutes),
      entertainment: flyingMinutes >= 180,
      wifi: flyingMinutes >= 180,
      powerOutlets: flyingMinutes >= 120,
      extraLegroom: cabinClass !== "economy",
    },
    baggage: {
      carry: { included: true, weight: "10kg", dimensions: "55x40x25cm" },
      checked: baggageIncluded
        ? { included: true, weight: cabinClass === "economy" ? "23kg" : "32kg" }
        : { included: false, weight: "0kg", additionalFee: 60 },
    },
    restrictions: {
      minStay: 3,
      maxStay: 365,
      advancePurchase,
      cancellationPolicy: refundable
        ? "Reembolsable con penalidad"
        : "No reembolsable despues de emitir",
      changePolicy: `Cambios: ${currency} ${refundable ? 100 : 200} + diferencia tarifaria`,
    },
    highlight: readHighlight(option.highlight),
    highlightReason: readText(option.highlightReason, ""),
  };
};

const dedupeHighlights = (flights: ChatFlight[]): ChatFlight[] => {
  const seenHighlights = new Set<ChatFlightHighlight>();

  return flights.map((flight) => {
    if (flight.highlight === "none" || seenHighlights.has(flight.highlight)) {
      return flight.highlight === "none" ? flight : { ...flight, highlight: "none", highlightReason: "" };
    }

    seenHighlights.add(flight.highlight);
    return flight;
  });
};

const buildFlightsFromChatAction = (action: ChatAction | null | undefined): ChatFlight[] => {
  if (!action?.showFlightOptions || !Array.isArray(action.flightOptions)) {
    return [];
  }

  const flights = action.flightOptions
    .slice(0, MAX_CHAT_FLIGHTS)
    .map((option, index) => mapOptionToFlight(option, index))
    .filter((flight): flight is ChatFlight => flight !== null);

  return dedupeHighlights(flights);
};

const isChatAction = (value: unknown): value is ChatAction => {
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
    return isChatAction(parsedOutput) ? parsedOutput : null;
  } catch {
    return null;
  }
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

  const sendToAssistant = async (message: string): Promise<ChatApiResponse> => {
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

      const data = (await response.json()) as ChatApiResponse;
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
        output: "Recibi tu mensaje, pero el asistente devolvio un formato inesperado.",
        chatAction: null,
      };
    } catch (error) {
      console.error("Chat assistant error:", error);
      setIsConnectedToAI(false);
      return {
        output: "Hay un problema temporal con el asistente. Intenta nuevamente en unos segundos.",
        chatAction: null,
      };
    }
  };

  const processUserMessage = async (message: string): Promise<ChatMessage> => {
    setIsConnectedToAI(true);

    const assistantResponse = await sendToAssistant(message);
    const response =
      typeof assistantResponse.output === "string" && assistantResponse.output.trim() !== ""
        ? assistantResponse.output
        : "Cuentame origen, destino y fecha estimada, y te ayudo con opciones.";
    const detectedFlights = buildFlightsFromChatAction(assistantResponse.chatAction);

    onFlightsDetected?.(detectedFlights);

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
            {isConnectedToAI ? "IA conectada" : "Modo local"}
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
                      {sortForDisplay(message.flights ?? [])
                        .slice(0, 4)
                        .map((flight) => {
                          const highlightBadge = highlightBadgeConfig[flight.highlight];

                          return (
                            <div key={flight.id} className="rounded-md border bg-background p-3">
                              {highlightBadge && (
                                <Badge
                                  variant="outline"
                                  className={`mb-2 text-[11px] ${highlightBadge.className}`}
                                >
                                  {highlightBadge.label}
                                </Badge>
                              )}
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
                                  {flight.route.stops.length > 0
                                    ? ` (${flight.route.stops.length} escala${flight.route.stops.length > 1 ? "s" : ""})`
                                    : " (directo)"}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {flight.schedule.departure.date}
                                </div>
                              </div>

                              {flight.highlightReason && (
                                <p className="mt-2 text-xs text-muted-foreground">
                                  {flight.highlightReason}
                                </p>
                              )}
                            </div>
                          );
                        })}
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
