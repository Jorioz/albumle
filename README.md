
# albumle

My first full-stack web application. Can you try and guess the album cover in 5 tries or less? Each attempt reduces the pixelation, making it slightly easier on each guess. Inspired by Wordle, come back everyday to play again to a new album.

Try playing for yourself at [albumle.app](https://albumle.app)!



## FAQ

#### How was the web app built?

The frontend is built with HTML, CSS, Javascript, as well as some libraries and frameworks such as Bootstrap & jQuery.

For the backend, Node.js is used together with Express.js. Hosted on Firebase Functions.

#### How does getting music data work?

TLDR, I use Spotify's API to fetch playlist data. This data includes the artists name, album name, and cover image. All this data is then stored to Firebase. When you (the user) visit the website, this data is retrieved from the database and then displayed to you.

As for the daily album update, I simply have a cron job that runs my backend code at midnight EST to store new data to Firebase.


## Roadmap

While albumle is complete, there are some quality-of-life updates I want to eventually add:

- Various genres to choose from (currently is mainly hip-hop).

- Endless mode (if you want to play through previous days).

- AI generated jeopardy-style hints.

- Streak tracker.

- Share score feauture after daily game.

