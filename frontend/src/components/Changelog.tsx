import React from "react";

export default function Changelog() {
  return (
    <div className="text-white font-mono font-extralight w-full h-fit">
      <div className="w-full bg-neutral-800 p-2 rounded-md mb-3">
        {/* Title */}
        <h1 className="text-2xl font-bold opacity-80">v2 release</h1>
        {/* Description */}
        <p className="text-md opacity-80">better for your eyes.</p>
        {/* Date */}
        <p className="text-sm opacity-80">2024-07-17</p>
        {/* All content below */}
        <div className="py-4 text-sm">
          <p>
            8 months after initial release, albumle gets its first major update!
            This update is a complete overhaul of the original version, with
            improved UI, UX, and a new backend. Here's the details:
          </p>
          <br />
          <ul className="list-outside list-disc mx-4 ">
            <li className="pb-1">
              <a className="font-extrabold text-yellow-100">Improved Design</a>{" "}
              - Returning players will have noticed!
            </li>
            <li className="pb-1">
              <a className="font-extrabold text-cyan-200">
                Rewritten with React
              </a>{" "}
              - Original was written in vanilla JS. This version is much more
              maintainable
            </li>
            <li className="pb-1">
              <a className="font-extrabold text-orange-300">
                Improved album searching{" "}
              </a>{" "}
              - Results are directly from Spotify, rather than from a single
              playlists' data.
            </li>
            <li className="pb-1">
              {" "}
              <a className="font-extrabold text-pink-200">Hints!</a> - To help
              you go from totally clueless to slightly less clueless. New hints
              unlock every guess.
            </li>
            <li className="pb-1">
              {" "}
              <a className="font-extrabold text-green-300">
                Improved Backend{" "}
              </a>{" "}
              - As previously mentioned, will also no longer only get its data
              from a{" "}
              <a
                className="underline cursor-pointer font-bold"
                href="https://open.spotify.com/playlist/3C6tEVHjMFbciywaS2YR12?si=094ca8dde7ab4a34"
                target="_blank"
              >
                single playlist
              </a>{" "}
              (past me wrote some amazing code).
            </li>
          </ul>
          <br />
          <p>
            This update was mainly supposed to be silent with only a backend
            change, however, I went all out and decided to also port the
            frontend to React.
          </p>
          <br />
          <p>
            The original version will still be available at{" "}
            <a
              className="underline font-bold cursor-pointer"
              href="https://old.albumle.app"
            >
              old.albumle.app
            </a>{" "}
            if you're a masochist.
          </p>
          <br />
          <p>
            Thats all for now. {""}
            <a className="font-bold">endless mode up next.</a>
          </p>
        </div>
      </div>

      <div className="w-full bg-neutral-800 p-2 rounded-md mb-3">
        {/* Title */}
        <h1 className="text-2xl font-bold opacity-80">albumle is out!</h1>
        {/* Description */}
        <p className="text-md opacity-80">
          "where were you when the twitter bio finally updated?"
        </p>
        {/* Date */}
        <p className="text-sm opacity-80">2023-12-09</p>
        {/* All content below */}
        <div className="py-4 text-sm">
          <p>
            Can you try and guess the album cover in 6 tries or less? Each
            attempt reduces the pixelation, making it slightly easier on each
            guess. Inspired by Wordle, come back everyday to play again to a new
            album.
          </p>
          <br />
          <p>
            ...Is this original description for this game. This changelog didn't
            exist at the time of release, so it's present me here about to talk
            about some nonsense from the past:
          </p>
          <br />
          <p>
            The idea of albumle goes back to probably late 2021/early 2022.
            Can't exactly remember, but it was when all those alt. Wordle games
            started popping up. I never really coded seriously back then, so I
            thought creating a web game would be a fun way to learn more.
          </p>
          <br />
          <p>
            I could keep typing about stuff but for now we'll leave it at that.
            Whether you've been playing since v1, or a new player,{" "}
            <a className="font-bold">thank you.</a>{" "}
            <a
              className="font-bold underline"
              href="https://twitter.com/albumle"
              target="_none"
            >
              Twitter
            </a>{" "}
            if you'd like to talk or got feedback.
          </p>
          <br />
          <p className="opacity-50">
            shoutout to the small group of people who witnessed development. you
            know who you are 💖
          </p>
        </div>
      </div>
    </div>
  );
}
