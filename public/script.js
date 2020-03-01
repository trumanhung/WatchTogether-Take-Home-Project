/*******************************
 * Youtube iFrame Player
 * *****************************/
// Loads the iFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Creates <iframe> and Youtube Player.
var player;
var videoId;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        videoId: videoId,
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

let ignoreChange = false;

// The API calls this function when the player's state changes.
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PAUSED) {
        console.log("Paused");
        if (!ignoreChange) {
            notifyBordereColor("#DD2C00"); // paused = red
            updateState(YT.PlayerState.PAUSED, player.getCurrentTime());
        }

    } else if (event.data == YT.PlayerState.PLAYING) {
        console.log("Played");
        if (!ignoreChange) {
            notifyBordereColor("#33691E"); // paused = red
            updateState(YT.PlayerState.PLAYING, player.getCurrentTime());
        }
    }

}

// Use border color as notification
function notifyBordereColor(color) {
    const player = document.querySelector('#player')
    player.style.borderColor = color;

    // notification timeout
    setTimeout(() => { notifyBordereColor("#000000") }, 1500);
}

function playVideo() {
    console.log("Playing");
    player.playVideo();
}

function pauseVideo() {
    console.log("Pausing");
    player.pauseVideo();
}

function seekVideo(second) {
    console.log("Seeking");
    player.seekTo(second, true)
}


/*******************************
 * FireBase 
 * *****************************/
// Initialize Cloud Firestore through Firebase.
if (firebase.apps.length === 0) {
    firebase.initializeApp({
        apiKey: 'AIzaSyCputhH99bPIEO3YiW7S8SEX-dF4x4Py0w',
        authDomain: 'watchtogether-take-home-projec.firebaseapp.com',
        projectId: 'watchtogether-take-home-projec'
    });
}

let db = firebase.firestore();
// Currently we only have one room.
let roomRef = db.doc("rooms/room1");


// When the Youtube video player is ready.
function onPlayerReady() {
    // Get realtime updates from other users.
    roomRef.onSnapshot(function(room) {
        if (room && room.exists) {
            const myData = room.data();
            console.log(myData)

            let fetchedVideoId = myData.videoId
            let currentTime = myData.currentTime;
            let elapsedTime = myData.elapsedTime;
            let state = myData.state;

            // Change video
            if (videoId != fetchedVideoId) {
                videoId = fetchedVideoId
                player.loadVideoById({ videoId: videoId });
            }

            const playbackTime = (Date.now() - currentTime) / 1000 + elapsedTime;

            ignoreChange = true

            // Seek video dispite the state.
            seekVideo(playbackTime);

            // Play or Pause depending on the state.
            if (state == YT.PlayerState.PLAYING) {
                playVideo();
            } else if (state == YT.PlayerState.PAUSED) {
                pauseVideo();
            }


            setTimeout(() => { ignoreChange = false }, 1000);

        }
    })
}

// Update function used when player state changed.
function updateState(currentState, currentElapsedTime) {
    roomRef.update({
            currentTime: Date.now(),
            elapsedTime: currentElapsedTime,
            state: currentState
        })
        .then(function() {
            console.log(`State updated to ${currentState}`);
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
}


// Update video Id
function updateVideo(youtubeId) {
    roomRef.update({
            videoId: youtubeId,

            // Reset playback info
            currentTime: Date.now(),
            elapsedTime: 0,
            state: YT.PlayerState.PLAYING
        })
        .then(function() {
            console.log(`Video Id updated to ${youtubeId}`);
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
}




/*******************************
 * DOM
 * *****************************/
// Change video
document.querySelector("#youtubeId-submit").onclick = () => {
    event.preventDefault()

    const youtubeId = document.querySelector("#youtubeId").value;

    updateVideo(youtubeId);
};