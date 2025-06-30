import { useState } from 'react'
import { Routes, Route} from 'react-router-dom';
import Dashboard from './sites/Dashboard';
import Index from './sites/Index';
import CreateCommand from './sites/CreateCommand';
import ViewCommands from './sites/ViewCommands';
import ViewCommand from './sites/Command';
import './index.css'

export default function App() {
  const oauth = import.meta.env.VITE_TWITCH_OAUTH;
  const nick  = import.meta.env.VITE_NICK; 
  const channel = 'nastea26';
  return(
    <Routes>
      <Route path="/" element = { <Index /> } />
      <Route path="/dashboard" element = { <Dashboard /> } />
      <Route path="/command/create" element = { <CreateCommand /> } />
      <Route path="/commands/:trigger" element={<ViewCommand />} />
      <Route path="/commands" element = { <ViewCommands /> } />

      <Route path="*" element = { <p>404: Page not found</p> } />
    </Routes>
  )
}

