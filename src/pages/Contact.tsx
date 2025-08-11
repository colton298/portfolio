import { useEffect } from "react";
export default function Contact() {
  useEffect(() => {
      document.title = "Colton Santiago | Contact";
    }, []);
  return (
    <section className="contact">
      <h1>Contact Me</h1>

      <p>
        Email:{" "}
        <a href="mailto:coltonsantiago298@gmail.com">
          coltonsantiago298@gmail.com
        </a>
      </p>

      <p>
        LinkedIn:{" "}
        <a
          href="https://www.linkedin.com/in/coltonsantiago298/"
          target="_blank"
          rel="noreferrer"
        >
          linkedin.com/in/coltonsantiago298/
        </a>
      </p>
    </section>
  );
}
