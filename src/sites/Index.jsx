import React from 'react';
import { useState } from 'react';
import TwitchChat from '../components/TwitchChat';
import Landing from '../components/Landing';
import '../index.css'

export default function Index(){
    return (
    <>
        <Landing />
        <TwitchChat className="relative h-screen w-4/5 m-auto p-4" />
    </>
    )
}