import Image from "next/image";

export const metadata = 
{
  title: "Colton Santiago",
};

export default function Home() 
{
  return (
    <main className="min-h-screen flex justify-center items-center px-4">
      <section className="max-w-2xl text-center space-y-4">

        <div className = "flex justify-center">
          <Image 
            src="/assets/headshot.jpeg"
            alt="Colton Santiago headshot"
            width = {200}
            height = {200}
            />
        </div>
        
        <h2 className="text-3xl font-semibold">About Me</h2>

        <p>
          I am a senior undergrad computer science student at UCF. I love programming and finding simple ways to solve complex problems.
        </p>

        <p>
          I have a passion for helping others discover the magic of computer science and programming, which led me to hold a fundraiser for the Codecraft Foundation in 2022 for my senior project.
        </p>

        <p>
          I've developed my programming skills through my high school and college education, achieving an 80% on the August 2024 UCF Computer Science Foundation Exam (average was 51%).
        </p>

        <p>
          I have taken part in several class projects in developer and leadership roles, gaining a full view of project development.
        </p>

        <p>
          View my other pages through the navigation bar above to see my projects, resume, and more.
        </p>
      </section>
    </main>
  );
}
