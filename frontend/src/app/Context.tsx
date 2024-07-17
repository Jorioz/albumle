"use client";
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";

import { doc, getDoc, DocumentData } from "firebase/firestore";
import { db } from "../app/firebase";

const GlobalContext = createContext<{
  guessCount: number | null;
  setGuessCount: Dispatch<SetStateAction<number | null>>;
  previousGuess: string;
  setPreviousGuess: Dispatch<SetStateAction<string>>;
  selectedAlbum: string;
  setSelectedAlbum: Dispatch<SetStateAction<string>>;
  selectedArtist: string;
  setSelectedArtist: Dispatch<SetStateAction<string>>;
  isCorrect: boolean;
  setIsCorrect: Dispatch<SetStateAction<boolean>>;
  todayAlbum: DocumentData | null;
  setTodayAlbum: Dispatch<SetStateAction<DocumentData | null>>;
  accessToken: string;
  setAccessToken: Dispatch<SetStateAction<string>>;
  albumCount: number;
  setAlbumCount: Dispatch<SetStateAction<number>>;
  copyResult: string;
  setCopyResult: Dispatch<SetStateAction<string>>;
} | null>(null);

const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [guessCount, setGuessCount] = useState<number | null>(null);
  const [previousGuess, setPreviousGuess] = useState("");
  const [selectedAlbum, setSelectedAlbum] = useState("");
  const [selectedArtist, setSelectedArtist] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [todayAlbum, setTodayAlbum] = useState<DocumentData | null>(null);
  const [accessToken, setAccessToken] = useState("");
  const [albumCount, setAlbumCount] = useState(0);
  const [copyResult, setCopyResult] = useState("");

  const CLIENT_ID = "e92db4a89ad241daa3661907cb03aa86";
  const CLIENT_SECRET = "a3722224cb7f4d0ca21e73704676acb1";

  useEffect(() => {
    const getAlbum = async () => {
      const docRef = doc(db, "dev", "current");
      const docSnap = await getDoc(docRef);
      const local = localStorage.getItem("todayAlbum");
      const stored = local ? JSON.parse(local) : null;
      if (docSnap.exists()) {
        const albumData = docSnap.data();
        if (stored) {
          let temp = albumData;
          setAlbumCount(albumData.albumNum);
          if (temp.albumName === stored.albumName) {
            setTodayAlbum(albumData);
            return;
          } else {
            resetGame();
            setTodayAlbum(albumData);
            localStorage.setItem("todayAlbum", JSON.stringify(albumData));
          }
        } else {
          setTodayAlbum(albumData);
          localStorage.setItem("todayAlbum", JSON.stringify(albumData));
        }
      }
    };
    getAlbum();
  }, []);

  async function resetGame() {
    console.log("resetting game");
    localStorage.removeItem("guessCount");
    localStorage.removeItem("cardInfos");
    localStorage.removeItem("todayAlbum");
    setGuessCount(-1);
    setIsCorrect(false);
  }

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const fetchToken = () => {
      var authOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body:
          "grant_type=client_credentials&client_id=" +
          CLIENT_ID +
          "&client_secret=" +
          CLIENT_SECRET,
      };
      fetch("https://accounts.spotify.com/api/token", authOptions)
        .then((result) => result.json())
        .then((data) => {
          setAccessToken(data.access_token);
          timeoutId = setTimeout(fetchToken, 59 * 60 * 1000);
        });
    };
    fetchToken();
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const savedGuessCount = window.localStorage.getItem("guessCount");
    setGuessCount(savedGuessCount ? Number(savedGuessCount) : -1);
  }, []);

  useEffect(() => {
    if (typeof guessCount === "number") {
      window.localStorage.setItem("guessCount", guessCount.toString());
    }
  }, [guessCount]);

  return (
    <GlobalContext.Provider
      value={{
        guessCount,
        setGuessCount,
        previousGuess,
        setPreviousGuess,
        selectedAlbum,
        setSelectedAlbum,
        selectedArtist,
        setSelectedArtist,
        isCorrect,
        setIsCorrect,
        todayAlbum,
        setTodayAlbum,
        accessToken,
        setAccessToken,
        albumCount,
        setAlbumCount,
        copyResult,
        setCopyResult,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

const useGlobal = () => useContext(GlobalContext);
export { GlobalProvider, useGlobal };
