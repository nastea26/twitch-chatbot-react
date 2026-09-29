# Custom Twitch bot with Spotify integration

This is a small project I made for whenever I'd stream on Twitch, to allow my friends to queue songs from chat into my Spotify, allowing for a more interactive experience.
The UI also allows for custom commands and comes with a few placeholders to allow flexible responses.

<img width="1263" height="671" alt="image" src="https://github.com/user-attachments/assets/209430b2-738b-4171-af3f-f164d49ee56c" />

#### Technical information:

Connection to Twitch chat is handled through WebSockets.

Spotify API calls run separately from the UI through Node.js. Default port is 3000 (./server). 

UI is running using React.

Commands are stored in ```src/data/commands.json``` and can be added via the UI or by following the structure directly in the command.json file

The queue is stored in ```server/data/queue.json```, this is to track which song was added by which chatter for ```when``` commands to work properly

## How to run:

#### Installing packages
```console
npm install
```

NOTE: Before starting the app, you might need to run:

```console
npm audit fix
```

#### RUNNING THE APP

Before running the app, you'll need to prepare your .env file. Refer to the .env.example file for this. If you want to run the custom twitchbot for commands (without Spotify integration), you do not have to assign values to variables starting with "SPOTIFY_". 

```console
npm run dev & node ./server/server.js
```
NOTE: On Windows, you will need to run these commands each in their own cmd:

```console
npm run dev
```

AND

```console
node ./server/server.js
```

<img width="1263" height="671" alt="image" src="https://github.com/user-attachments/assets/bae93b91-bc09-4884-86da-82675fa706c3" />


## COMMAND KEYWORDS:

Placeholder syntax looks like this:

```
${KEYWORD}
```

#### KEYWORDS:

##### CHATBOT KEYWORDS:
| Keyword | Description |
| --- | --- |
| `mention` | Repeats whatever came after the command. For example, in pre-prepared messages, it can be used to mention the specified username |
| `user` | Fills in the username of whoever used the command |

##### SPOTIFY KEYWORDS:

| Keyword | Description |
| --- | --- |
| `spotify.currentSong` | Fills in the title of the currently playing song |
| `spotify.currentArtist` | Fills in the artist currently playing (or multiple artists if there is more than one) |
| `spotify.queueSong` | Fills in the title of the song added to the queue |
| `spotify.queueArtist` | Fills in the artist whose song has been added to the queue |
| `spotify.nextSong` | Fills in the title of the next song in the queue |
| `spotify.nextArtist` | Fills in the name of the artist whose song is next in the queue |
| `spotify.when` | Fills in the estimated time until the song added to the queue by the user is played |
| `spotify.whenSong` | Fills in the title of the requested song |
| `spotify.whenArtist` | Fills in the artist of the requested song |

## SPOTIFY COMMAND SHOWCASE:

#### ADDING SONGS TO QUEUE (INPUT: Spotify links, text):

https://github.com/user-attachments/assets/fec3116f-d702-4856-8b92-2f84f28e2cde

#### ADDING SONGS TO QUEUE WITH YOUTUBE LINK:

https://github.com/user-attachments/assets/0278a98b-06e4-4b8a-9db6-921e6bac3eab

#### WHEN: 

https://github.com/user-attachments/assets/c02c70d3-8e6b-4e17-841b-fa94ff1feb23

## DASHBOARD UI SHOWCASE:

<img width="1263" height="671" alt="image" src="https://github.com/user-attachments/assets/c57151a9-efec-42f6-b07f-2c8a3704ff6f" />
