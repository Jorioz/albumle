import { doc, getDoc, DocumentData } from "firebase/firestore";
import { db } from "../app/firebase";
import React, { useEffect, useState, useRef } from "react";
import { useGlobal } from "../app/Context";

export default function AlbumCanvas() {
  const [album, setAlbum] = useState<DocumentData | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { guessCount } = useGlobal()!;
  const [sampleSize, setSampleSize] = useState(54);
  const [targetSampleSize, setTargetSampleSize] = useState(54);
  const { isCorrect } = useGlobal()!;
  const { albumCount } = useGlobal()!;
  const { copyResult, setCopyResult } = useGlobal()!;
  const [showResults, setShowResults] = useState(false);
  const [message, setMessage] = useState("message_result");
  const [shouldRender, setShouldRender] = useState(false);
  const [buttonText, setButtonText] = useState("copy results");

  const winMessages = ["Nice!", "Well Done.", "That's it!"];
  const loseMessages = ["Next Time.", "Not Quite.", "Good Try."];
  const quickWinMessages = ["Light work.", "BAANGGG!", "too ez."];
  const lateWinMessages = ["Just made it.", "phew...", "Trust the process."];

  useEffect(() => {
    if (showResults) {
      const timer = setTimeout(() => {
        setShouldRender(true);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setShouldRender(false);
    }
  }, [showResults]);

  const copyToClipboard = async () => {
    let message = `albumle #${albumCount} ${
      guessCount! + 1
    }/6\n${copyResult}\nhttps://albumle.app`;
    try {
      await navigator.clipboard.writeText(message);
      setButtonText("copied!");
      setTimeout(() => {
        setButtonText("copy results");
      }, 1000);
    } catch (err) {
      return;
    }
  };

  useEffect(() => {
    let newMessage;
    if (guessCount === null || guessCount === -1) {
      setShowResults(false);
    }
    if (guessCount === 5 || isCorrect) {
      newMessage = getRandomMessage(guessCount!);
      setMessage(newMessage);
      setShowResults(true);
      appendResult();
    }
  }, [guessCount, isCorrect]);

  const appendResult = () => {
    let character = "⬛";
    setCopyResult((prev) => {
      if (prev.length < 6) {
        const charactersToAdd = 6 - prev.length;
        return prev + character.repeat(charactersToAdd);
      }
      return prev;
    });
  };

  function getRandomMessage(guessCount: number) {
    let selected;
    if (guessCount <= 1) {
      selected = quickWinMessages;
    } else if (guessCount <= 4 && guessCount > 1) {
      selected = winMessages;
    } else if (guessCount === 4) {
      selected = lateWinMessages;
    } else {
      selected = loseMessages;
    }
    const random = Math.floor(Math.random() * selected!.length);
    return selected![random];
  }

  useEffect(() => {
    const getAlbum = async () => {
      const docRef = doc(db, "dev", "current");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setAlbum(docSnap.data());
      } else {
        console.log("Could not get dailyAlbum");
      }
    };

    getAlbum();
  }, []);

  useEffect(() => {
    if (guessCount === -1) {
      setTargetSampleSize(54);
      return;
    }
    if (isCorrect) {
      setTargetSampleSize(1);
      return;
    } else if (guessCount === 0) {
      setTargetSampleSize(36);
    } else if (guessCount === 1) {
      setTargetSampleSize(28);
    } else if (guessCount === 2) {
      setTargetSampleSize(19);
    } else if (guessCount === 3) {
      setTargetSampleSize(13);
    } else if (guessCount === 4) {
      setTargetSampleSize(8);
    } else if (guessCount === 5) {
      setTargetSampleSize(1);
    }
  }, [guessCount, isCorrect]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSampleSize((prevSampleSize) => {
        if (prevSampleSize < targetSampleSize) {
          return prevSampleSize + 1;
        } else if (prevSampleSize > targetSampleSize) {
          return prevSampleSize - 1;
        } else {
          clearInterval(interval);
          return prevSampleSize;
        }
      });
    }, 500 / Math.abs(sampleSize - targetSampleSize));

    return () => clearInterval(interval);
  }, [targetSampleSize]);

  useEffect(() => {
    if (!canvasRef.current || !album?.albumCover) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = album?.albumCover;

    img.onload = () => {
      if (!canvasRef.current) return;
      const context = canvasRef.current.getContext("2d", {
        willReadFrequently: true,
      });
      if (!context) return;

      const w = img.width;
      const h = img.height;

      canvasRef.current.width = w;
      canvasRef.current.height = h;
      context.clearRect(0, 0, w, h);
      context.drawImage(img, 0, 0);
      const pixelArr = context.getImageData(0, 0, w, h).data;

      for (let y = 0; y < h; y += sampleSize) {
        for (let x = 0; x < w; x += sampleSize) {
          const p = (x + y * w) * 4;
          context.fillStyle = `rgba(${pixelArr[p]}, ${pixelArr[p + 1]}, ${
            pixelArr[p + 2]
          }, ${pixelArr[p + 3]})`;
          context.fillRect(x, y, sampleSize, sampleSize);
        }
      }
    };

    img.src = album?.albumCover;
  }, [album, canvasRef, sampleSize]);

  return (
    <div className="w-full h-full p-2 relative">
      <canvas ref={canvasRef} className="rounded-lg w-full h-full " />
      {showResults ? (
        <div
          className={`w-full h-full absolute top-0 left-0 p-2 transition-all duration-1000 ${
            shouldRender ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="w-full h-auto absolute bottom-6 flex justify-center items-center left-0 drop-shadow-md">
            <button
              className="bg-neutral-800 hover:bg-neutral-700 transition-colors duration-300 p-2 rounded-lg"
              onClick={copyToClipboard}
            >
              <p className="text-white font-apple tracking-tighter text-xs drop-shadow-sm">
                {buttonText}
              </p>
            </button>
          </div>
          <div className="w-full h-full rounded-lg  bg-black/50 flex items-center justify-center flex-col gap-2">
            <div className=" w-full justify-center items-center flex flex-col">
              <p className="text-white font-apple tracking-tighter text-sm drop-shadow-sm">
                #{albumCount}
              </p>
              <p className="text-white font-apple tracking-tighter text-base drop-shadow-sm">
                {message}
              </p>
            </div>
            <div className="bg-neutral-800 w-24 h-auto aspect-square rounded-lg text-center items-center flex justify-center">
              <p className="text-white font-apple tracking-tighter text-5xl drop-shadow-sm">
                {isCorrect ? guessCount! + 1 : "X"}
              </p>
            </div>
            <p className="text-white font-apple tracking-tighter text-sm drop-shadow-sm">
              {isCorrect ? "attempts" : "failed T-T"}
            </p>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
