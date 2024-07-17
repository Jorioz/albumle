"use client";
import GuessCard from "./GuessCard";
import React, { useState, useEffect } from "react";
import { useGlobal } from "../app/Context";
type Props = {
  index?: number;
};

type CardInfo = {
  albumText: string;
  artistText: string;
};

function GuessCardArray({ index }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { guessCount } = useGlobal()!;
  const { selectedArtist } = useGlobal()!;
  const { selectedAlbum } = useGlobal()!;
  const { copyResult, setCopyResult } = useGlobal()!;
  const { todayAlbum } = useGlobal()!;
  const [hasRetrieved, setHasRetrieved] = useState<boolean>(false);

  const [cardInfos, setCardInfos] = useState<CardInfo[]>(
    Array.from({ length: 6 }).map(() => ({ albumText: "", artistText: "" }))
  );

  // Retrieve, only happens once on load
  useEffect(() => {
    if (guessCount === null) return;
    if (todayAlbum === null) return;
    if (hasRetrieved) return;
    const savedInfo = window.localStorage.getItem("cardInfos");
    if (savedInfo) {
      const parsedInfo = JSON.parse(savedInfo);
      setCardInfos(parsedInfo);
      fillCopyResult(parsedInfo);
    }
    setHasRetrieved(true);
  }, [guessCount, todayAlbum]);

  // Save data:
  useEffect(() => {
    if (guessCount === null) return;

    const updateInfo = [...cardInfos];
    updateInfo[guessCount] = {
      albumText: selectedAlbum,
      artistText: selectedArtist,
    };
    fillCopyResult(updateInfo);
    setCardInfos(updateInfo);
    window.localStorage.setItem("cardInfos", JSON.stringify(updateInfo));
  }, [selectedAlbum, selectedArtist]);

  function fillCopyResult(data: CardInfo[]) {
    setCopyResult("");
    data.forEach((card, index) => {
      const isEmpty = card.albumText === "" || card.artistText === "";
      const isArtistMatch =
        card.artistText === todayAlbum?.artistName &&
        card.albumText !== todayAlbum?.albumName;
      const isAlbumMatch =
        card.albumText === todayAlbum?.albumName &&
        card.artistText == todayAlbum?.artistName;
      const isWrong =
        card.albumText !== todayAlbum?.albumName &&
        card.artistText !== todayAlbum?.artistName;

      if (isEmpty) {
        setCopyResult((prev) => prev + "⬛");
      } else if (isAlbumMatch) {
        setCopyResult((prev) => prev + "🟩");
      } else if (isArtistMatch) {
        setCopyResult((prev) => prev + "🟨");
      } else if (isWrong) {
        setCopyResult((prev) => prev + "🟥");
      }
    });
  }

  return (
    <div
      className={`h-full w-full flex justify-between items-center transition-all duration-500 overflow-x-hidden  ${
        hoveredIndex !== null ? "gap-1" : "gap-2"
      } `}
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <GuessCard
          key={index}
          className={`${index === hoveredIndex ? "flex-[10]" : "flex-1"} `}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => setHoveredIndex(index)}
          onBlur={() => setHoveredIndex(null)}
          index={index}
          albumText={cardInfos[index].albumText}
          artistText={cardInfos[index].artistText}
          isUnlocked={index <= (guessCount ?? 0)}
        />
      ))}
    </div>
  );
}

export default GuessCardArray;
