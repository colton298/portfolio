"use client";

import { PDFFile } from "../types";

export default function PDFList({
  pdfs,
  onSelect,
  activeId,
}: {
  pdfs: PDFFile[];
  onSelect: (pdf: PDFFile) => void;
  activeId?: string;
}) {
  return (
    <aside>
      <h3>Your PDFs</h3>
      <ul>
        {pdfs.map((pdf) => (
          <li key={pdf.id}>
            <button
              onClick={() => onSelect(pdf)}
              style={{
                fontWeight: pdf.id === activeId ? "bold" : "normal",
              }}
            >
              {pdf.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
