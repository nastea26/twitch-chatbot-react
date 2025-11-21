import React from 'react';
import { useState } from 'react';
import Commands from '../components/Commands';
import '../index.css'

export default function ViewCommands(){
    return (
        <>
            <div className='w-screen h-screen p-0 m-0 bg-gray-800 flex flex-row'>
            <Commands />
            </div>
        </>
    )
}