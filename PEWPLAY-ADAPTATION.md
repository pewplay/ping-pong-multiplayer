# Ping Pong Multiplayer for PewPlay

This directory contains the original static game adapted for the PewPlay game template. Open `index.html` to play.

`game.json` holds the game page text. `preview.png` and `cover.png` provide the page images. The PewPlay workflow checks pushes to `preview` and `main`. The game remains a draft until you remove `"draft": true` after reviewing it.

Game controls: Open the game on two screens. Choose Left on one and Right on the other, enter the same room code and move your paddle to return the ball.

Online multiplayer uses the Firebase project configured in `script.js`. Verify that its database and access rules are still available before publication.
