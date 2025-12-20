"use client";

export default function PDFViewer({ url }: { url: string }) {
  return (
    <iframe
      src={url}
      width="100%"
      height="800px"
      style={{ border: "none" }}
      title="PDF Viewer"
    />
  );
}
