import React from "react";

function HelpMenu() {
  return (
    <>
      <div className="text-white font-mono font-extralight w-full h-fit">
        <div className="w-full bg-neutral-800 p-2 rounded-md mb-3">
          {/* Title */}
          <h1 className="text-2xl font-bold opacity-80 text-center">
            This is albumle.
          </h1>
          {/* Description */}
          <p className="text-md opacity-80 text-center">
            The album cover guessing game.
          </p>
          <p className="text-md opacity-80 text-center">🟥🟨🟩</p>
          <div className="py-4 text-sm">
            <p>
              You will be presented with an album cover that is pixelated. It's
              your goal to try and guess the title of it.
            </p>
            <br />
            <p className="text-center">
              <a className="text-red-400">Red</a> = Incorrect
              <br />
              <a className="text-yellow-400">Yellow</a> = Correct Artist
              <br />
              <a className="text-green-400">Green</a> = Nice. You got it!
            </p>
            <br />
            <p>
              Use the search bar to type in an artist or album. Then select a
              title and lock in your guess.
            </p>
            <br />
            <p>
              Each guess will lower the pixelation of the album cover slightly.
              Still stuck? Use some hints. These also unlock alongside each
              guess.
            </p>
            <br />
            <p className="text-center">
              1 album, 6 tries, <a className="underline">get it right.</a>
            </p>
            <p className="text-center text-xs opacity-50">
              refreshes daily, 12am EST
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default HelpMenu;
