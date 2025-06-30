// spotify.js
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

let spotifyAccessToken = ''
let spotifyRefreshToken = ''
let refreshInterval = null

const SPOTIFY_SCOPES = 'user-read-private user-read-email user-read-currently-playing user-modify-playback-state user-read-playback-state'

export function initSpotify(app) {
  // 1) Redirect user to Spotify login
  app.get('/spotify/login', (req, res) => {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id:     process.env.SPOTIFY_CLIENT_ID,
      scope:         SPOTIFY_SCOPES,
      redirect_uri:  process.env.SPOTIFY_REDIRECT_URI
    })
    res.redirect(`https://accounts.spotify.com/authorize?${params}`)
  })

  // 2) Callback: exchange code for tokens
  app.get('/spotify/callback', async (req, res) => {
    const code = req.query.code
    if (!code) return res.status(400).send('Missing code')
    try {
      const body = new URLSearchParams({
        grant_type:    'authorization_code',
        code,
        redirect_uri:  process.env.SPOTIFY_REDIRECT_URI
      })
      const auth = Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString('base64')

      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        body.toString(),
        { headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
      )

      spotifyAccessToken  = response.data.access_token
      spotifyRefreshToken = response.data.refresh_token

      // Setup refresh interval
      if (refreshInterval) clearInterval(refreshInterval)
      refreshInterval = setInterval(refreshSpotifyToken, 55 * 60 * 1000)

      // After we have tokens, send the user back to your Dashboard
+     res.redirect('http://localhost:5173/dashboard')
    } catch (err) {
      console.error('Spotify auth error', err)
      res.status(500).send('Spotify token exchange failed')
    }
  })

  // 3) Expose current token status
  app.get('/spotify/token', (req, res) => {
    if (!spotifyAccessToken) return res.status(401).json({ authorized: false })
    res.json({ authorized: true, access_token: spotifyAccessToken })
  })
}

async function refreshSpotifyToken() {
  try {
    const body = new URLSearchParams({
      grant_type:    'refresh_token',
      refresh_token: spotifyRefreshToken
    })
    const auth = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64')

    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      body.toString(),
      { headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
    )
    spotifyAccessToken = response.data.access_token
    console.log('Spotify token refreshed')
  } catch (err) {
    console.error('Error refreshing Spotify token', err)
  }
}

export function getSpotifyAccessToken() {
  return spotifyAccessToken
}