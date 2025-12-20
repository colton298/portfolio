"use client";

import { useState } from "react";
import UploadButton from "./components/UploadButton";
import dynamic from "next/dynamic";

const PDFViewer = dynamic(
  () => import("./components/PDFViewer"),
  { ssr: false }
);
import PDFList from "./components/PDFList";
import { PDFFile } from "./types";
import styles from "./styles.module.css";

export default function PDFReaderPage() {
  const [pdfs, setPdfs] = useState<PDFFile[]>([]);
  const [activePdf, setActivePdf] = useState<PDFFile | null>(null);

  return (
    <div className={styles.container}>
  <div className={styles.header}>
    <h1>PDF Reader</h1>
    <p className={styles.subtitle}>
      Upload and read PDFs. (Auth & cloud sync coming soon.)
    </p>
  </div>

  <div className={styles.content}>
    <aside className={styles.sidebar}>
      <UploadButton
        onUpload={(pdf) => {
          setPdfs((prev) => [...prev, pdf]);
          setActivePdf(pdf);
        }}
      />

      <PDFList
        pdfs={pdfs}
        onSelect={setActivePdf}
        activeId={activePdf?.id}
      />
    </aside>

    <div className={styles.viewer}>
      {activePdf ? (
        <PDFViewer url={URL.createObjectURL(activePdf.file)} />
      ) : (
        <p style={{ padding: "1rem", color: "#888" }}>
          Select a PDF to view
        </p>
      )}
    </div>
  </div>
</div>

  );
}
