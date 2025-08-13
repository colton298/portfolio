import headshot from "../assets/IMG_0650.jpeg";
import { Helmet } from "react-helmet-async";

export default function Home() {
  return (
    <div style={{ textAlign: "center", maxWidth: "800px" }}>
      <Helmet>
        <title>Colton Santiago | Home</title>
        <meta
          name="description"
          content="Portfolio of Colton Santiago, a UCF CS student."
        />
        <meta property="og:title" content="Colton Santiago | Home" />
        <meta
          property="og:description"
          content="Portfolio of Colton Santiago—projects, resume, and contact information."
        />
      </Helmet>

      <img
        src={headshot}
        alt="My headshot"
        style={{
          width: "200px",
          height: "200px",
          display: "block",
          margin: "0 auto 1rem auto",
          objectFit: "cover",
          marginBottom: "1rem"
        }}
      />
      <h2>About Me</h2>
      <p>I am a senior undergrad computer science student at UCF. I love programming and finding simple ways to solve complex problems. </p>
      <p>At UCF, I was a part of the EXCEL program, which allowed me to access exclusive education systems and volunteer work. From EXCEL, I found multiple volunteer oppurtunities, including STEM Day, where I helped new students discover the STEM facilities at UCF. </p>
      <p>I have a passion for helping other discover the magic of computer science and programming, which led me to hold a fundraiser for the Codecraft Foundation in 2022 for my senior project.</p>
      <p>I've developed my programming skills through my high school and college education, which led me to achieve an 80% on the August 2024 UCF Computer Science Foundation Exam, where the average was a 51%.</p>
    </div>
  );
}
