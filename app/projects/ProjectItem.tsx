import Link from "next/link";
import { Project } from "./projects";

export default function ProjectItem({ project }: { project: Project }) {
  const action = project.action;

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
      {action && (action.type === "iframe" || action.type === "both") && (
        <iframe
          src={action.src}
          height={action.height ?? 300}
          className="w-full rounded-md border border-white/10"
          allowFullScreen
          title={`${project.title} embed`}
        />
      )}

      {action && (action.type === "link" || action.type === "both") && (
        <div>
          {action.external ? (
            <a
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 rounded-md border border-white/20 px-4 py-2 text-sm hover:bg-white/10 transition"
            >
              {action.label}
            </a>
          ) : (
            <Link
              href={action.href}
              className="inline-block mt-2 rounded-md border border-white/20 px-4 py-2 text-sm hover:bg-white/10 transition"
            >
              {action.label}
            </Link>
          )}
        </div>
      )}
    </article>
  );
}
