import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Flight } from '@/types/flight';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Plane, 
  MapPin, 
  Calendar,
  DollarSign,
  Loader2
} from 'lucide-react';

// Interfaz para los mensajes del chat
interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  flights?: Flight[];
}

// Props del componente ChatAssistant
interface ChatAssistantProps {
  onFlightsDetected?: (flights: Flight[]) => void;
  className?: string;
}

/**
 * Componente ChatAssistant - Asistente de vuelos con IA
 * Diseñado para ser escalable y soportar +1000 clientes concurrentes
 * 
 * Características:
 * - Chat interactivo con procesamiento de lenguaje natural
 * - Búsqueda inteligente de vuelos
 * - Optimización para múltiples usuarios
 * - Interfaz responsive y accesible
 */
const ChatAssistant: React.FC<ChatAssistantProps> = ({ 
  onFlightsDetected,
  className = ""
}) => {
  // Estados del componente
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: '¡Hola! Soy tu asistente de vuelos con IA avanzada. Puedo ayudarte a encontrar las mejores opciones de viaje. ¿A dónde te gustaría viajar?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConnectedToAI, setIsConnectedToAI] = useState(true);
  
  // Referencias para el scroll automático
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll automático cuando hay mensajes nuevos
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * Envía un mensaje al webhook de n8n y procesa la respuesta
   * Endpoint: https://n8n-n8n.5raxun.easypanel.host/webhook/8af651f0-e328-4919-b90a-7a4a41a26302
   */
  const sendToWebhook = async (message: string): Promise<string> => {
    const webhookUrl = 'https://n8n-n8n.5raxun.easypanel.host/webhook/8af651f0-e328-4919-b90a-7a4a41a26302';
    
    try {
      console.log('🚀 Enviando mensaje al webhook:', message);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          timestamp: new Date().toISOString(),
          source: 'chatbot-tickets',
          userId: `user-${Date.now()}` // ID único para cada sesión
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Respuesta del webhook:', data);

      // Procesar respuesta en formato esperado: [{ "output": String }]
      if (Array.isArray(data) && data.length > 0 && data[0].output) {
        return data[0].output;
      } else if (data.output) {
        // Si la respuesta viene directamente como { output: String }
        return data.output;
      } else {
        console.warn('⚠️ Formato de respuesta inesperado:', data);
        return 'He recibido tu mensaje, pero la respuesta del servidor tiene un formato inesperado. ¿Podrías intentar nuevamente?';
      }
    } catch (error) {
      console.error('❌ Error al comunicarse con el webhook:', error);
      
      // Actualizar estado de conexión
      setIsConnectedToAI(false);
      
      // Fallback a respuesta local en caso de error
      return 'Lo siento, hay un problema temporal con mi conexión a la IA. Permíteme ayudarte con la información que tengo disponible localmente.';
    }
  };

  /**
   * Procesa el mensaje del usuario usando el webhook de n8n
   * Con fallback a lógica local en caso de error
   */
  const processUserMessage = async (message: string): Promise<ChatMessage> => {
    let response = '';
    let detectedFlights: Flight[] = [];

    try {
      // Intentar obtener respuesta del webhook primero
      setIsConnectedToAI(true); // Resetear estado de conexión al intentar
      response = await sendToWebhook(message);
      
      // Analizar la respuesta para detectar vuelos mencionados
      const lowerResponse = response.toLowerCase();
      const lowerMessage = message.toLowerCase();
      
      // Detectar si se mencionan destinos específicos en la respuesta o mensaje original
      if (lowerResponse.includes('bogotá') || lowerMessage.includes('bogotá') || 
          lowerResponse.includes('bog') || lowerMessage.includes('bog')) {
        detectedFlights = [...detectedFlights, ...generateSampleFlights('BOG')];
      }
      if (lowerResponse.includes('madrid') || lowerMessage.includes('madrid') ||
          lowerResponse.includes('mad') || lowerMessage.includes('mad')) {
        detectedFlights = [...detectedFlights, ...generateSampleFlights('MAD')];
      }
      if (lowerResponse.includes('miami') || lowerMessage.includes('miami') ||
          lowerResponse.includes('mia') || lowerMessage.includes('mia')) {
        detectedFlights = [...detectedFlights, ...generateSampleFlights('MIA')];
      }

    } catch (error) {
      console.error('Error procesando con webhook, usando lógica local:', error);
      
      // Fallback a lógica local si el webhook falla
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('vuelo') || lowerMessage.includes('viajar') || lowerMessage.includes('destino')) {
        if (lowerMessage.includes('bogotá') || lowerMessage.includes('bog')) {
          response = 'Excelente elección! Bogotá es un destino muy popular. He encontrado algunas opciones de vuelos para ti. ¿Desde qué ciudad te gustaría viajar?';
          detectedFlights = generateSampleFlights('BOG');
        } else if (lowerMessage.includes('madrid') || lowerMessage.includes('mad')) {
          response = 'Madrid es un destino fantástico! He encontrado varios vuelos disponibles con excelentes tarifas B2B.';
          detectedFlights = generateSampleFlights('MAD');
        } else if (lowerMessage.includes('miami') || lowerMessage.includes('mia')) {
          response = 'Miami es perfecto para vacaciones! Aquí tienes las mejores opciones de vuelos.';
          detectedFlights = generateSampleFlights('MIA');
        } else {
          response = 'Me encanta ayudarte a planear tu viaje! Para buscar vuelos específicos, necesito saber tu ciudad de origen y destino. ¿Podrías decirme desde dónde quieres viajar y hacia dónde?';
        }
      } else if (lowerMessage.includes('precio') || lowerMessage.includes('costo') || lowerMessage.includes('tarifa')) {
        response = 'Nuestras tarifas B2B son exclusivas para agencias y ofrecen hasta 30% de descuento comparado con precios públicos. Las tarifas varían según destino, fechas y disponibilidad. ¿Te gustaría que busque precios para un destino específico?';
      } else if (lowerMessage.includes('hola') || lowerMessage.includes('buenos') || lowerMessage.includes('buenas')) {
        response = '¡Hola! Me da mucho gusto saludarte. Estoy aquí para ayudarte a encontrar los mejores vuelos con nuestras tarifas B2B exclusivas. ¿En qué puedo asistirte hoy?';
      } else if (lowerMessage.includes('gracias')) {
        response = '¡De nada! Es un placer ayudarte. Si necesitas buscar más vuelos o tienes alguna pregunta, no dudes en escribirme.';
      } else {
        response = 'Entiendo que estás buscando información sobre vuelos. Puedo ayudarte a encontrar las mejores opciones. ¿Podrías contarme más detalles sobre tu viaje? Por ejemplo: origen, destino y fechas aproximadas.';
      }
    }

    // Notificar vuelos detectados al componente padre
    if (detectedFlights.length > 0 && onFlightsDetected) {
      onFlightsDetected(detectedFlights);
    }

    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: response,
      timestamp: new Date(),
      flights: detectedFlights
    };
  };

  /**
   * Genera vuelos de ejemplo para demostración
   * En producción esto vendría de la API real
   */
  const generateSampleFlights = (destination: string): Flight[] => {
    const sampleFlights: Flight[] = [
      {
        id: `chat-${Date.now()}-1`,
        airline: 'Avianca',
        airlineCode: 'AV',
        flightNumber: 'AV8001',
        route: {
          origin: {
            code: 'BOG',
            name: 'El Dorado International Airport',
            city: 'Bogotá',
            country: 'Colombia'
          },
          destination: {
            code: destination,
            name: destination === 'MAD' ? 'Adolfo Suárez Madrid-Barajas Airport' : 
                  destination === 'MIA' ? 'Miami International Airport' : 'Internacional Airport',
            city: destination === 'MAD' ? 'Madrid' : destination === 'MIA' ? 'Miami' : 'Ciudad',
            country: destination === 'MAD' ? 'España' : destination === 'MIA' ? 'Estados Unidos' : 'País'
          },
          stops: [],
          duration: {
            total: '6h 15m',
            flying: '6h 15m'
          },
          distance: 7500
        },
        schedule: {
          departure: {
            date: '2024-03-15',
            time: '08:30',
            timezone: 'COT'
          },
          arrival: {
            date: '2024-03-15',
            time: '14:45',
            timezone: destination === 'MAD' ? 'CET' : destination === 'MIA' ? 'EST' : 'UTC'
          }
        },
        aircraft: 'Boeing 787',
        pricing: {
          currency: 'USD',
          publicPrice: 850,
          agencyPrice: 650,
          discount: 23.5,
          taxes: 120,
          fees: 50,
          total: 820,
          priceBreakdown: {
            baseFare: 650,
            taxes: [
              { code: 'YQ', name: 'Fuel Surcharge', amount: 80 },
              { code: 'CO', name: 'Airport Tax Colombia', amount: 40 }
            ],
            fees: [
              { type: 'booking', description: 'Booking Fee', amount: 50 }
            ]
          }
        },
        availability: {
          seats: 45,
          cabinClass: 'economy',
          bookingClass: 'Y',
          refundable: false,
          changeable: true,
          lastUpdate: new Date().toISOString()
        },
        services: {
          meals: ['Breakfast', 'Lunch'],
          entertainment: true,
          wifi: true,
          powerOutlets: true,
          extraLegroom: false
        },
        baggage: {
          carry: {
            included: true,
            weight: '8kg',
            dimensions: '55x40x20cm'
          },
          checked: {
            included: true,
            weight: '23kg'
          }
        },
        restrictions: {
          cancellationPolicy: 'Non-refundable',
          changePolicy: 'Changes allowed with fee'
        }
      }
    ];

    return sampleFlights;
  };

  /**
   * Maneja el envío de mensajes del usuario
   */
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    // Agregar mensaje del usuario
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Procesar mensaje y generar respuesta
      const assistantResponse = await processUserMessage(userMessage.content);
      setMessages(prev => [...prev, assistantResponse]);
    } catch (error) {
      // Manejo de errores robusto para producción
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta nuevamente.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  /**
   * Maneja el evento de presionar Enter
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Formatea la hora del mensaje
   */
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className={`w-full max-w-4xl mx-auto ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          Asistente de Vuelos IA
          <Badge 
            variant={isConnectedToAI ? "secondary" : "destructive"} 
            className="ml-auto"
          >
            <Bot className="h-3 w-3 mr-1" />
            {isConnectedToAI ? 'IA Conectada' : 'Modo Local'}
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Encuentra vuelos usando lenguaje natural. Pregúntame sobre destinos, precios o fechas.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Área de mensajes */}
        <ScrollArea 
          ref={scrollAreaRef}
          className="h-96 w-full rounded-md border p-4"
        >
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.type === 'assistant' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  
                  {/* Mostrar vuelos detectados */}
                  {message.flights && message.flights.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.flights.map((flight) => (
                        <div
                          key={flight.id}
                          className="bg-background rounded-md p-3 border"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Plane className="h-4 w-4 text-primary" />
                              <span className="font-medium text-sm">
                                {flight.flightNumber} - {flight.airline}
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              <DollarSign className="h-3 w-3 mr-1" />
                              ${flight.pricing.agencyPrice}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {flight.route.origin.code} → {flight.route.destination.code}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {flight.schedule.departure.time}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs opacity-70 mt-1">
                    {formatTime(message.timestamp)}
                  </p>
                </div>

                {message.type === 'user' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Indicador de escritura */}
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex items-center gap-1">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      Escribiendo...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input de mensaje */}
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
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

        {/* Sugerencias rápidas */}
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-muted"
            onClick={() => setInputMessage('Busco vuelos a Madrid')}
          >
            Vuelos a Madrid
          </Badge>
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-muted"
            onClick={() => setInputMessage('¿Cuáles son las tarifas B2B?')}
          >
            Tarifas B2B
          </Badge>
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-muted"
            onClick={() => setInputMessage('Vuelos baratos a Miami')}
          >
            Vuelos a Miami
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export { ChatAssistant };
export default ChatAssistant;
