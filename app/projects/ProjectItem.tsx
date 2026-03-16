import Image from "next/image";
import Link from "next/link";
import { Project } from "./projects";

export default function ProjectItem({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const action = project.action;
  const media = project.media;
  const Icon = project.icon;
  const hasEmbed = action?.type === "iframe" || action?.type === "both";
  const hasLink = action?.type === "link" || action?.type === "both";
  const hasSecondaryLink =
    hasLink && Boolean(action?.secondaryLabel && action?.secondaryHref);
  const hasImage = media?.type === "image";
  const hasMedia = hasEmbed || hasImage;
  const isLeftAligned = index % 2 === 0;
  const detailsColumn = isLeftAligned
    ? "lg:col-start-1 lg:row-start-1"
    : "lg:col-start-2 lg:row-start-1";
  const mediaColumn = isLeftAligned
    ? "lg:col-start-2 lg:row-start-1"
    : "lg:col-start-1 lg:row-start-1";
  const detailsWidth = hasMedia
    ? "lg:max-w-none"
    : isLeftAligned
      ? "lg:justify-self-start lg:max-w-xl"
      : "lg:justify-self-end lg:max-w-xl";

  return (
    <article className="grid gap-6 rounded-2xl border border-white/10 p-6 lg:grid-cols-2 lg:items-start">
      <div className={`${detailsColumn} ${detailsWidth} space-y-4`}>
        <div className="flex items-start gap-4">
          {Icon && (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center text-white/80">
              <Icon className="h-10 w-10" aria-hidden="true" />
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold">{project.title}</h2>
            <p className="text-sm text-white/60">
              {project.role} · {project.date}
            </p>
            <p className="mt-1 text-sm text-white/50">{project.technologies}</p>
          </div>
        </div>

        <p>{project.description}</p>

        {hasLink && action && (
          <div className="mt-2 flex flex-wrap gap-3">
            {action.external ? (
              <a
                href={action.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-white/20 px-4 py-2 text-sm transition hover:bg-white/10"
              >
                {action.label}
              </a>
            ) : (
              <Link
                href={action.href}
                className="rounded-md border border-white/20 px-4 py-2 text-sm transition hover:bg-white/10"
              >
                {action.label}
              </Link>
            )}

            {hasSecondaryLink ? (
              action.secondaryExternal ? (
                <a
                  href={action.secondaryHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border border-white/20 px-4 py-2 text-sm transition hover:bg-white/10"
                >
                  {action.secondaryLabel}
                </a>
              ) : (
                <Link
                  href={action.secondaryHref!}
                  className="rounded-md border border-white/20 px-4 py-2 text-sm transition hover:bg-white/10"
                >
                  {action.secondaryLabel}
                </Link>
              )
            ) : null}
          </div>
        )}
      </div>

      {hasMedia && (
        <div className={`${mediaColumn} lg:w-full`}>
          {hasEmbed && action ? (
            <iframe
              src={action.src}
              height={action.height ?? 300}
              className="w-full rounded-md border border-white/10"
              allowFullScreen
              title={`${project.title} embed`}
            />
          ) : null}

          {hasImage && media ? (
            <div className="overflow-hidden rounded-md border border-white/10">
              <Image
                src={media.src}
                alt={media.alt}
                width={1200}
                height={675}
                className="h-auto w-full object-cover"
              />
            </div>
          ) : null}
        </div>
      )}
    </article>
  );
}
