import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ACTIVITY_PATH = path.join(process.cwd(), "public", "activity.json");
const ACTIVITY_LIMIT = 3;

async function loadLocalEnv() {
  const envPath = path.join(process.cwd(), ".env.local");

  try {
    const envFile = await readFile(envPath, "utf8");

    for (const line of envFile.split(/\r?\n/)) {
      const trimmedLine = line.trim();

      if (!trimmedLine || trimmedLine.startsWith("#")) {
        continue;
      }

      const equalsIndex = trimmedLine.indexOf("=");

      if (equalsIndex === -1) {
        continue;
      }

      const key = trimmedLine.slice(0, equalsIndex).trim();
      const rawValue = trimmedLine.slice(equalsIndex + 1).trim();
      const value = rawValue.replace(/^['"]|['"]$/g, "");

      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch (error) {
    if (error?.code !== "ENOENT") {
      console.error("Could not read .env.local.", error);
    }
  }
}

function getSpotifyBasicAuthHeader(clientId, clientSecret) {
  return Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
}

function resolveSteamId64(steamId) {
  const trimmedId = steamId.trim();

  if (/^\d{17}$/.test(trimmedId)) {
    return trimmedId;
  }

  const steam2Match = trimmedId.match(/^STEAM_\d:([0-1]):(\d+)$/i);
  if (steam2Match) {
    const universeOffset = BigInt("76561197960265728");
    const accountParity = BigInt(steam2Match[1]);
    const accountNumber = BigInt(steam2Match[2]);

    return (universeOffset + accountNumber * BigInt(2) + accountParity).toString();
  }

  const steam3Match = trimmedId.match(/^\[U:1:(\d+)\]$/i);
  if (steam3Match) {
    const universeOffset = BigInt("76561197960265728");
    const accountId = BigInt(steam3Match[1]);

    return (universeOffset + accountId).toString();
  }

  return null;
}

async function getSpotifySongs(limit) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return { status: "missing_config", songs: [] };
  }

  try {
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${getSpotifyBasicAuthHeader(clientId, clientSecret)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!tokenResponse.ok) {
      console.error(`Spotify token refresh failed: ${tokenResponse.status}`);
      return { status: "api_error", songs: [] };
    }

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return { status: "api_error", songs: [] };
    }

    const params = new URLSearchParams({
      time_range: "short_term",
      limit: String(limit),
    });
    const tracksResponse = await fetch(
      `https://api.spotify.com/v1/me/top/tracks?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    if (!tracksResponse.ok) {
      console.error(`Spotify top tracks request failed: ${tracksResponse.status}`);
      return { status: "api_error", songs: [] };
    }

    const tracksData = await tracksResponse.json();
    const songs = (tracksData.items ?? []).slice(0, limit).map((track) => {
      const artists = (track.artists ?? [])
        .map((artist) => artist.name)
        .filter(Boolean)
        .join(", ");

      return artists ? `${track.name} - ${artists}` : track.name;
    });

    return { status: "ok", songs };
  } catch (error) {
    console.error("Spotify activity generation failed.", error);
    return { status: "api_error", songs: [] };
  }
}

async function getSteamGames(limit) {
  const apiKey = process.env.STEAM_API_KEY;
  const steamId = process.env.STEAM_ID;

  if (!apiKey || !steamId) {
    return { status: "missing_config", games: [] };
  }

  const steamId64 = resolveSteamId64(steamId);

  if (!steamId64) {
    return { status: "invalid_steam_id", games: [] };
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
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?${params.toString()}`
    );

    if (!response.ok) {
      console.error(`Steam request failed: ${response.status}`);
      return { status: "api_error", games: [] };
    }

    const data = await response.json();
    const games = (data.response?.games ?? [])
      .filter((game) => (game.rtime_last_played ?? 0) > 0 && game.name)
      .sort((a, b) => (b.rtime_last_played ?? 0) - (a.rtime_last_played ?? 0))
      .slice(0, limit)
      .map((game) => game.name);

    return {
      status: games.length > 0 ? "ok" : "no_recent_games",
      games,
    };
  } catch (error) {
    console.error("Steam activity generation failed.", error);
    return { status: "api_error", games: [] };
  }
}

async function main() {
  await loadLocalEnv();

  const [steam, spotify] = await Promise.all([
    getSteamGames(ACTIVITY_LIMIT),
    getSpotifySongs(ACTIVITY_LIMIT),
  ]);

  const activity = {
    updatedAt: new Date().toISOString(),
    steam,
    spotify,
  };

  await mkdir(path.dirname(ACTIVITY_PATH), { recursive: true });
  await writeFile(ACTIVITY_PATH, `${JSON.stringify(activity, null, 2)}\n`);

  console.log(`Wrote ${ACTIVITY_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
