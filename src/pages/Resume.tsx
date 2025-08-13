import { Helmet } from "react-helmet-async";

export default function Resume() {
  const pdfUrl = `${import.meta.env.BASE_URL}Resume.pdf`;

  return (
    <>
      <Helmet>
        <title>Colton Santiago | Resume</title>
        <meta
          name="description"
          content="View or download Colton Santiago’s resume."
        />
        <meta property="og:title" content="Colton Santiago | Resume" />
        <meta property="og:description" content="View or download Colton Santiago’s resume." />
      </Helmet>

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
