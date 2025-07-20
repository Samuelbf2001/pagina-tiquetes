import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ProgramCard } from "@/components/ProgramCard";
import { ProgramFilters } from "@/components/ProgramFilters";
import { QuoteCart } from "@/components/QuoteCart";
import { mockPrograms } from "@/data/mockPrograms";
import { Program } from "@/types/program";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>(mockPrograms);
  const [cartPrograms, setCartPrograms] = useState<Program[]>([]);
  const { toast } = useToast();

  const handleAddToQuote = (program: Program) => {
    if (cartPrograms.find(p => p.id === program.id)) {
      toast({
        title: "Programa ya agregado",
        description: "Este programa ya está en tu cotización.",
        variant: "destructive",
      });
      return;
    }

    setCartPrograms([...cartPrograms, program]);
    toast({
      title: "Programa agregado",
      description: `${program.name} se agregó a tu cotización.`,
    });
  };

  const handleRemoveFromQuote = (programId: string) => {
    setCartPrograms(cartPrograms.filter(p => p.id !== programId));
    toast({
      title: "Programa removido",
      description: "El programa se removió de tu cotización.",
    });
  };

  const handleDownloadPDF = () => {
    toast({
      title: "Generando PDF",
      description: "Tu cotización se está preparando para descarga.",
    });
    // TODO: Implement PDF generation
  };

  const handleSendQuote = () => {
    toast({
      title: "Cotización enviada",
      description: "Tu cotización ha sido enviada exitosamente.",
    });
    // TODO: Implement quote sending
  };

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemsCount={cartPrograms.length} />
      
      <Hero />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Programas Internacionales</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre oportunidades únicas de estudio, prácticas y voluntariados en destinos alrededor del mundo
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <ProgramFilters 
              programs={mockPrograms}
              onFiltersChange={setFilteredPrograms}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPrograms.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  onAddToQuote={handleAddToQuote}
                />
              ))}
            </div>

            {filteredPrograms.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  No se encontraron programas que coincidan con tus filtros
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <QuoteCart
              programs={cartPrograms}
              onRemoveProgram={handleRemoveFromQuote}
              onDownloadPDF={handleDownloadPDF}
              onSendQuote={handleSendQuote}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
