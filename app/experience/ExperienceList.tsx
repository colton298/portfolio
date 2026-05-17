"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useMemo, useState } from "react";
import { IconSearch, IconExternalLink } from "@tabler/icons-react";
import type { ExperienceItem } from "./experience-items";

export default function ExperienceList({ items }: { items: ExperienceItem[] }) {
  const [query, setQuery] = useState("");
  const hasCredlyBadge = items.some((item) => item.media?.type === "credly");

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) => {
      const searchableText = [
        item.title,
        item.completed,
        item.description,
        item.tags.join(" "),
        item.media?.type === "link" ? item.media.label : "",
        item.media?.type === "iframe" ? item.media.title : "",
        item.media?.type === "credly" ? item.media.title : "",
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [items, query]);

  return (
    <div className="space-y-6">
      {hasCredlyBadge ? (
        <Script
          src="https://cdn.credly.com/assets/utilities/embed.js"
          strategy="lazyOnload"
        />
      ) : null}

      <label className="relative block">
        <span className="sr-only">Search experience cards</span>
        <IconSearch
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/45"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by title, description, or tag"
          className="h-14 w-full rounded-full border border-white/14 bg-[#1d1b20] px-12 text-base outline-none transition placeholder:text-white/40 focus:border-white/35 focus:bg-[#242229]"
        />
      </label>

      <p className="text-sm text-white/55" aria-live="polite">
        Showing {filteredItems.length} of {items.length} cards
      </p>

      <div className="space-y-4">
        {filteredItems.map((item) => (
          <ExperienceCard key={item.title} item={item} />
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <div className="rounded-lg border border-white/12 bg-[#1d1b20] px-6 py-10 text-center text-white/60">
          No cards match your search.
        </div>
      ) : null}
    </div>
  );
}

function ExperienceCard({ item }: { item: ExperienceItem }) {
  const media = item.media;
  const hasSlideEmbed = media?.type === "iframe";

  return (
    <article
      className={`grid w-full min-w-0 gap-5 overflow-hidden rounded-lg border border-white/12 bg-[#1d1b20] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.24)] transition hover:border-white/24 hover:bg-[#242229] md:p-6 ${
        hasSlideEmbed
          ? "md:grid-cols-[minmax(0,1fr)_minmax(20rem,34rem)]"
          : "md:grid-cols-[minmax(0,1fr)_auto]"
      }`}
    >
      <div className="min-w-0 space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold leading-tight">{item.title}</h2>
          <p className="text-sm font-semibold text-white/50">
            {item.completed}
          </p>
          <p className="max-w-3xl text-sm leading-6 text-white/70">
            {item.description}
          </p>
        </div>

        <ul className="flex flex-wrap gap-2" aria-label={`${item.title} tags`}>
          {item.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full bg-[#36343b] px-3 py-1 text-xs font-semibold text-white/78"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>

      {media ? (
        <div
          className={
            media.type === "iframe"
              ? "w-full min-w-0 justify-self-end"
              : media.type === "credly"
                ? "w-full min-w-0 md:w-56"
                : "w-full min-w-0 md:w-56"
          }
        >
          {media.type === "image" ? (
            <div className="relative aspect-video overflow-hidden rounded-lg border border-white/10 bg-black/20">
              <Image
                src={media.src}
                alt={media.alt}
                fill
                sizes="(min-width: 768px) 224px, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}

          {media.type === "iframe" ? (
            <div className="slides-embed-frame rounded-lg border border-white/10 bg-black/20">
              <iframe
                src={media.src}
                className="h-full w-full"
                allowFullScreen
                loading="lazy"
                title={media.title}
              />
            </div>
          ) : null}

          {media.type === "link" ? (
            <MediaLink media={media} />
          ) : null}

          {media.type === "credly" ? (
            <div className="credly-badge-shell rounded-lg border border-white/10 bg-black/20">
              <div
                className="credly-badge-scale"
                title={media.title}
              >
                <div
                  data-iframe-width={media.width ?? 400}
                  data-iframe-height={media.height ?? 275}
                  data-share-badge-id={media.shareBadgeId}
                  data-share-badge-host={media.host}
                />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function MediaLink({
  media,
}: {
  media: Extract<ExperienceItem["media"], { type: "link" }>;
}) {
  const className =
    "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/18 px-4 text-sm font-semibold transition hover:bg-white/10";

  if (media.external) {
    return (
      <a
        href={media.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {media.label}
        <IconExternalLink className="h-4 w-4" aria-hidden="true" />
      </a>
    );
  }

  return (
    <Link href={media.href} className={className}>
      {media.label}
    </Link>
  );
}
