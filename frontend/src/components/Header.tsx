import React, { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import { useGSAP } from "@gsap/react";
import { FaTwitter } from "react-icons/fa";
import { SiKofi } from "react-icons/si";
import HelpMenu from "./HelpMenu";
import MenuItem from "./MenuItem";
import { useGlobal } from "../app/Context";
gsap.registerPlugin(useGSAP);
gsap.registerPlugin(TextPlugin);
function Header() {
  const titleRef = useRef<HTMLSpanElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState<NodeJS.Timeout | null>(
    null
  );
  const [isHelpClicked, setIsHelpClicked] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      localStorage.setItem("user", "true");
      console.log("New user found");
      setIsNewUser(true);
      setIsHelpClicked(true);
    }
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  useGSAP(() => {
    if (debouncedValue) clearTimeout(debouncedValue);
    const timeout = setTimeout(() => {
      if (isHovered) {
        gsap.fromTo(
          titleRef.current!.children,
          { y: "0%" },
          {
            y: "150%",
            duration: 0.3,
            stagger: 0.05,
            ease: "back.in",
          }
        );
      } else {
        gsap.to(titleRef.current!.children, {
          y: "0%",
          duration: 0.4,
          stagger: 0.05,
          ease: "back.out",
        });
      }
    }, 100);
    setDebouncedValue(timeout);
    return () => clearTimeout(timeout);
  }, [isHovered]);

  return (
    <>
      <div
        className={`w-full h-full fixed top-0 bg-black transition-all duration-300 will-change-transform ${
          isHelpClicked ? "opacity-50 z-30 " : "opacity-0 -z-50"
        }`}
      ></div>
      <div className="w-full h-full absolute top-0 left-0">
        <MenuItem
          title="Help"
          isClicked={isHelpClicked}
          setIsClicked={setIsHelpClicked}
        >
          <HelpMenu />
        </MenuItem>
      </div>
      <div
        className={`text-white font-apple  w-full flex items-center justify-center relative will-change-transform ${
          isHelpClicked ? "pointer-events-none" : ""
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchEnd={handleMouseEnter}
        onBlur={handleMouseLeave}
      >
        <span className="text-3xl tracking-tighter  " ref={titleRef}>
          <span className="title inline-block">a</span>
          <span className="title inline-block">l</span>
          <span className="title inline-block">b</span>
          <span className="title inline-block">u</span>
          <span className="title inline-block">m</span>
          <span className="title inline-block">l</span>
          <span className="title inline-block">e</span>
        </span>
        <div className="flex w-fit items-center">
          <a
            href="https://twitter.com/albumle"
            target="_blank"
            className={`absolute bg-neutral-800 hover:bg-neutral-700 text-sm rounded-full flex items-center justify-center p-2 ${
              isHovered
                ? "left-0 opacity-100 duration-700" /* HIGH */
                : "-left-full opacity-0 duration-500" /* LOW */
            } transition-all `}
          >
            <FaTwitter
              size={24}
              className="hover:fill-sky-400 transition-all duration-300"
            />
          </a>

          <a
            href="https://ko-fi.com/jorios"
            target="_blank"
            className={`absolute bg-neutral-800 hover:bg-neutral-700 text-sm rounded-full flex items-center justify-center p-2 ${
              isHovered
                ? "left-12 opacity-100 duration-500" /* LOW */
                : "-left-full opacity-0 duration-700" /* HIGH */
            } transition-all `}
          >
            <SiKofi
              size={24}
              className="hover:fill-red-400 transition-all duration-300"
            />
          </a>
        </div>
        <div className="flex w-fit items-center">
          <button
            onClick={() => {
              setIsHelpClicked(!isHelpClicked);
            }}
            className={`absolute bg-neutral-800 hover:bg-neutral-700 text-sm p-1 rounded-lg h-full ${
              isHovered
                ? "right-0 opacity-100 duration-700" /* HIGH */
                : "-right-full opacity-0 duration-500" /* LOW */
            } transition-all`}
          >
            [guide]
          </button>
        </div>
      </div>
    </>
  );
}

export default Header;
