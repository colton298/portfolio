import Link from "next/link";
import { Project } from "./projects";

export default function ProjectItem({ project }: { project: Project }) {
  const action = project.action;
  const Icon = project.icon;

  return (
    <article className="grid gap-4 sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:gap-6">
      <div className="hidden sm:flex sm:items-start sm:justify-center">
        {Icon && (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center text-white/80">
            <Icon className="h-10 w-10" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-4 sm:block">
          {Icon && (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center text-white/80 sm:hidden">
              <Icon className="h-10 w-10" aria-hidden="true" />
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold">{project.title}</h2>
            <p className="text-sm text-white/60">
              {project.role} · {project.date}
            </p>
            <p className="mt-1 text-sm text-white/50">
              {project.technologies}
            </p>
          </div>
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
      </div>
    </article>
  );
}
