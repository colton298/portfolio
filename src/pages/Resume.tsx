import { useEffect } from "react";
export default function Resume() {
  useEffect(() => {
      document.title = "Colton Santiago | Resume";
    }, []);
  const pdfUrl = `${import.meta.env.BASE_URL}Resume.pdf`;

  return (
    <>
      <iframe
        className="resume-iframe"
        src={pdfUrl}
        title="Resume PDF"
      />
      <div className="resume-actions">
        <a href={pdfUrl} download>Download PDF</a>
        <a href={pdfUrl} target="_blank" rel="noreferrer">Open in new tab</a>
      </div>
    </>
  );
}
