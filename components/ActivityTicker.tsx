import { MESSAGE_OF_THE_DAY } from "@/app/lib/site-config";
import { getRecentlyPlayedSongs } from "@/app/lib/spotify";
import { getRecentlyPlayedGames } from "@/app/lib/steam";

function buildTickerItems(games: string[], songs: string[], messageOfTheDay?: string) {
  const items: string[] = [];

  if (games.length > 0) {
    items.push(`STEAM RECENT: ${games.join(", ")}`);
  } else {
    items.push("STEAM RECENT UNAVAILABLE");
  }

  if (songs.length > 0) {
    items.push(`SPOTIFY TOP TRACKS: ${songs.join(", ")}`);
  } else {
    items.push("SPOTIFY TOP TRACKS UNAVAILABLE");
  }

  if (messageOfTheDay?.trim()) {
    items.push(`MOTD: ${messageOfTheDay.trim()}`);
  }

  return items;
}

export default async function ActivityTicker() {
  const [recentGamesResult, recentSongsResult] = await Promise.all([
    getRecentlyPlayedGames(3),
    getRecentlyPlayedSongs(3),
  ]);

  const recentGames = recentGamesResult.games.map((game) => game.name);
  const recentSongs = recentSongsResult.songs.map(
    (song) => `${song.name} - ${song.artistNames.join(", ")}`
  );
  const tickerItems = buildTickerItems(
    recentGames,
    recentSongs,
    MESSAGE_OF_THE_DAY
  );
  const repeatedItems = [...tickerItems, ...tickerItems];

  return (
    <div className="ticker-shell border-b border-white/10 bg-black/40">
      <div className="ticker-track">
        <div className="ticker-content" aria-label="Recent Steam and Spotify activity">
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
