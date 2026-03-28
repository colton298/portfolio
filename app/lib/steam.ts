type SteamOwnedGame = {
  appid: number;
  name: string;
  img_icon_url?: string;
  rtime_last_played?: number;
};

type SteamOwnedGamesResponse = {
  response?: {
    game_count?: number;
    games?: SteamOwnedGame[];
  };
};

export type RecentlyPlayedGame = {
  appId: number;
  name: string;
  iconUrl: string | null;
  lastPlayedUnix: number;
};

export type RecentlyPlayedGamesResult = {
  games: RecentlyPlayedGame[];
  status: "ok" | "no_recent_games" | "missing_config" | "invalid_steam_id" | "api_error";
};

function getSteamIconUrl(appId: number, iconHash?: string) {
  if (!iconHash) {
    return null;
  }

  return `https://media.steampowered.com/steamcommunity/public/images/apps/${appId}/${iconHash}.jpg`;
}

function resolveSteamId64(steamId: string) {
  const trimmedId = steamId.trim();

  if (/^\d{17}$/.test(trimmedId)) {
    return trimmedId;
  }

  const steam2Match = trimmedId.match(/^STEAM_\d:([0-1]):(\d+)$/i);
  if (steam2Match) {
    const universeOffset = 76561197960265728n;
    const accountParity = BigInt(steam2Match[1]);
    const accountNumber = BigInt(steam2Match[2]);

    return (universeOffset + accountNumber * 2n + accountParity).toString();
  }

  const steam3Match = trimmedId.match(/^\[U:1:(\d+)\]$/i);
  if (steam3Match) {
    const universeOffset = 76561197960265728n;
    const accountId = BigInt(steam3Match[1]);

    return (universeOffset + accountId).toString();
  }

  return null;
}

export async function getRecentlyPlayedGames(limit = 3): Promise<RecentlyPlayedGamesResult> {
  const apiKey = process.env.STEAM_API_KEY;
  const steamId = process.env.STEAM_ID;

  if (!apiKey || !steamId) {
    return { games: [], status: "missing_config" };
  }

  const steamId64 = resolveSteamId64(steamId);
  if (!steamId64) {
    return { games: [], status: "invalid_steam_id" };
  }

  const params = new URLSearchParams({
    key: apiKey,
    steamid: steamId64,
    format: "json",
    include_appinfo: "true",
    include_played_free_games: "true",
  });

  try {
    const response = await fetch(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?${params.toString()}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      return { games: [], status: "api_error" };
    }

    const data = (await response.json()) as SteamOwnedGamesResponse;
    const games = data.response?.games ?? [];
    const recentlyPlayedGames = games
      .filter((game) => (game.rtime_last_played ?? 0) > 0 && game.name)
      .sort((a, b) => (b.rtime_last_played ?? 0) - (a.rtime_last_played ?? 0))
      .slice(0, limit);

    if (recentlyPlayedGames.length === 0) {
      return { games: [], status: "no_recent_games" };
    }

    return {
      games: recentlyPlayedGames.map((game) => ({
        appId: game.appid,
        name: game.name,
        iconUrl: getSteamIconUrl(game.appid, game.img_icon_url),
        lastPlayedUnix: game.rtime_last_played ?? 0,
      })),
      status: "ok",
    };
  } catch {
    return { games: [], status: "api_error" };
  }
}
