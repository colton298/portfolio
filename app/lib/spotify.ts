type SpotifyImage = {
  url: string;
};

type SpotifyArtist = {
  name: string;
};

type SpotifyAlbum = {
  images?: SpotifyImage[];
};

type SpotifyTrack = {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  external_urls?: {
    spotify?: string;
  };
};

type SpotifyTopTracksResponse = {
  items?: SpotifyTrack[];
};

export type RecentlyPlayedSong = {
  id: string;
  name: string;
  artistNames: string[];
  albumArtUrl: string | null;
  spotifyUrl: string | null;
};

export type RecentlyPlayedSongsResult = {
  songs: RecentlyPlayedSong[];
  status: "ok" | "missing_config" | "api_error";
};

function getSpotifyBasicAuthHeader(clientId: string, clientSecret: string) {
  return Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
}

async function getSpotifyAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return { accessToken: null, status: "missing_config" as const };
  }

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${getSpotifyBasicAuthHeader(clientId, clientSecret)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return { accessToken: null, status: "api_error" as const };
    }

    const data = (await response.json()) as { access_token?: string };

    if (!data.access_token) {
      return { accessToken: null, status: "api_error" as const };
    }

    return { accessToken: data.access_token, status: "ok" as const };
  } catch {
    return { accessToken: null, status: "api_error" as const };
  }
}

export async function getRecentlyPlayedSongs(limit = 3): Promise<RecentlyPlayedSongsResult> {
  const tokenResult = await getSpotifyAccessToken();

  if (tokenResult.status !== "ok" || !tokenResult.accessToken) {
    return { songs: [], status: tokenResult.status };
  }

  const params = new URLSearchParams({
    time_range: "short_term",
    limit: String(limit),
  });

  try {
    const response = await fetch(`https://api.spotify.com/v1/me/top/tracks?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${tokenResult.accessToken}`,
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return { songs: [], status: "api_error" };
    }

    const data = (await response.json()) as SpotifyTopTracksResponse;
    const songs = (data.items ?? []).slice(0, limit);

    return {
      songs: songs.map((song) => ({
        id: song.id,
        name: song.name,
        artistNames: song.artists.map((artist) => artist.name).filter(Boolean),
        albumArtUrl: song.album.images?.[0]?.url ?? null,
        spotifyUrl: song.external_urls?.spotify ?? null,
      })),
      status: "ok",
    };
  } catch {
    return { songs: [], status: "api_error" };
  }
}
