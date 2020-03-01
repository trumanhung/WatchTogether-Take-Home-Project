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
        // Change default video here.
        videoId: "sCNrK-n68CM",
        playerVars: { 'autoplay': 0, 'controls': 0 },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

let ignoreChange = false;

// The API calls this function when the player's state changes.
// We will not use this call for seeking change due to its unreliability.
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PAUSED) {
        console.log("Paused");

        notifyBordereColor("#DD2C00"); // paused = red
        updateState(YT.PlayerState.PAUSED);


    } else if (event.data == YT.PlayerState.PLAYING) {
        console.log("Played");

        notifyBordereColor("#33691E"); // paused = red
        updateState(YT.PlayerState.PLAYING);

    }

}

// Use border color as notification
function notifyBordereColor(color) {
    const player = document.querySelector('#player')
    player.style.borderColor = color;

    // notification timeout
    setTimeout(() => { notifyBordereColor("#000000") }, 2500);
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
    console.log(`Seeking to ${second}`);
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

            const playbackTime = (Date.now() - myData.currentTime) / 1000 + myData.elapsedTime;

            // Change video
            if (videoId != myData.videoId) {
                videoId = myData.videoId;
                player.loadVideoById({ videoId: videoId, startSeconds: playbackTime });
                updateProgressBar(playbackTime);
            } else if (updateTime) {
                // Seek video dispite the state.
                seekVideo(playbackTime);
                updateProgressBar(playbackTime);
            }

            // Play or Pause depending on the state.
            if (myData.state == YT.PlayerState.PLAYING) {
                playVideo();
            } else if (myData.state == YT.PlayerState.PAUSED) {
                pauseVideo();
            }

        }
    })
}

// Update state in FireStore.
function updateState(currentState) {
    ignoreChange = true

    roomRef.update({
            state: currentState,
            updateTime: false
        })
        .then(function() {
            console.log(`State updated to ${currentState}`);
            ignoreChange = false;
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
}

// Update elapsed time in FireStore.
function updateTime(currentElapsedTime) {
    ignoreChange = true

    roomRef.update({
            currentTime: Date.now(),
            elapsedTime: currentElapsedTime,
            updateTime: true
        })
        .then(function() {
            console.log(`Elapsed time updated to ${currentElapsedTime}`);
            ignoreChange = false;
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
}


// Update video Id in FireStore.
function updateVideo(youtubeId) {
    ignoreChange = true

    roomRef.update({
            videoId: youtubeId,

            // Reset playback info
            currentTime: Date.now(),
            elapsedTime: 0,
            state: YT.PlayerState.PLAYING,
            updateTime: true
        })
        .then(function() {
            console.log(`Video Id updated to ${youtubeId}`);
            ignoreChange = false;
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

// Seek
document.querySelector("#progress-bar").addEventListener('mouseup', e => {
    // Calculate the new time for the video.
    console.log(e.target.value)
    const newTime = player.getDuration() * e.target.value;

    // Update time to database.
    updateTime(newTime);
})


document.querySelector("#control").onclick = (e) => {
    console.log(e.target.innerText);

    if (e.target.innerText == "play_arrow") {
        updateState(YT.PlayerState.PLAYING);
        e.target.innerText = 'pause';
    } else {
        updateState(YT.PlayerState.PAUSED);
        e.target.innerText = 'play_arrow';
    }

    // document.querySelector(".pause").style.display = 'initial !important';
    // document.querySelector(".play").style.display = 'none';
}

// document.querySelector(".pause").onclick = () => {
//     pauseVideo(YT.PlayerState.PAUSED);

//     document.querySelector(".play").style.display = 'initial !important';
//     // document.querySelector(".pause").style.display = 'none';
// }


// Update the value of our progress bar accordingly.
function updateProgressBar(playbackTime) {
    console.log("Update ProgressBar: " + (playbackTime / player.getDuration()))
    document.querySelector("#progress-bar").value = (playbackTime / player.getDuration());
}