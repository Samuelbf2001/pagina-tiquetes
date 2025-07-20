import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { X, Download, Send } from "lucide-react";
import { Program } from "@/types/program";

interface QuoteCartProps {
  programs: Program[];
  onRemoveProgram: (programId: string) => void;
  onDownloadPDF: () => void;
  onSendQuote: () => void;
}

export function QuoteCart({ programs, onRemoveProgram, onDownloadPDF, onSendQuote }: QuoteCartProps) {
  const totalUSD = programs.reduce((sum, program) => sum + program.priceUSD, 0);
  
  if (programs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cotización</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No hay programas en tu cotización
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          Cotización
          <Badge variant="secondary">
            {programs.length} programa{programs.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Programs List */}
        <div className="space-y-3">
          {programs.map((program) => (
            <div key={program.id} className="flex items-start justify-between p-3 border rounded-lg">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm leading-tight">{program.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {program.destination}, {program.country}
                </p>
                <p className="text-xs text-muted-foreground">
                  {program.duration} {program.durationUnit === 'weeks' ? 'sem' : 'meses'}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-medium text-primary">
                    ${program.priceUSD.toLocaleString()}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveProgram(program.id)}
                className="h-8 w-8 p-0 ml-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <Separator />

        {/* Total */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium">Subtotal:</span>
            <span className="font-bold text-lg">${totalUSD.toLocaleString()}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            * Precios sujetos a disponibilidad y condiciones especiales
          </p>
        </div>

        <Separator />

        {/* Actions */}
        <div className="space-y-2">
          <Button 
            onClick={onDownloadPDF}
            variant="outline" 
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Descargar PDF
          </Button>
          
          <Button 
            onClick={onSendQuote}
            className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            <Send className="h-4 w-4 mr-2" />
            Enviar Cotización
          </Button>
        </div>

        {/* Contact Info */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          <p>¿Necesitas ayuda?</p>
          <p className="font-medium">contacto@stc.com</p>
          <p>+57 1 234 5678</p>
        </div>
      </CardContent>
    </Card>
  );
}