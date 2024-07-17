"use client";
import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { TextPlugin } from "gsap/TextPlugin";
import Card from "./Card";
import { RiSendPlane2Fill } from "react-icons/ri";
import { useGlobal } from "../app/Context";

gsap.registerPlugin(TextPlugin);
gsap.registerPlugin(useGSAP);

function Form() {
  const placeholderRef = useRef(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [inputValue, setInputValue] = useState("");
  const { accessToken } = useGlobal()!;
  const [albums, setAlbums] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(true);
  const [canSubmit, setCanSubmit] = useState(false);

  const [tempAlbum, setTempAlbum] = useState("");
  const [tempArtist, setTempArtist] = useState("");

  const { guessCount, setGuessCount } = useGlobal()!;
  const { setSelectedArtist } = useGlobal()!;
  const { setSelectedAlbum } = useGlobal()!;

  const { isCorrect } = useGlobal()!;

  async function search(value: string) {
    if (value === "") {
      return;
    }
    var searchOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    };
    const encodedValue = encodeURIComponent(value);
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodedValue}&type=album&limit=15`,
      searchOptions
    );
    const data = await response.json();
    const albums = data.albums.items;

    const filterAlbums = albums.filter(
      (album: any) => album.album_type === "album"
    );

    const uniqueAlbums = filterAlbums.filter(
      (album: any, index: any, self: any) =>
        index === self.findIndex((t: any) => t.name === album.name)
    );

    setAlbums(uniqueAlbums);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isCorrect) {
      return;
    }
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowResults(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      search(newValue);
    }, 250);
  };

  useEffect(() => {
    if (guessCount === null || guessCount === -1) {
      setCanSubmit(true);
    }
    if (isCorrect || guessCount === 5) {
      setCanSubmit(false);
      console.log("cannot submit");
    }
  }, [isCorrect, guessCount]);

  useGSAP(() => {
    if (placeholderRef.current && inputValue === "") {
      gsap.set(placeholderRef.current, {
        text: "enter an album title",
      });
    }
  }, [placeholderRef.current]);

  const handleFocus = () => {
    if (placeholderRef.current) {
      gsap.to(placeholderRef.current, {
        duration: 0.5,
        text: "",
        ease: "steps(20)",
      });
      gsap.to(divRef.current, {
        backgroundColor: "rgb(64,64,64)",
        duration: 0.1,
      });
    }
  };

  const handleUnfocus = () => {
    gsap.to(placeholderRef.current, {
      text: "enter an album title",
      duration: 0.5,
      ease: "steps(20)",
    });
    gsap.to(divRef.current, {
      backgroundColor: "rgb(38,38,38)",
      duration: 0.1,
    });

    inputRef.current?.blur();
  };

  useEffect(() => {
    if (isCorrect) {
      setCanSubmit(false);
    }
  });

  return (
    <>
      <div
        className="w-full font-apple bg-neutral-800 rounded-lg relative items-center"
        ref={divRef}
      >
        <form
          className="my-3 flex items-center drop-shadow-md z-10"
          onFocus={handleFocus}
          onBlur={() => {
            if (inputValue.trim() === "") {
              handleUnfocus();
            }
          }}
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit && inputValue === tempAlbum) {
              setInputValue("");
              handleUnfocus();
              setGuessCount(guessCount! + 1);
              setSelectedAlbum(tempAlbum);
              setSelectedArtist(tempArtist);
              setCanSubmit(false);
            }
          }}
          ref={formRef}
        >
          <input
            type="text"
            className="p-3 bg-transparent w-full fill-white text-white placeholder-opacity-50 bg-none placeholder-white outline-none tracking-tighter shadow-none "
            value={inputValue}
            onChange={handleInputChange}
            ref={inputRef}
            disabled={!canSubmit}
          />

          <p
            className="px-2 absolute pointer-events-none text-white text-opacity-50 tracking-tighter bg-none rounded-md text-sm"
            ref={placeholderRef}
          ></p>
          <button className="p-2 flex justify-center items-center">
            <RiSendPlane2Fill className="fill-white size-7 hover:opacity-75 opacity-50 duration-150 hover:size-8" />
          </button>
        </form>
        <div className="absolute w-full h-auto overflow-y-auto top-full bg-[#1a1a1a] z-20 rounded-lg max-h-48 scrollbar scrollbar-thumb-neutral-800 scrollbar-thumb-rounded-full hover:scrollbar-thumb-neutral-700 scrollbar-w-3 pr-1 pb-3">
          {inputValue &&
            showResults &&
            albums.map((album, i, key) => {
              return (
                <Card
                  key={i}
                  albumName={album.name}
                  artistName={
                    album.artists && album.artists.length > 0
                      ? album.artists
                          .map((artist: any) => artist.name)
                          .join(", ")
                      : undefined
                  }
                  onClick={() => {
                    setInputValue(album.name);
                    setShowResults(false);
                    setTempAlbum(album.name);
                    setTempArtist(
                      album.artists && album.artists.length > 0
                        ? album.artists
                            .map((artist: any) => artist.name)
                            .join(", ")
                        : undefined
                    );
                    setCanSubmit(true);
                  }}
                />
              );
            })}
        </div>
      </div>
    </>
  );
}

export default Form;
