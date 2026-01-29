"use client";

import { useRef, useState } from "react";

const HAPPY_GIF = "/assets/happy-cat-happy-happy-cat.gif";
const ANGRY_GIF = "/assets/catmad-cat-mad.gif";
const HAPPY_SOUND = "/assets/happy%20happy%20happy.mp3";

export default function SamClient() {
  const [answer, setAnswer] = useState<"idle" | "yes" | "no">("idle");
  const [noCount, setNoCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleYes = () => {
    setAnswer("yes");
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      void audio.play();
    }
  };

  const handleNo = () => {
    setAnswer("no");
    setNoCount((count) => count + 1);
  };

  const angrySize = Math.min(240 + noCount * 40, 560);

  return (
    <main className="min-h-screen flex items-center justify-center bg-pink-200 px-6 py-10">
      <div className="w-full max-w-2xl rounded-3xl bg-pink-100/90 p-10 shadow-2xl">
        <div className="text-center">
          <p
            key={noCount}
            className="text-4xl sm:text-5xl font-semibold text-pink-700 drop-shadow-sm"
          >
            Hey Sam, will you be my valentine?
          </p>
          <p className="mt-4 text-lg text-pink-600">
            {answer === "yes"
              ? "Yayyyyyyyyyyy"
              : answer === "no"
              ? ":("
              : "Choose wisely."}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
          <button
            type="button"
            onClick={handleYes}
            className="rounded-full bg-pink-500 px-8 py-4 text-xl font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-pink-600"
          >
            Yes
          </button>
          <button
            type="button"
            onClick={handleNo}
            className="rounded-full bg-white px-8 py-4 text-xl font-semibold text-pink-600 shadow-lg transition hover:scale-105"
          >
            No
          </button>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-6">
          {answer === "yes" && (
            <img
              src={HAPPY_GIF}
              alt="Happy cat celebrating"
              className="h-auto w-[320px] max-w-full rounded-2xl shadow-xl"
            />
          )}
          {answer === "no" && (
            <img
              src={ANGRY_GIF}
              alt="Angry cat"
              style={{ width: angrySize }}
              className="h-auto max-w-full rounded-2xl shadow-xl"
            />
          )}
        </div>

        <audio ref={audioRef} src={HAPPY_SOUND} preload="auto" />
      </div>
    </main>
  );
}
