// server/routes/spotifyAuth.js
import { initSpotify } from '../spotify.js'

export default function mountSpotifyAuth(app) {
  initSpotify(app)
}
