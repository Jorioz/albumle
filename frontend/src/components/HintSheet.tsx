import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useGlobal } from "../app/Context";
import { AiFillLock } from "react-icons/ai";

gsap.registerPlugin(useGSAP);

type Props = {
  isClicked: boolean;
  setIsClicked: (value: boolean) => void;
};

function HintSheet({ isClicked, setIsClicked }: Props) {
  const menuRef = useRef(null);
  const { todayAlbum } = useGlobal()!;
  const { accessToken } = useGlobal()!;
  const { guessCount } = useGlobal()!;
  const { isCorrect } = useGlobal()!;
  const [artistImg, setArtistImg] = useState("");
  const [genre, setGenre] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [artistName, setArtistName] = useState("");
  const [trackName, setTrackName] = useState("");
  const [ranking, setRanking] = useState(0);

  const [debouncedValue, setDebouncedValue] = useState<NodeJS.Timeout | null>(
    null
  );

  async function getAlbumID(value: string) {
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
      `https://api.spotify.com/v1/search?q=${encodedValue}&type=album&limit=1`,
      searchOptions
    );
    const data = await response.json();
    const albumID = data.albums.items[0].id;
    getAlbumDetails(albumID);
  }

  async function getAlbumDetails(value: string) {
    if (value === "") {
      return;
    }
    var requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    };
    const encodedValue = encodeURIComponent(value);
    const response = await fetch(
      `https://api.spotify.com/v1/albums/${encodedValue}`,
      requestOptions
    );
    const data = await response.json();
    const albumDetails = data;
    const releaseYear = albumDetails.release_date.slice(0, 4);

    if (albumDetails.tracks && albumDetails.tracks.items.length > 0) {
      const firstTrack = albumDetails.tracks.items[0];
      setTrackName(firstTrack.name);
    }
    setReleaseDate(releaseYear);
    setArtistName(albumDetails.artists[0].name);
    getArtistInfo(albumDetails.artists[0].id);
  }

  async function getArtistInfo(value: string) {
    if (value === "") {
      return;
    }
    var requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    };
    const encodedValue = encodeURIComponent(value);
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${encodedValue}`,
      requestOptions
    );
    const data = await response.json();
    const artistDetails = data;
    setArtistImg(artistDetails.images[1].url);
    setGenre(artistDetails.genres[0]);
    setRanking(artistDetails.popularity);
  }

  useEffect(() => {
    if (todayAlbum) {
      getAlbumID(todayAlbum.albumName);
    }
  }, [todayAlbum]);

  useGSAP(() => {
    if (debouncedValue) clearTimeout(debouncedValue);
    gsap.killTweensOf(menuRef.current);
    const timeout = setTimeout(() => {
      if (isClicked) {
        gsap.to(menuRef.current, {
          duration: 0.7,
          y: "-15px",
          ease: "back.out",
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          force3D: true,
        });
      } else {
        gsap.to(menuRef.current, {
          duration: 0.4,
          y: "150px",
          ease: "back.in",
          scaleX: 0.1,
          scaleY: 0.1,
          opacity: 0,
          force3D: true,
        });
      }
    }, 100);
    setDebouncedValue(timeout);
    return () => clearTimeout(timeout);
  }, [isClicked]);

  const isMobileDevice = () => {
    const hasTouchCapabilities =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const isScreenWidthMobile = screen.width <= 800;
    const isMobileUserAgent =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    return hasTouchCapabilities && (isMobileUserAgent || isScreenWidthMobile);
  };

  const toggleClick = () => {
    if (isMobileDevice()) {
      setIsClicked(!isClicked);
    }
  };

  return (
    <>
      <div
        className={`w-full h-full bg-neutral-800 transition-colors duration-300 hover:bg-neutral-700 rounded-lg drop-shadow-sm will-change-transform ${
          isClicked ? "z-30 " : "z-10 "
        }`}
      >
        <button
          className="w-full h-full flex items-center justify-center "
          onMouseEnter={() => {
            if (!isMobileDevice()) {
              setIsClicked(true);
            }
          }}
          onMouseLeave={() => setIsClicked(false)}
          onClick={toggleClick}
          onBlur={() => setIsClicked(false)}
        >
          <p className="font-apple text-white opacity-50 text-xs tracking-tighter">
            Hints
          </p>
        </button>
      </div>

      <div className="absolute w-full h-96  bottom-full z-30 p-3" ref={menuRef}>
        <div className="bg-[#1a1a1a] w-full h-auto rounded-lg p-2 aspect-square drop-shadow-lg">
          <div className="w-full h-full grid grid-cols-2 grid-rows-4 gap-2 pb-2">
            <div className="row-span-2 col-span-2 flex">
              <div className="w-1/2 h-full rounded-lg bg-neutral-800 overflow-hidden p-2 m-1">
                {guessCount! >= 2 || isCorrect ? (
                  <img
                    src={`${artistImg}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="flex w-full h-full justify-center items-center">
                    <AiFillLock size={32} className="fill-white opacity-50" />
                  </div>
                )}
              </div>

              <div className="w-1/2 h-full rounded-lg space-y-2 justify-around flex flex-col overflow-hidden m-1">
                <div className="bg-neutral-800 w-full flex-1 rounded-lg text-white font-apple text-center items-center justify-center flex flex-col">
                  <p className="text-xs text-opacity-50 text-white">Genre</p>
                  <p className="text-xs">{genre}</p>
                </div>
                <div className="bg-neutral-800 w-full flex-1 rounded-lg text-white font-apple text-center items-center justify-center flex flex-col">
                  <p className="text-xs text-opacity-50 text-white">
                    Popularity
                  </p>
                  {guessCount! >= 0 || isCorrect ? (
                    <p className="text-md">{ranking}/100</p>
                  ) : (
                    <AiFillLock
                      size={24}
                      className="fill-white opacity-50 m-1"
                    />
                  )}
                </div>
                <div className="bg-neutral-800 w-full flex-1 rounded-lg text-white font-apple text-center items-center justify-center flex flex-col">
                  <p className="text-xs text-opacity-50 text-white">Released</p>
                  {guessCount! >= 1 || isCorrect ? (
                    <p className="text-md">{releaseDate}</p>
                  ) : (
                    <AiFillLock
                      size={24}
                      className="fill-white opacity-50 m-1"
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="row-span-1 col-span-2 flex">
              <div className="bg-neutral-800 w-full h-full rounded-lg p-2 m-1 text-white font-apple text-center items-center justify-center flex flex-col">
                <p className="text-xs text-opacity-50 text-white">
                  Artist Name
                </p>
                {guessCount! >= 3 || isCorrect ? (
                  <p className="text-sm md:text-lg">{artistName}</p>
                ) : (
                  <AiFillLock size={24} className="fill-white opacity-50 m-1" />
                )}
              </div>
            </div>
            <div className="row-span-1 col-span-2 flex">
              <div className="bg-neutral-800 w-full h-full rounded-lg p-2 m-1 text-white font-apple text-center items-center justify-center flex flex-col">
                <p className="text-xs text-opacity-50 text-white">
                  Track From Album
                </p>
                {guessCount! >= 4 || isCorrect ? (
                  <p className="text-sm md:text-lg">{trackName}</p>
                ) : (
                  <AiFillLock size={24} className="fill-white opacity-50 m-1" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default HintSheet;
