"use client";

import { MESSAGE_OF_THE_DAY } from "@/app/lib/site-config";
import { useEffect, useMemo, useState } from "react";

type ActivityPayload = {
  steam?: {
    games?: string[];
  };
  spotify?: {
    songs?: string[];
  };
};

function buildTickerItems(
  messageOfTheDay?: string,
  activity?: ActivityPayload | null
) {
  const items: string[] = [];

  const games = activity?.steam?.games ?? [];
  const songs = activity?.spotify?.songs ?? [];

  if (games.length > 0) {
    items.push(`RECENTLY PLAYED ON STEAM: ${games.join(", ")}`);
  }

  if (songs.length > 0) {
    items.push(`RECENTLY PLAYED ON SPOTIFY: ${songs.join(", ")}`);
  }

  if (messageOfTheDay?.trim()) {
    items.push(`MOTD: ${messageOfTheDay.trim()}`);
  }


  return items;
}

export default function ActivityTicker() {
  const [activity, setActivity] = useState<ActivityPayload | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadActivity() {
      try {
        const response = await fetch(`/activity.json?ts=${Date.now()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        setActivity((await response.json()) as ActivityPayload);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Activity ticker request failed.", error);
        }
      }
    }

    loadActivity();
    const intervalId = window.setInterval(loadActivity, 15 * 60 * 1000);

    return () => {
      window.clearInterval(intervalId);
      controller.abort();
    };
  }, []);

  const tickerItems = useMemo(
    () => buildTickerItems(MESSAGE_OF_THE_DAY, activity),
    [activity]
  );
  const repeatedItems = [...tickerItems, ...tickerItems];

  return (
    <div className="ticker-shell border-b border-white/10 bg-black/40">
      <div className="ticker-track">
        <div className="ticker-content" aria-label="Site activity">
          {repeatedItems.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="ticker-item"
              aria-hidden={index >= tickerItems.length}
            >
              <span>{item}</span>
              <span className="ticker-separator"> &lt;&gt;&nbsp; </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
