// src/components/Commands.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Commands() {
  const [commands, setCommands] = useState([]);

  useEffect(() => {
    async function fetchCommands() {
      try {
        const res = await fetch('/api/commands');
        if (!res.ok) throw new Error('Failed to load commands');
        const cmds = await res.json();
        setCommands(cmds);
      } catch (err) {
        console.error('Error loading commands:', err);
      }
    }
    fetchCommands();
  }, []);

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
      {commands.map((cmd, index) => (
        <Link to={`/commands/${encodeURIComponent(cmd.trigger)}`} key={index}>
          <div className="bg-white p-4 rounded shadow h-26 flex flex-col justify-between overflow-hidden">
            <p className="font-bold text-indigo-700 truncate">{cmd.trigger}</p>
            <p className="text-sm text-gray-700 line-clamp-2">{cmd.response}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
