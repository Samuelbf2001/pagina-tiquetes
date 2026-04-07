import jsPDF from "jspdf";
import "jspdf-autotable";

import type { Program } from "@/types/program";

const PRIMARY_COLOR: [number, number, number] = [79, 70, 229];
const SECONDARY_COLOR: [number, number, number] = [107, 114, 128];
const LIGHT_ROW_COLOR: [number, number, number] = [248, 250, 252];
const FOOTER_HEIGHT = 25;
const CONTENT_BOTTOM_MARGIN = 40;

const addCoverHeader = (doc: jsPDF, pageWidth: number) => {
  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("STUDENT TRAVEL CENTER", 20, 25);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Plataforma B2B para agencias educativas", 20, 35);
};

const addFooter = (
  doc: jsPDF,
  pageWidth: number,
  pageHeight: number,
  currentPage: number,
  totalPages: number
) => {
  const footerY = pageHeight - FOOTER_HEIGHT;

  doc.setFillColor(240, 240, 240);
  doc.rect(0, footerY, pageWidth, FOOTER_HEIGHT, "F");

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Contacto:", 20, footerY + 8);
  doc.setFont("helvetica", "normal");
  doc.text("contacto@studenttravelcenter.com", 42, footerY + 8);
  doc.text("+57 1 234 5678", 20, footerY + 15);
  doc.text("www.studenttravelcenter.com", 70, footerY + 15);
  doc.text(`Pagina ${currentPage} de ${totalPages}`, pageWidth - 45, footerY + 15);
};

const addDetailPageHeader = (doc: jsPDF, pageWidth: number) => {
  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(0, 0, pageWidth, 24, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("DETALLE DE PROGRAMAS", 20, 16);
  doc.setTextColor(0, 0, 0);
};

const getProgramTypeLabel = (type: Program["type"]) => {
  switch (type) {
    case "language":
      return "Idiomas";
    case "internship":
      return "Practicas";
    case "volunteer":
      return "Voluntariado";
    case "aupair":
      return "AuPair";
    default:
      return "Programa";
  }
};

const writeWrappedValue = (
  doc: jsPDF,
  label: string,
  value: string,
  y: number,
  pageWidth: number
) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(label, 20, y);

  doc.setFont("helvetica", "normal");
  const wrappedLines = doc.splitTextToSize(value, pageWidth - 70);
  doc.text(wrappedLines, 55, y);

  return y + wrappedLines.length * 5 + 2;
};

const ensureSpace = (
  doc: jsPDF,
  currentY: number,
  requiredHeight: number,
  pageWidth: number,
  pageHeight: number
) => {
  if (currentY + requiredHeight <= pageHeight - CONTENT_BOTTOM_MARGIN) {
    return currentY;
  }

  doc.addPage();
  addDetailPageHeader(doc, pageWidth);
  return 34;
};

