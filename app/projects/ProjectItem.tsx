import Link from "next/link";
import { Project } from "./projects";

export default function ProjectItem({ project }: { project: Project }) {
  return (
    <article className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">{project.title}</h2>
        <p className="text-sm text-white/60">
          {project.role} · {project.date}
        </p>
        <p className="text-sm text-white/50">
          {project.technologies}
        </p>
      </div>

      <p>{project.description}</p>

      {/* Action */}
      {project.action?.type === "iframe" && (
        <iframe
          src={project.action.src}
          height={project.action.height ?? 300}
          className="w-full rounded-md border border-white/10"
          allowFullScreen
          title={`${project.title} embed`}
        />
      )}

      {project.action?.type === "link" && (
        <div>
          {project.action.external ? (
            <a
              href={project.action.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 rounded-md border border-white/20 px-4 py-2 text-sm hover:bg-white/10 transition"
            >
              {project.action.label}
            </a>
          ) : (
            <Link
              href={project.action.href}
              className="inline-block mt-2 rounded-md border border-white/20 px-4 py-2 text-sm hover:bg-white/10 transition"
            >
              {project.action.label}
            </Link>
          )}
        </div>
      )}
    </article>
  );
}
