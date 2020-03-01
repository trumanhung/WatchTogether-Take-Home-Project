# WatchTogether-Take-Home-Project

## Deliverables
- [Screencast](https://youtu.be/7Nn_we9V1zM) on Youtube.
- [Demo](https://watchtogether-take-home-projec.web.app/) available on FireBase Host.
- Dadabase can be viewed using [REST API](https://firestore.googleapis.com/v1/projects/watchtogether-take-home-projec/databases/(default)/documents/rooms).


## Acceptance Criteria
- Go to the current state (e.g. playing video or pause video at a timestamp) when opening the web app.
- If one user conducts an action (play / pause / seek) , then all other users will see the result of said action.
- Extra: Users can change videos.
- Extra: There are rooms that users can join. Each room has its own state (e.g. video id, playback state, elapsed time).


## Tech Stack:
- [IFrame Player API](https://developers.google.com/youtube/iframe_api_reference)
- [Firebase Cloud FireStore](https://firebase.google.com/docs/firestore)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Bootstrap](https://getbootstrap.com/) for a quick style fix.
- [Google Material Icons](https://google.github.io/material-design-icons/)