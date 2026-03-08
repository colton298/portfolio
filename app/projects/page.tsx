//Import projects data from projects.ts, styling from ProjectItem.tsx
import { projects } from "./projects";
import ProjectItem from "./ProjectItem";

export const metadata = {
  title: "Projects | Colton Santiago",
};

export default function Projects() {
  return (
    <main className="min-h-screen flex justify-center px-4 pt-20">
      <section className="w-full max-w-6xl space-y-12 pb-12">
        <h1 className="text-3xl font-semibold text-center">Projects</h1>

        {projects.map((project, index) => (
          <ProjectItem key={project.title} project={project} index={index} />
        ))}
      </section>
    </main>
  );
}
