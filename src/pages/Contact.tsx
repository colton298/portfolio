import { Helmet } from "react-helmet-async";

export default function Contact() {
  return (
    <section className="contact">
      <Helmet>
        <title>Colton Santiago | Contact</title>
        <meta
          name="description"
          content="Contact Colton Santiago via email or LinkedIn."
        />
        <meta property="og:title" content="Colton Santiago | Contact" />
        <meta property="og:description" content="Email and LinkedIn for Colton Santiago." />
      </Helmet>

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
