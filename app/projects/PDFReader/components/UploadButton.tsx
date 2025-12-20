"use client";

import { useRef } from "react";
import { PDFFile } from "../types";

export default function UploadButton({
  onUpload,
}: {
  onUpload: (pdf: PDFFile) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        onClick={() => inputRef.current?.click()}
        className="
        inline-flex
        items-center
        justify-center
        rounded-md
        border border-white/20
        px-4 py-2
        text-sm
        hover:bg-white/10
        transition"

      >
        Upload PDF
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          onUpload({
            id: crypto.randomUUID(),
            name: file.name,
            file,
          });

          e.target.value = "";
        }}
      />
    </>
  );
}
