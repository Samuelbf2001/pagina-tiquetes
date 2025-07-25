import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Send, MessageCircle, User, Bot, Loader2, Plane, Clock, MapPin, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  type?: 'text' | 'flights';
  flightData?: FlightInfo[];
}

interface FlightInfo {
  numero: string;
  aerolinea: string;
  horaSalida: string;
  horaLlegada: string;
  precio: string;
  tipo: string; // 'Directo' o 'Escala'
}

interface ChatAssistantProps {
  className?: string;
}

export function ChatAssistant({ className = "" }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '¡Hola! Soy tu asistente de viajes. ¿En qué puedo ayudarte hoy? Puedo ayudarte con información sobre vuelos, destinos, documentación de viaje y más.',
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    
    // Scroll automático cuando el usuario envía un mensaje
    setTimeout(() => scrollToBottom(), 50);

    try {
      const response = await fetch('https://n8n-n8n.5raxun.easypanel.host/webhook/8af651f0-e328-4919-b90a-7a4a41a26302', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          timestamp: userMessage.timestamp.toISOString(),
          userId: 'user_' + Date.now(),
          context: 'flight_search'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Procesar la respuesta que viene como array con campo "output"
      let assistantResponse = '';
      
      if (Array.isArray(data) && data.length > 0 && data[0].output) {
        // Formato: [{ "output": "mensaje" }]
        assistantResponse = data[0].output;
      } else {
        // Formato alternativo para compatibilidad
        assistantResponse = data.response || data.message || data.reply || data.output || 'Lo siento, no pude procesar tu mensaje en este momento.';
      }
      
      // Filtrar solo el mensaje "Workflow was started" si aparece
      if (assistantResponse === 'Workflow was started' || assistantResponse.includes('Workflow was started')) {
        assistantResponse = 'Estoy procesando tu consulta, por favor espera un momento...';
      }

      // Dividir por saltos de línea dobles y crear mensajes separados
      const messageParts = assistantResponse
        .split('\n\n')
        .map(part => part.trim())
        .filter(part => part.length > 0);

      // Crear un mensaje por cada parte, procesando información de vuelos
      const assistantMessages: Message[] = messageParts.map((part, index) => {
        const flightInfo = parseFlightInfo(part);
        
        if (flightInfo.isFlightInfo && flightInfo.flights.length > 0) {
          return {
            id: Date.now().toString() + '_assistant_' + index,
            content: flightInfo.remainingText,
            sender: 'assistant',
            timestamp: new Date(),
            type: 'flights',
            flightData: flightInfo.flights
          };
        } else {
          return {
            id: Date.now().toString() + '_assistant_' + index,
            content: part,
            sender: 'assistant',
            timestamp: new Date(),
            type: 'text'
          };
        }
      });

      // Agregar todos los mensajes con un pequeño delay entre cada uno para mejor UX
      assistantMessages.forEach((message, index) => {
        setTimeout(() => {
          setMessages(prev => [...prev, message]);
          // Scroll automático después de cada mensaje
          setTimeout(() => scrollToBottom(), 50);
        }, index * 500); // 500ms de delay entre cada mensaje
      });

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: Date.now().toString() + '_error',
        content: 'Lo siento, hubo un problema al conectar con el asistente. Por favor, intenta de nuevo en unos momentos.',
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error de conexión",
        description: "No se pudo enviar el mensaje. Intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Función para parsear información de vuelos del texto
  const parseFlightInfo = (text: string): { isFlightInfo: boolean; flights: FlightInfo[]; remainingText: string } => {
    // Intentar múltiples patrones
    let flightPattern = /(\d+\.\s*\*\*Número de vuelo:\*\*.*?)(?=\d+\.\s*\*\*Número de vuelo:\*\*|$)/gs;
    let matches = text.match(flightPattern);
    
    // Si no encuentra el patrón anterior, intentar con formato alternativo
    if (!matches) {
      flightPattern = /(\d+\.\s*\*\*Vuelo\*\*.*?)(?=\d+\.\s*\*\*Vuelo\*\*|$)/gs;
      matches = text.match(flightPattern);
    }
    
    if (!matches || matches.length === 0) {
      return { isFlightInfo: false, flights: [], remainingText: text };
    }

    const flights: FlightInfo[] = matches.map(match => {
      // Intentar ambos formatos para el número de vuelo
      const numero = match.match(/\*\*(?:Número de vuelo|Vuelo):\*\*\s*([^\s-]+)/)?.[1] || '';
      const aerolinea = match.match(/\*\*Aerolínea:\*\*\s*([^-]+?)(?=\s*-)/)?.[1]?.trim() || '';
      
      // Mejorar parsing de fecha y hora de salida
      const salidaMatch = match.match(/\*\*Fecha y hora de salida:\*\*\s*([^-]+?)(?=\s*-)/)?.[1]?.trim() || '';
      const llegadaMatch = match.match(/\*\*Fecha y hora de llegada:\*\*\s*([^-]+?)(?=\s*-)/)?.[1]?.trim() || '';
      
      const precio = match.match(/\*\*Precio total:\*\*\s*([^-\n]+)/)?.[1]?.trim() || '';

      // Extraer solo las horas (formato: "2024-08-05 a las 23:45" -> "23:45")
      let horaSalida = '';
      
      if (salidaMatch.includes(' a las ')) {
        horaSalida = salidaMatch.split(' a las ')[1]?.trim() || '';
      } else {
        // Extraer hora con regex
        const timeMatch = salidaMatch.match(/(\d{2}:\d{2})/);
        horaSalida = timeMatch ? timeMatch[1] : '';
      }

      // Extraer solo las horas para llegada
      let horaLlegada = '';
      
      if (llegadaMatch.includes(' a las ')) {
        horaLlegada = llegadaMatch.split(' a las ')[1]?.trim() || '';
      } else {
        // Extraer hora con regex
        const timeMatch = llegadaMatch.match(/(\d{2}:\d{2})/);
        horaLlegada = timeMatch ? timeMatch[1] : '';
      }

      // Determinar si es directo o con escala
      let tipo = 'Directo'; // Por defecto directo
      
      // Buscar indicadores de escalas en el texto del vuelo
      const lowerMatch = match.toLowerCase();
      if (lowerMatch.includes('escala') || 
          lowerMatch.includes('escalas') ||
          lowerMatch.includes('conexión') || 
          lowerMatch.includes('conexiones') ||
          lowerMatch.includes('parada') ||
          lowerMatch.includes('paradas') ||
          lowerMatch.includes('connecting') ||
          lowerMatch.includes('layover') ||
          lowerMatch.includes('con escala') ||
          lowerMatch.includes('vuelo con') ||
          lowerMatch.includes('1 escala') ||
          lowerMatch.includes('2 escalas')) {
        tipo = 'Escala';
      }

      return {
        numero,
        aerolinea,
        horaSalida,
        horaLlegada,
        precio,
        tipo
      };
    });

    // Remover la información de vuelos del texto original
    const remainingText = text.replace(flightPattern, '').trim();
    
    return { isFlightInfo: true, flights, remainingText };
  };

  // Componente para renderizar tabla de vuelos
  const FlightTable = ({ flights }: { flights: FlightInfo[] }) => (
    <Card className="mb-3">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Plane className="h-5 w-5 text-blue-600" />
          Vuelos Disponibles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
                              <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Vuelo</TableHead>
                        <TableHead>Aerolínea</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Salida</TableHead>
                        <TableHead>Llegada</TableHead>
                        <TableHead className="text-right">Precio</TableHead>
                      </TableRow>
                    </TableHeader>
          <TableBody>
            {flights.map((flight, index) => (
                                      <TableRow key={index}>
                          <TableCell className="font-medium">
                            <Badge variant="outline" className="text-blue-600 border-blue-600">
                              {flight.numero}
                            </Badge>
                          </TableCell>
                          <TableCell>{flight.aerolinea}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={flight.tipo === 'Directo' ? 'default' : 'secondary'}
                              className={flight.tipo === 'Directo' 
                                ? 'bg-green-100 text-green-800 border-green-300' 
                                : 'bg-orange-100 text-orange-800 border-orange-300'
                              }
                            >
                              {flight.tipo}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-lg font-semibold text-blue-600">
                              {flight.horaSalida}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-lg font-semibold text-blue-600">
                              {flight.horaLlegada}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <DollarSign className="h-3 w-3 mr-1" />
                              {flight.precio}
                            </Badge>
                          </TableCell>
                        </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <Card className={`w-full flex flex-col ${className}`} style={{ height: '650px' }}>
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="h-5 w-5 text-primary" />
          Asistente de Viajes
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Pregúntame sobre vuelos, destinos, documentación y más
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4 pt-0 min-h-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 pr-4 mb-4 min-h-0">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className={
                    message.sender === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground'
                  }>
                    {message.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                
                <div className={`flex flex-col gap-1 ${
                  message.type === 'flights' ? 'w-full' : 'max-w-[80%]'
                } ${
                  message.sender === 'user' ? 'items-end' : 'items-start'
                }`}>
                  {message.type === 'flights' && message.flightData ? (
                    // Renderizar información de vuelos como tabla
                    <div className="w-full">
                      {message.content && (
                        <div className="bg-muted text-muted-foreground rounded-lg px-3 py-2 text-sm mb-2">
                          {message.content}
                        </div>
                      )}
                      <FlightTable flights={message.flightData} />
                    </div>
                  ) : (
                    // Renderizar mensaje de texto normal
                    <div className={`rounded-lg px-3 py-2 text-sm ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {message.content}
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Escribiendo...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex gap-2 flex-shrink-0">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 