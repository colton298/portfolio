// app/projects/wordle/page.tsx
import WordleClient from "./WordleClient";

export const metadata = {
  title: "Colton Santiago - Wordle Solver",
};

export default function WordlePage() {
  return (
    <main className="min-h-screen flex justify-center pt-20 px-4">
      <div className="w-full max-w-2xl">
        <WordleClient />
      </div>
    </main>
  );
}
