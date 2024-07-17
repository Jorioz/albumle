"use client";
import React, { useState, useEffect, useContext } from "react";
import GuessCardArray from "../components/GuessCardArray";
import Form from "../components/Form";
import AlbumCanvas from "../components/AlbumCanvas";
import Header from "../components/Header";
import HintSheet from "../components/HintSheet";
import MenuItem from "../components/MenuItem";
import Changelog from "../components/Changelog";

import { GlobalProvider } from "./Context";
import local from "next/font/local";

export default function Home() {
  const [isHintClicked, setIsHintClicked] = useState(false);
  const [isMenuClicked, setIsMenuClicked] = useState(false);
  const [isHelpClicked, setIsHelpClicked] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <GlobalProvider>
      <div className="w-svw h-svh flex justify-center  overflow-y-hidden sm:overflow-y-auto">
        <div
          className={`w-full h-full bg-[#1a1a1a] absolute  duration-500 transition-all ${
            isLoading ? "opacity-100 z-50" : "opacity-0 -z-50"
          }`}
        ></div>
        <div
          className={`w-full h-full absolute bg-black z-30 pointer-events-none transition-opacity duration-300 ${
            isMenuClicked || isHintClicked ? "opacity-50 " : "opacity-0"
          }`}
        ></div>
        <main className="h-full w-full max-w-md px-5 flex flex-col relative items-center">
          <MenuItem
            title="changelog"
            isClicked={isMenuClicked}
            setIsClicked={setIsMenuClicked}
          >
            <Changelog />
          </MenuItem>
          <header
            className={`flex items-center justify-center py-3 cursor-default w-full overflow-x-hidden ${
              isMenuClicked || isHintClicked ? "pointer-events-none" : ""
            }`}
          >
            <Header />
          </header>

          <div className="w-full h-auto flex justify-center">
            <div className="w-full h-auto bg-neutral-800 aspect-square rounded-lg z-20">
              <AlbumCanvas />
            </div>
          </div>

          <div className="w-full h-auto ">
            <Form />
          </div>
          <div className="w-full min-h-32 sm:min-h-32 flex flex-col justify-between">
            <div className="w-full h-16">
              <GuessCardArray />
            </div>

            <div
              className={`w-full h-12 relative ${isHintClicked ? "z-30" : ""} ${
                isMenuClicked ? "pointer-events-none" : ""
              }`}
            >
              <HintSheet
                isClicked={isHintClicked}
                setIsClicked={setIsHintClicked}
              />
            </div>
          </div>

          <div className="items-center justify-center flex pt-2">
            <p className="font-mono sm:text-sm text-xs text-white opacity-30">
              Another Project by{" "}
              <a
                href="https://github.com/Jorioz"
                className="font-bold underline pr-2"
                target="_blank"
              >
                Jorio
              </a>
            </p>
            <div className="font-mono sm:text-sm text-xs text-white opacity-30 flex gap-2">
              <p className="font-extralight">[v2.0]</p>

              <button
                className="underline cursor-pointer"
                onClick={() => {
                  setIsMenuClicked(true);
                }}
              >
                changelog
              </button>
            </div>
          </div>
        </main>
      </div>
    </GlobalProvider>
  );
}
