import React from 'react';
import { useState } from 'react'
import TwitchChat from '../components/TwitchChat';
import Commands from '../components/Commands';
import SpotifyLoginButton from '../components/SpotifyLogin';
import '../index.css'

export default function Dashboard() {
  return(
    <>
      <div className='w-screen h-screen p-0 m-0 bg-gray-800 flex flex-col'>
        <div className='flex flex-row w-screen h-50'>
          <TwitchChat className = {' w-3/8 h-100 p-4 '}/>
          <div className='w-5/8 h-100 p-4 bg-gray-900 m-4 rounded-lg'>
            <div className="flex gap-8 text-twitch mb-4">
              <a href="/command/create" className="bg-white p-3 rounded-full hover:scale-105 hover:bg-neutral-200 transition duration-300 ease-in-out">New Command</a>
              <a href="/commands" className="bg-white p-3 rounded-full">View Commands</a>
            <SpotifyLoginButton />
            </div>
            <div className='p-0 m-0 flex flex-row'>
            <Commands/>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

