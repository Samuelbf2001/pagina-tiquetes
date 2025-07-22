import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Program } from '@/types/program';

// Extender el tipo jsPDF para incluir autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const usePDFGenerator = () => {
  const generateQuotePDF = (programs: Program[]) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Colores corporativos
    const primaryColor = [79, 70, 229]; // Indigo
    const secondaryColor = [107, 114, 128]; // Gray
    
    // Header de la empresa
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Logo/Título empresa
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('STUDENT TRAVEL CENTER', 20, 25);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Plataforma B2B para Agencias Educativas', 20, 35);
    
    // Información de la cotización
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('COTIZACIÓN DE PROGRAMAS', 20, 60);
    
    // Fecha y número de cotización
    const currentDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const quoteNumber = `STC-${Date.now().toString().slice(-6)}`;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${currentDate}`, 20, 75);
    doc.text(`Cotización No: ${quoteNumber}`, 20, 85);
    doc.text(`Total de programas: ${programs.length}`, 20, 95);
    
    // Preparar datos para la tabla
    const tableData = programs.map((program, index) => [
      index + 1,
      program.name,
      `${program.destination}, ${program.country}`,
      `${program.duration} ${program.durationUnit === 'weeks' ? 'sem.' : 'meses'}`,
      `${program.hoursPerWeek}h/sem`,
      program.type === 'language' ? 'Idiomas' :
      program.type === 'university' ? 'Universidad' :
      program.type === 'internship' ? 'Prácticas' :
      program.type === 'volunteer' ? 'Voluntariado' : 'Profesional',
      `$${program.priceUSD.toLocaleString()}`
    ]);
    
    // Configurar la tabla
    doc.autoTable({
      head: [['#', 'Programa', 'Destino', 'Duración', 'Horas', 'Tipo', 'Precio USD']],
      body: tableData,
      startY: 110,
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 5
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 45 },
        2: { cellWidth: 35 },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 18, halign: 'center' },
        5: { cellWidth: 25, halign: 'center' },
        6: { cellWidth: 25, halign: 'right' }
      },
      margin: { left: 20, right: 20 }
    });
    
    // Calcular totales
    const subtotal = programs.reduce((sum, program) => sum + program.priceUSD, 0);
    
    // Posición después de la tabla
    const finalY = (doc as any).lastAutoTable.finalY || 110;
    
    // Resumen de costos
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN DE COSTOS', pageWidth - 80, finalY + 20);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Subtotal: $${subtotal.toLocaleString()}`, pageWidth - 80, finalY + 35);
    
    // Total destacado
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(pageWidth - 85, finalY + 40, 60, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL: $${subtotal.toLocaleString()}`, pageWidth - 80, finalY + 51);
    
    // Términos y condiciones
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('* Precios sujetos a disponibilidad y condiciones especiales', 20, finalY + 80);
    doc.text('* Esta cotización tiene validez de 30 días', 20, finalY + 88);
    doc.text('* No incluye gastos de visa, seguro médico ni gastos personales', 20, finalY + 96);
    
    // Información de contacto en el footer
    const footerY = doc.internal.pageSize.height - 30;
    doc.setFillColor(240, 240, 240);
    doc.rect(0, footerY - 5, pageWidth, 25, 'F');
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Contacto:', 20, footerY + 5);
    doc.setFont('helvetica', 'normal');
    doc.text('Email: contacto@studenttravelcenter.com | Teléfono: +57 1 234 5678', 20, footerY + 12);
    doc.text('www.studenttravelcenter.com', 20, footerY + 19);
    
    // Agregar página con detalles de programas si hay espacio o crear nueva página
    if (programs.length > 0) {
      doc.addPage();
      
      // Header de la segunda página
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, pageWidth, 30, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('DETALLES DE PROGRAMAS SELECCIONADOS', 20, 20);
      
      let yPosition = 50;
      
      programs.forEach((program, index) => {
        // Verificar si necesitamos una nueva página
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 30;
        }
        
        // Título del programa
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${program.name}`, 20, yPosition);
        yPosition += 10;
        
        // Información básica
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        doc.text(`📍 Destino: ${program.destination}, ${program.country}`, 25, yPosition);
        yPosition += 6;
        
        doc.text(`⏱️ Duración: ${program.duration} ${program.durationUnit === 'weeks' ? 'semanas' : 'meses'} (${program.hoursPerWeek} horas/semana)`, 25, yPosition);
        yPosition += 6;
        
        doc.text(`🎯 Nivel: ${program.level === 'all' ? 'Todos los niveles' : program.level === 'beginner' ? 'Principiante' : program.level === 'intermediate' ? 'Intermedio' : 'Avanzado'}`, 25, yPosition);
        yPosition += 6;
        
        doc.text(`🛂 Visa: ${program.visaRequired ? 'Requerida' : 'No requerida'}`, 25, yPosition);
        yPosition += 6;
        
        doc.text(`👥 Edad: ${program.ageRange.min} - ${program.ageRange.max} años`, 25, yPosition);
        yPosition += 6;
        
        if (program.availableSpots) {
          doc.text(`🎫 Cupos disponibles: ${program.availableSpots}`, 25, yPosition);
          yPosition += 6;
        }
        
        // Descripción
        doc.setFont('helvetica', 'bold');
        doc.text('Descripción:', 25, yPosition);
        yPosition += 5;
        
        doc.setFont('helvetica', 'normal');
        const descriptionLines = doc.splitTextToSize(program.description, 150);
        doc.text(descriptionLines, 25, yPosition);
        yPosition += descriptionLines.length * 5;
        
        // Requisitos
        if (program.requirements && program.requirements.length > 0) {
          yPosition += 3;
          doc.setFont('helvetica', 'bold');
          doc.text('Requisitos:', 25, yPosition);
          yPosition += 5;
          
          doc.setFont('helvetica', 'normal');
          program.requirements.forEach(req => {
            doc.text(`• ${req}`, 30, yPosition);
            yPosition += 5;
          });
        }
        
        // Aspectos destacados
        if (program.highlights && program.highlights.length > 0) {
          yPosition += 3;
          doc.setFont('helvetica', 'bold');
          doc.text('Aspectos destacados:', 25, yPosition);
          yPosition += 5;
          
          doc.setFont('helvetica', 'normal');
          program.highlights.forEach(highlight => {
            doc.text(`✓ ${highlight}`, 30, yPosition);
            yPosition += 5;
          });
        }
        
        // Fechas de inicio
        if (program.startDates && program.startDates.length > 0) {
          yPosition += 3;
          doc.setFont('helvetica', 'bold');
          doc.text('Fechas de inicio disponibles:', 25, yPosition);
          yPosition += 5;
          
          doc.setFont('helvetica', 'normal');
          const formattedDates = program.startDates.map(date => 
            new Date(date).toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })
          ).join(', ');
          
          const dateLines = doc.splitTextToSize(formattedDates, 150);
          doc.text(dateLines, 30, yPosition);
          yPosition += dateLines.length * 5;
        }
        
        // Información de la escuela
        if (program.school) {
          yPosition += 3;
          doc.setFont('helvetica', 'bold');
          doc.text('Institución:', 25, yPosition);
          yPosition += 5;
          
          doc.setFont('helvetica', 'normal');
          doc.text(`🏫 ${program.school.name}`, 30, yPosition);
          yPosition += 5;
          
          if (program.school.rating) {
            doc.text(`⭐ Rating: ${program.school.rating}/5.0`, 30, yPosition);
            yPosition += 5;
          }
          
          if (program.school.accreditation && program.school.accreditation.length > 0) {
            doc.text(`🏆 Acreditaciones: ${program.school.accreditation.join(', ')}`, 30, yPosition);
            yPosition += 5;
          }
        }
        
        // Precios
        yPosition += 5;
        doc.setFillColor(248, 250, 252);
        doc.rect(20, yPosition - 3, 150, 15, 'F');
        
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(`💰 Precio: $${program.priceUSD.toLocaleString()} USD`, 25, yPosition + 5);
        
        if (program.priceLocal && program.localCurrency) {
          doc.text(`(${program.priceLocal.toLocaleString()} ${program.localCurrency})`, 120, yPosition + 5);
        }
        
        yPosition += 25;
        
        // Línea separadora
        doc.setDrawColor(200, 200, 200);
        doc.line(20, yPosition, pageWidth - 20, yPosition);
        yPosition += 10;
      });
    }
    
    // Guardar el PDF
    doc.save(`Cotizacion_STC_${quoteNumber}_${new Date().toISOString().split('T')[0]}.pdf`);
  };
  
  return { generateQuotePDF };
}; 