import React, { ReactNode, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function MenuItem({
  title,
  children,
  isClicked,
  setIsClicked,
}: {
  title: string;
  children: ReactNode;
  isClicked: boolean;
  setIsClicked: (value: boolean) => void;
}) {
  const menuRef = useRef(null);
  const [debouncedValue, setDebouncedValue] = useState<NodeJS.Timeout | null>(
    null
  );

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

  return (
    <div
      className="absolute w-full h-4/6 flex flex-col items-center justify-center z-40 bg-[#1a1a1a] px-1 mt-20 rounded-lg will-change-transform"
      ref={menuRef}
    >
      <div className="flex p-1 w-full ">
        <div className="flex items-center justify-center ml-7 w-full">
          <p className="opacity-50 font-mono text-white">{title}</p>
        </div>
        <button
          className="text-white font-mono text-xl opacity-50 hover:opacity-100 cursor-pointer"
          onClick={() => {
            setIsClicked(false);
          }}
        >
          [x]
        </button>
      </div>
      <div className="w-full h-full rounded-md p-3 overflow-y-scroll scrollbar scrollbar-thumb-neutral-800 scrollbar-thumb-rounded-full hover:scrollbar-thumb-neutral-700 scrollbar-w-3 pr-1 pb-3">
        {children}
      </div>
    </div>
  );
}
