import axios from 'axios'
import ytdl from 'ytdl-core'
import { getSpotifyAccessToken } from '../spotify.js'

function checkForToken(token){//error out when no token prevent crashing 
  if (!token) {
    const err = new Error('No Spotify token available')
    err.status = 401
    throw err
  }
}


async function searchItem(query) {
  const token = getSpotifyAccessToken();
  checkForToken(token);

  const spotifyLinkRegex = /^https?:\/\/open\.spotify\.com\/(?:[A-Za-z0-9_-]+\/)*track\/([A-Za-z0-9]{22})(?:\?.*)?$/;
  const youtubeLinkRegex = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/;

  //handle spotify links guaranteed 1:1 song match
  const spotifyMatch = query.match(spotifyLinkRegex);
  if (spotifyMatch) {
    const trackID = spotifyMatch[1];

    const resp = await axios.get(
      `https://api.spotify.com/v1/tracks/${trackID}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!resp.data?.uri || !resp.data?.name || !resp.data?.artists) {
      return { uri: false };
    }

    const artists = resp.data.artists.map(artist => artist.name);
    return {
      uri: resp.data.uri,
      name: resp.data.name,
      artists: artists.join(', '),
      duration: resp.data.duration_ms
    };
  }

  //handling youtube links
  if (youtubeLinkRegex.test(query)) {
    try {
      const info = await ytdl.getBasicInfo(query);
      const title = info.videoDetails.title;

      //clean title ( remove "(Official Video)", and stuff like that)
      const cleanedTitle = title
        .replace(/\(.*?(official|lyrics|video).*?\)/i, '')
        .replace(/\[.*?(official|lyrics|video).*?\]/i, '')
        .replace(/(official\s*video|lyric\s*video)/i, '')
        .trim();

      query = cleanedTitle;
    } catch (err) {
      console.error("Failed to parse YouTube title:", err);
      return { uri: false };
    }
  }

  // search for the song using given string
  const resp = await axios.get(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const track = resp?.data?.tracks?.items?.[0];
  if (!track || !track.uri) {
    return { uri: false };
  }

  const artists = track.artists.map(artist => artist.name);
  return {
    uri: track.uri,
    name: track.name,
    artists: artists.join(', '),
    duration: track.duration_ms
  };
}

async function getQueue(){
  const token = getSpotifyAccessToken()
  checkForToken(token)

  const resp = await axios.get(
    'https://api.spotify.com/v1/me/player/queue',
    { headers: {Authorization:`Bearer ${token}`} }
  )
  if(resp.status>200 || !resp.data.queue || resp.data.queue.length == 0){
    return {queue:false}
  }
  let tracks = [];
  let artists = [];

  resp.data.queue.map(item=>{
    let artistsHolder = []
    
    item.artists.map(artist=>{
      artistsHolder.push(artist.name)
    })
    
    tracks.push(item.name)
    artists.push(artistsHolder.join(', '))
  })

  return {queue: true, songs:tracks, artists:artists}
}

export async function getCurrentSong() {
  const token = getSpotifyAccessToken()
  checkForToken(token)

  const resp = await axios.get(
    'https://api.spotify.com/v1/me/player/currently-playing',
    { headers: { Authorization: `Bearer ${token}` } }
  )

  if (resp.status === 204 || !resp.data || !resp.data.item) {
    return { playing: false }
  }

  const item = resp.data.item
  const name = item.name
  const artists = item.artists.map(a => a.name).join(', ')
  const position = resp.data.progress_ms
  const duration = item.duration_ms
  return { playing: true, name, artists, position:position, duration:duration, uri:item.uri }
}

export async function addToQueue(q) {
  const token = getSpotifyAccessToken()
  checkForToken(token)

  const song = await searchItem(q)
  if(!song.uri){
    return { inQueue: false }
  }

  const resp = await axios.post(
    `https://api.spotify.com/v1/me/player/queue?uri=${song.uri}`,
    null, 
    {headers:{Authorization: `Bearer ${token}`}}
  )
  
  if (resp.status >=300 || resp.message) {
    return { inQueue: false}
  }
  return {inQueue: true, name:song.name, artists:song.artists, duration: song.duration, uri:song.uri}
}

export async function skip() {
  const token = getSpotifyAccessToken()
  checkForToken(token)
  
  const queue = await getQueue()

  const resp = await axios.post(
    `https://api.spotify.com/v1/me/player/next`,
    null,
    {headers:{Authorization:`Bearer ${token}`}}
  )

  if(resp.status===204 || resp.data.error){
    return {skipped:false}
  }

  return {skipped:true, queue:queue} 
}
