// src/components/SpotifyLogin.jsx
import React, { useState, useEffect } from 'react';

export default function SpotifyLoginButton() {
  const [status, setStatus] = useState('loading');

  // Function to check token status
  const checkStatus = () => {
    fetch('http://localhost:3000/spotify/token')
      .then((res) => {
        if (!res.ok) throw new Error('Not authorized');
        return res.json();
      })
      .then((data) => {
        setStatus(data.authorized ? 'authorized' : 'unauthorized');
      })
      .catch(() => {
        setStatus('unauthorized');
      });
  };

  // On mount, and then every minute, poll status
  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (status === 'loading') {
    return (
      <button disabled className="bg-gray-700 text-white px-4 py-2 rounded opacity-50">
        Loading…
      </button>
    );
  }

  if (status === 'authorized') {
    return (
      <button disabled className="bg-green-600 text-white px-4 py-2 rounded">
        Connected to Spotify
      </button>
    );
  }

  // unauthorized
  return (
    <button
      onClick={() => (window.location.href = 'http://localhost:3000/spotify/login')}
      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition"
    >
      Login with Spotify
    </button>
  );
}
