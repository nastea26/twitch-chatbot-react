import React from 'react';
import TwitchChat from '../components/TwitchChat';
import Commands from '../components/Commands';
import SpotifyLoginButton from '../components/SpotifyLogin';
import '../index.css';

export default function Dashboard() {
  return (
    <>
      <div className="w-screen h-screen p-0 m-0 bg-gray-800 flex flex-col items-center">
        <div className="flex flex-row gap-8 mt-8 w-[90%] h-[50vh]">
          
          {/* Left panel: TwitchChat */}
          <div className="w-1/2 h-full flex flex-col gap-4">
            {/* TwitchChat */}
            <div className="flex-1 bg-gray-900 rounded-lg p-4 overflow-hidden">
              <TwitchChat className="w-full h-full" />
            </div>
          </div>

          {/* Right panel: Commands */}
          <div className="w-1/2 h-full bg-gray-900 rounded-lg p-4 flex flex-col overflow-hidden">
            {/* Top Buttons */}
            <div className="flex gap-4 text-twitch mb-4">
              <a href="/command/create" className="bg-white p-3 rounded-full hover:scale-105 hover:bg-neutral-200 transition duration-300 ease-in-out">
                New Command
              </a>
              <a href="/commands" className="bg-white p-3 rounded-full">
                View Commands
              </a>
              <SpotifyLoginButton />
            </div>

            {/* Scrollable Commands list */}
            <div className="flex-1 overflow-y-auto">
              <Commands />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
