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

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        width: "100%",
        videoId: 'Hx-aXJ8skgk',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// The API calls this function when the player's state changes.
// The function indicates that when playing a video (state=1),
// the player should play for six seconds and then stop.
var done = false;

function onPlayerStateChange(event) {
    // if (event.data == YT.PlayerState.PLAYING && !done) {
    //     setTimeout(stopVideo, 6000);
    //     done = true;
    // }
    var color;

    if (event.data == YT.PlayerState.PAUSED) {
        notifyBordereColor("#DD2C00") // paused = red
        updateState(YT.PlayerState.PAUSED, player.getCurrentTime())
    } else if (event.data == YT.PlayerState.PLAYING) {
        notifyBordereColor("#33691E") // paused = red
        updateState(YT.PlayerState.PLAYING, player.getCurrentTime())
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
    player.playVideo();
}

function pauseVideo() {
    player.pauseVideo();
}

function seekVideo(second) {
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

            let currentTime = myData.currentTime;
            let elapsedTime = myData.elapsedTime;
            let state = myData.state;

            const playbackTime = (Date.now() - currentTime) / 1000 + elapsedTime;

            pauseVideo();
            // Seek video dispite the state.
            seekVideo(playbackTime);

            // Play or Pause depending on the state.
            if (state == YT.PlayerState.PLAYING) {
                playVideo();
            } else if (state == YT.PlayerState.PAUSED) {
                pauseVideo();
            }

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