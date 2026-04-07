import "jspdf";

type HorizontalAlign = "left" | "center" | "right";
type AutoTableCell = string | number;
type AutoTableRow = AutoTableCell[];

interface AutoTableColumnStyle {
  cellWidth?: number;
  halign?: HorizontalAlign;
}

interface AutoTableStyles {
  fillColor?: number[];
  textColor?: number[];
  fontSize?: number;
  fontStyle?: "normal" | "bold" | "italic" | "bolditalic";
  cellPadding?: number;
}

interface AutoTableOptions {
  head?: AutoTableRow[];
  body?: AutoTableRow[];
  startY?: number;
  headStyles?: AutoTableStyles;
  bodyStyles?: AutoTableStyles;
  alternateRowStyles?: AutoTableStyles;
  columnStyles?: Record<number, AutoTableColumnStyle>;
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF;
    lastAutoTable?: {
      finalY: number;
    };
  }
}
