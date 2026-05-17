import ExperienceList from "./ExperienceList";
import { experienceItems } from "./experience-items";

export const metadata = {
  title: "Colton Santiago - Experience",
};

export default function Experience() {
  return (
    <main className="min-h-screen px-4 pt-14">
      <section className="mx-auto w-full max-w-5xl space-y-8 pb-12">
        <div className="space-y-3 text-center">
          <h1 className="text-3xl font-semibold">Experience</h1>
          <p className="mx-auto max-w-2xl text-sm leading-6 text-white/65">
            My experience in software development, as a timeline. Use the search bar to find specific projects, classes, and more. 
          </p>
        </div>

        <ExperienceList items={experienceItems} />
      </section>
    </main>
  );
}
