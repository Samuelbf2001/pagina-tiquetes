import { useState } from "react";

import { Header } from "@/components/Header";
import { ProgramCard } from "@/components/ProgramCard";
import { ProgramFilters } from "@/components/ProgramFilters";
import { QuoteCart } from "@/components/QuoteCart";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { mockPrograms } from "@/data/mockPrograms";
import type { Program } from "@/types/program";

const Programs = () => {
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>(mockPrograms);
  const [cartPrograms, setCartPrograms] = useState<Program[]>([]);
  const [resetFiltersAction, setResetFiltersAction] = useState<(() => void) | null>(null);
  const { toast } = useToast();

  const handleAddToQuote = (program: Program) => {
    if (cartPrograms.find((cartProgram) => cartProgram.id === program.id)) {
      toast({
        title: "Programa ya agregado",
        description: "Este programa ya esta dentro de tu cotizacion.",
        variant: "destructive",
      });
      return;
    }

    setCartPrograms((currentPrograms) => [...currentPrograms, program]);
    toast({
      title: "Programa agregado",
      description: `${program.name} fue agregado a tu cotizacion.`,
    });
  };

  const handleRemoveFromQuote = (programId: string) => {
    setCartPrograms((currentPrograms) =>
      currentPrograms.filter((program) => program.id !== programId)
    );
    toast({
      title: "Programa removido",
      description: "El programa fue removido de tu cotizacion.",
    });
  };

  const handleSendQuote = () => {
    if (cartPrograms.length === 0) {
      toast({
        title: "Sin programas",
        description: "Agrega al menos un programa antes de enviar la cotizacion.",
        variant: "destructive",
      });
      return;
    }

    const total = cartPrograms.reduce((sum, program) => sum + program.priceUSD, 0);
    const subject = `Solicitud de cotizacion - ${cartPrograms.length} programa${
      cartPrograms.length !== 1 ? "s" : ""
    }`;
    const body = [
      "Hola equipo Student Travel Center,",
      "",
      "Quiero solicitar una cotizacion para los siguientes programas:",
      "",
      ...cartPrograms.map(
        (program, index) =>
          `${index + 1}. ${program.name} - ${program.destination}, ${program.country} - USD ${program.priceUSD.toLocaleString()}`
      ),
      "",
      `Total estimado: USD ${total.toLocaleString()}`,
      "",
      "Quedo atento(a) a su respuesta.",
    ].join("\n");

    window.location.href = `mailto:contacto@studenttravelcenter.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    toast({
      title: "Abriendo correo",
      description: "Se preparo un borrador con el resumen de tu cotizacion.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemsCount={cartPrograms.length} />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Programas internacionales</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Descubre oportunidades de estudio, practicas y voluntariados en destinos
            internacionales con informacion clara y cotizacion inmediata.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <ProgramFilters
              programs={mockPrograms}
              onFiltersChange={setFilteredPrograms}
              onResetReady={(resetAction) => setResetFiltersAction(() => resetAction)}
            />

            {filteredPrograms.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {filteredPrograms.map((program) => (
                  <ProgramCard
                    key={program.id}
                    program={program}
                    onAddToQuote={handleAddToQuote}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-10 text-center">
                <p className="mb-3 text-lg font-medium">
                  No encontramos programas con los filtros actuales.
                </p>
                <p className="mb-6 text-muted-foreground">
                  Ajusta el destino, el tipo de programa o el rango de precio para ver mas
                  opciones.
                </p>
                <Button onClick={() => resetFiltersAction?.()}>Limpiar filtros</Button>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <QuoteCart
              programs={cartPrograms}
              onRemoveProgram={handleRemoveFromQuote}
              onSendQuote={handleSendQuote}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Programs;
