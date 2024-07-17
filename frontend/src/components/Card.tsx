import React from "react";

type Props = {
  albumName?: string;
  artistName?: string;
  onClick?: () => void;
};

function Card({ albumName, artistName, onClick }: Props) {
  return (
    <>
      <div
        className="bg-neutral-700 rounded-lg my-1 hover:bg-neutral-600 p-2 transition-all duration-250 z-0"
        onClick={onClick}
      >
        <div className="text-white font-apple tracking-tighter text-opacity-85 whitespace-nowrap text-pretty overflow-hidden">
          {albumName}
        </div>
        <div className="text-white font-apple text-sm tracking-tighter text-opacity-35">
          {artistName}
        </div>
      </div>
    </>
  );
}

export default Card;
