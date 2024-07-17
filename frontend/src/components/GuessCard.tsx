import React, { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { TextPlugin } from "gsap/TextPlugin";
import { CustomEase } from "gsap/CustomEase";
import { useGlobal } from "../app/Context";

gsap.registerPlugin(useGSAP);
gsap.registerPlugin(TextPlugin);
gsap.registerPlugin(CustomEase);

type Props = {
  className: string;
  index: number;
  artistText?: string;
  albumText?: string;
  isUnlocked?: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
  onBlur: () => void;
};

function GuessCard({
  index,
  className,
  artistText = "",
  albumText = "",
  isUnlocked,
  onMouseEnter,
  onMouseLeave,
}: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  const albumTextRef = useRef<any>(null);
  const artistTextRef = useRef<any>(null);
  const divRef = useRef<any>(null);
  const { guessCount } = useGlobal()!;
  const { todayAlbum } = useGlobal()!;
  const { isCorrect, setIsCorrect } = useGlobal()!;
  const [albumOverflown, setAlbumOverflown] = useState(false);
  const [artistOverflown, setArtistOverflown] = useState(false);

  const borderColors = () => {
    if (!isUnlocked) return "";
    if (albumText === todayAlbum?.albumName) {
      return "border-green-500";
    }
    if (artistText === todayAlbum?.artistName) {
      return "border-yellow-500";
    }

    if (albumText !== todayAlbum?.albumName) {
      return "border-red-500";
    }

    return "";
  };

  useEffect(() => {
    if (isUnlocked && albumText === todayAlbum?.albumName) {
      setIsCorrect(true);
    }
  }, [isUnlocked, albumText, todayAlbum?.albumName, setIsCorrect]);

  useGSAP(() => {
    if (!isUnlocked) {
      return;
    }
    if (isHovered) {
      gsap.to(albumTextRef.current, {
        duration: 0.8,
        text: albumText,
        ease: "power1.out",
        onUpdate: () => {
          const currentDivWidth = divRef.current!.getBoundingClientRect().width;
          const alTextWidth =
            albumTextRef.current!.getBoundingClientRect().width;
          if (alTextWidth > currentDivWidth) {
            setAlbumOverflown(true);
          }
        },
        onComplete: () => {
          const currentDivWidth = divRef.current!.getBoundingClientRect().width;
          const alTextWidth =
            albumTextRef.current!.getBoundingClientRect().width;
          if (alTextWidth > currentDivWidth) {
            let overflowAmount = alTextWidth - currentDivWidth;
            const speed = 100;
            const duration = overflowAmount / speed;
            gsap.to(albumTextRef.current, {
              ease: CustomEase.create(
                "custom",
                "M0,0 C0.09,0 0.374,0.306 0.507,0.512 0.652,0.738 0.822,1 1,1 "
              ),
              x: -overflowAmount,
              duration: duration,
              yoyo: true,
              repeat: -1,
              repeatDelay: 1,
            });
          }
        },
      });

      gsap.to(artistTextRef.current, {
        duration: 0.8,
        text: artistText,
        ease: "power1.out",
        display: "inline",
        onUpdate: () => {
          const currentDivWidth = divRef.current!.getBoundingClientRect().width;
          const arTextWidth =
            artistTextRef.current!.getBoundingClientRect().width;
          if (arTextWidth > currentDivWidth) {
            setArtistOverflown(true);
          }
        },
        onComplete: () => {
          const currentDivWidth = divRef.current!.getBoundingClientRect().width;
          const arTextWidth =
            artistTextRef.current!.getBoundingClientRect().width;
          if (arTextWidth > currentDivWidth) {
            let overflowAmount = arTextWidth - currentDivWidth;
            const speed = 100;
            const duration = overflowAmount / speed;
            gsap.to(artistTextRef.current, {
              ease: CustomEase.create(
                "custom",
                "M0,0 C0.09,0 0.374,0.306 0.507,0.512 0.652,0.738 0.822,1 1,1 "
              ),
              x: -overflowAmount,
              duration: duration,
              yoyo: true,
              repeat: -1,
              repeatDelay: 1,
            });
          }
        },
      });
    } else {
      gsap.killTweensOf(albumTextRef.current);
      gsap.killTweensOf(artistTextRef.current);
      setAlbumOverflown(false);
      setArtistOverflown(false);
      gsap.set(albumTextRef.current, { x: 0 });
      gsap.set(artistTextRef.current, { x: 0 });
      gsap.to(albumTextRef.current, {
        duration: 0.8,
        text: (index + 1).toString(),
        ease: "power1.out",
      });
      gsap.to(artistTextRef.current, {
        duration: 0.8,
        text: "",
        ease: "power1.out",
        display: "none",
      });
    }
  }, [isHovered, albumText, artistText, index]);
  return (
    <>
      <div
        className={`rounded-lg h-full w-full max-w-52 bg-neutral-800  flex ${className} transition-all duration-500 border-2 overflow-hidden p-1 drop-shadow-sm ${
          isUnlocked ? "hover:bg-neutral-700" : "pointer-events-none"
        } ${
          index - 1 === guessCount && !isUnlocked && !isCorrect
            ? "animate-pulse  border-neutral-300"
            : ""
        } ${
          index - 1 > guessCount! ? "border-transparent" : ""
        } ${borderColors()}
        ${isCorrect && !isUnlocked ? "border-transparent animate-none" : ""}  `}
        id="card"
        onMouseEnter={() => {
          if (isUnlocked) {
            onMouseEnter();
            setIsHovered(true);
          }
        }}
        onMouseLeave={() => {
          if (isUnlocked) {
            onMouseLeave();
            setIsHovered(false);
          }
        }}
        onClick={() => {
          if (isUnlocked) {
            onMouseEnter();
            setIsHovered(true);
          }
        }}
        onBlur={() => {
          if (isUnlocked) {
            onMouseLeave();
            setIsHovered(false);
          }
        }}
        ref={cardRef}
      >
        <div
          className="w-full h-full flex flex-col justify-center tracking-tighter text-center whitespace-nowrap"
          ref={divRef}
        >
          <div
            className={`w-full flex ${
              albumOverflown ? "justify-start" : "justify-center"
            }`}
          >
            <p
              className="text-white font-apple opacity-50 text-sm whitespace-nowrap w-fit"
              ref={albumTextRef}
            >
              {index + 1}
            </p>
          </div>
          <div
            className={`w-full flex ${
              artistOverflown ? "justify-start" : "justify-center"
            }`}
          >
            <p
              className="text-white font-apple opacity-50 text-xs hidden text-center whitespace-nowrap w-fit"
              ref={artistTextRef}
            >
              {index + 1}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default GuessCard;
