import Image from "next/image";
import { getRecentlyPlayedGames } from "./lib/steam";

export const metadata = 
{
  title: "Colton Santiago",
};

export default async function Home() 
{
  const recentGamesResult = await getRecentlyPlayedGames(3);
  const recentGames = recentGamesResult.games;
  const fallbackMessage =
    recentGamesResult.status === "no_recent_games"
      ? "No played games were found on this Steam account."
      : recentGamesResult.status === "invalid_steam_id"
        ? "Your Steam ID format is invalid. Use a numeric steamid64 or a valid Steam ID value."
        : "Steam activity is unavailable right now. This card will populate when the site can read your public Steam library during build or deploy.";

  return (
    <main className="min-h-screen flex justify-center items-center px-4">
      <section className="max-w-2xl text-center space-y-4">

        <div className = "flex justify-center">
          <Image 
            src="/assets/headshot.jpeg"
            alt="Colton Santiago headshot"
            width = {200}
            height = {200}
            />
        </div>
        
        <h2 className="text-3xl font-semibold">About Me</h2>

        <p>
          I am a senior undergrad computer science student at UCF. I love programming and finding simple ways to solve complex problems.
        </p>

        <p>
          I have a passion for helping others discover the magic of computer science and programming, which led me to hold a fundraiser for the Codecraft Foundation in 2022 for my senior project.
        </p>

        <p>
          I&apos;ve developed my programming skills through my high school and college education, achieving an 80% on the August 2024 UCF Computer Science Foundation Exam (average was 51%).
        </p>

        <p>
          I have taken part in several class projects in developer and leadership roles, gaining a full view of project development.
        </p>

        <p>
          View my other pages through the navigation bar above to see my projects, resume, and more.
        </p>

        <section className="pt-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left shadow-lg shadow-black/10">
            <div className="mb-4">
              <h3 className="text-2xl font-semibold">Recently Played</h3>
              <p className="text-sm text-white/70">
                Last 3 games played on my Steam account.
              </p>
            </div>

            {recentGames.length > 0 ? (
              <div className="space-y-3">
                {recentGames.map((game) => (
                  <article
                    key={game.appId}
                    className="flex items-center gap-4 rounded-xl border border-white/10 bg-black/20 p-3"
                  >
                    {game.iconUrl ? (
                      <img
                        src={game.iconUrl}
                        alt={`${game.name} icon`}
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-lg border border-white/10 bg-white/5 object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs text-white/60">
                        No Art
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-lg font-medium">{game.name}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/70">{fallbackMessage}</p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