export const usePDFGenerator = () => {
  const generateQuotePDF = (programs: Program[]) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const quoteDate = new Date().toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const quoteNumber = `STC-${Date.now().toString().slice(-6)}`;
    const subtotal = programs.reduce((sum, program) => sum + program.priceUSD, 0);

    addCoverHeader(doc, pageWidth);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("COTIZACION DE PROGRAMAS", 20, 60);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha: ${quoteDate}`, 20, 75);
    doc.text(`Cotizacion No: ${quoteNumber}`, 20, 84);
    doc.text(`Programas incluidos: ${programs.length}`, 20, 93);

    const tableData = programs.map((program, index) => [
      index + 1,
      program.name,
      `${program.destination}, ${program.country}`,
      `${program.duration} ${program.durationUnit === "weeks" ? "sem" : "meses"}`,
      `${program.hoursPerWeek}h/sem`,
      getProgramTypeLabel(program.type),
      `$${program.priceUSD.toLocaleString()}`,
    ]);

    doc.autoTable({
      head: [["#", "Programa", "Destino", "Duracion", "Horas", "Tipo", "Precio USD"]],
      body: tableData,
      startY: 105,
      headStyles: {
        fillColor: [...PRIMARY_COLOR],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 4,
      },
      alternateRowStyles: {
        fillColor: [...LIGHT_ROW_COLOR],
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 45 },
        2: { cellWidth: 38 },
        3: { cellWidth: 20, halign: "center" },
        4: { cellWidth: 18, halign: "center" },
        5: { cellWidth: 24, halign: "center" },
        6: { cellWidth: 25, halign: "right" },
      },
      margin: { left: 20, right: 20, bottom: CONTENT_BOTTOM_MARGIN },
    });

    const summaryY =
      (doc.lastAutoTable?.finalY ?? 105) > pageHeight - 75
        ? (() => {
            doc.addPage();
            return 30;
          })()
        : (doc.lastAutoTable?.finalY ?? 105) + 18;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("RESUMEN DE COSTOS", pageWidth - 82, summaryY);

    doc.setFont("helvetica", "normal");
    doc.text(`Subtotal: $${subtotal.toLocaleString()}`, pageWidth - 82, summaryY + 12);

    doc.setFillColor(...PRIMARY_COLOR);
    doc.rect(pageWidth - 87, summaryY + 18, 62, 14, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL: $${subtotal.toLocaleString()}`, pageWidth - 82, summaryY + 27);

    doc.setTextColor(...SECONDARY_COLOR);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("* Precios sujetos a disponibilidad y condiciones especiales.", 20, summaryY + 48);
    doc.text("* La cotizacion tiene validez de 30 dias.", 20, summaryY + 56);
    doc.text("* No incluye visa, seguro medico ni gastos personales.", 20, summaryY + 64);

    if (programs.length > 0) {
      doc.addPage();
      addDetailPageHeader(doc, pageWidth);

      let currentY = 34;

      programs.forEach((program, index) => {
        const descriptionLines = doc.splitTextToSize(program.description, pageWidth - 70);
        const requirementsText = program.requirements.join(" | ");
        const highlightsText = program.highlights.join(" | ");
        const startDatesText = program.startDates
          .map((date) =>
            new Date(`${date}T12:00:00`).toLocaleDateString("es-CO", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          )
          .join(", ");
        const schoolLines = program.school
          ? doc.splitTextToSize(
              `${program.school.name} | Rating ${program.school.rating}/5 | ${program.school.accreditation.join(", ")}`,
              pageWidth - 70
            )
          : [];
        const estimatedHeight =
          70 +
          descriptionLines.length * 5 +
          (requirementsText ? 8 : 0) +
          (highlightsText ? 8 : 0) +
          (startDatesText ? 8 : 0) +
          schoolLines.length * 5;

        currentY = ensureSpace(doc, currentY, estimatedHeight, pageWidth, pageHeight);

        doc.setTextColor(...PRIMARY_COLOR);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.text(`${index + 1}. ${program.name}`, 20, currentY);
        currentY += 8;

        doc.setTextColor(0, 0, 0);
        currentY = writeWrappedValue(doc, "Destino:", `${program.destination}, ${program.country}`, currentY, pageWidth);
        currentY = writeWrappedValue(
          doc,
          "Duracion:",
          `${program.duration} ${program.durationUnit === "weeks" ? "semanas" : "meses"} | ${program.hoursPerWeek} horas por semana`,
          currentY,
          pageWidth
        );
        currentY = writeWrappedValue(doc, "Tipo:", getProgramTypeLabel(program.type), currentY, pageWidth);
        currentY = writeWrappedValue(
          doc,
          "Nivel:",
          program.level === "all"
            ? "Todos los niveles"
            : program.level === "beginner"
              ? "Principiante"
              : program.level === "intermediate"
                ? "Intermedio"
                : "Avanzado",
          currentY,
          pageWidth
        );
        currentY = writeWrappedValue(
          doc,
          "Visa:",
          program.visaRequired ? "Requerida" : "No requerida",
          currentY,
          pageWidth
        );
        currentY = writeWrappedValue(
          doc,
          "Edad:",
          `${program.ageRange.min} - ${program.ageRange.max} anos`,
          currentY,
          pageWidth
        );

        if (program.availableSpots) {
          currentY = writeWrappedValue(
            doc,
            "Cupos:",
            `${program.availableSpots} disponibles`,
            currentY,
            pageWidth
          );
        }

        doc.setFont("helvetica", "bold");
        doc.text("Descripcion:", 20, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(descriptionLines, 55, currentY);
        currentY += descriptionLines.length * 5 + 4;

        if (requirementsText) {
          currentY = writeWrappedValue(doc, "Requisitos:", requirementsText, currentY, pageWidth);
        }

        if (highlightsText) {
          currentY = writeWrappedValue(doc, "Destacados:", highlightsText, currentY, pageWidth);
        }

        if (startDatesText) {
          currentY = writeWrappedValue(doc, "Fechas:", startDatesText, currentY, pageWidth);
        }

        if (program.school) {
          currentY = writeWrappedValue(
            doc,
            "Institucion:",
            `${program.school.name} | Rating ${program.school.rating}/5 | ${program.school.accreditation.join(", ")}`,
            currentY,
            pageWidth
          );
        }

        doc.setFillColor(...LIGHT_ROW_COLOR);
        doc.rect(20, currentY, pageWidth - 40, 12, "F");
        doc.setTextColor(...PRIMARY_COLOR);
        doc.setFont("helvetica", "bold");
        doc.text(
          `Precio: USD $${program.priceUSD.toLocaleString()} | ${program.priceLocal.toLocaleString()} ${program.localCurrency}`,
          24,
          currentY + 8
        );

        currentY += 18;
        doc.setDrawColor(200, 200, 200);
        doc.line(20, currentY, pageWidth - 20, currentY);
        currentY += 10;
      });
    }

    const totalPages = doc.getNumberOfPages();
    for (let page = 1; page <= totalPages; page += 1) {
      doc.setPage(page);
      addFooter(doc, pageWidth, pageHeight, page, totalPages);
    }

    doc.save(`Cotizacion_STC_${quoteNumber}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return { generateQuotePDF };
};
