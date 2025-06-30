// src/components/Landing.jsx
import React from 'react';

export default function Landing() {
  return (
    <>
      {/* 1) Fixed, full‑viewport background */}
      <div
        className="
          fixed inset-0         /* cover entire viewport */
          bg-fixed              /* fix background during scroll */
          bg-gradient-to-r from-twitch via-purple-400 to-pink-200
          -z-10                 /* send behind other content */
        "
      />

      {/* 2) Content container, relative so it scrolls normally */}
      <div
        className="
          relative              /* position above bg */
          flex flex-col items-center justify-center
          min-h-screen          
          w-screen
          text-white
        "
      >
        <h1 className="text-6xl font-bold mb-4">
          Welcome to Twitch Chat API
        </h1>
        <p className="text-xl mb-8">
          We're not sure what this site is gonna do just yet
        </p>
        <a
          href='./dashboard'
          className="
            px-6 py-3 rounded-full
            bg-white bg-opacity-20 backdrop-blur font-semibold text-twitch
            hover:bg-neutral-200 hover:scale-110 transition duration-300
            ease-in-out cursor-pointer
          "
        >
          Get Started
        </a>
      </div>
    </>
  );
}
