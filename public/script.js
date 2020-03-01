init();

function init() {
    // Display modal (prompt in bootstramp) when launch app
    $('#roomNameModal').modal({
        keyboard: false,
        backdrop: 'static',
        focus: true,
        show: true
    });
}

/*******************************
 * DOM
 * *****************************/
// Set room button
document.querySelector("#roomName-submit").onclick = () => {
    event.preventDefault()

    const roomName = document.querySelector("#room-name").value;
    console.log(roomName);

    if (roomName.length != 0) {
        initRoom(roomName);

        document.querySelector('h3').innerHTML = `You are in <strong>${room}</strong>`;

        // Start getting realtime update from Firestore
        getRealTimeUpdate();

        $('#roomNameModal').modal('hide')
    } else {
        // If input text is empty, display warning.
        document.querySelector("#room-name").style.boxShadow = '0 0 5px red';

        setTimeout(() => {
            document.querySelector("#room-name").style.boxShadow = null;
        }, 1500);
    }
};

// Change video button
document.querySelector("#youtubeId-submit").onclick = () => {
    event.preventDefault()

    const youtubeId = document.querySelector("#youtubeId").value;

    if (youtubeId.length === 11) {
        updateVideo(youtubeId);
    } else {
        // If input text is empty, display warning.
        document.querySelector("#youtubeId").style.boxShadow = '0 0 5px red';

        setTimeout(() => {
            document.querySelector("#youtubeId").style.boxShadow = null;
        }, 1500);
    }
};

// Seek progress bar
document.querySelector("#progress-bar").addEventListener('mouseup', e => {
    // Calculate the new time for the video.
    console.log(e.target.value)
    const newTime = player.getDuration() * e.target.value;

    // Update time to database.
    updateTime(newTime);
})

// Control (Play/Pause) button.
document.querySelector("#control").onclick = (e) => {
    console.log(e.target.innerText);

    if (e.target.innerText == "play_arrow") {
        updateState(YT.PlayerState.PLAYING);
    } else {
        updateState(YT.PlayerState.PAUSED);
    }

}

// Update the value of our progress bar accordingly.
function updateProgressBar(playbackTime) {
    console.log(`Update progreess bar to ${playbackTime}`);
    document.querySelector("#progress-bar").value = (playbackTime / player.getDuration());
}

// Update Play/Pause button accordingly.
function updateControl(input) {
    console.log(`Update control to ${input}`);
    document.querySelector("#control").innerText = input;
}

/*******************************
 * Youtube iFrame Player
 * *****************************/
// Loads the iFrame Player API code asynchronously.
const tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Creates <iframe> and Youtube Player.
let player;
let videoId = 'Hx-aXJ8skgk'; // default video id
let db;
let room;
let roomRef;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        // Change default video here.
        videoId: videoId,
        playerVars: { 'autoplay': 0, 'controls': 0 },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// The API calls this function when the player's state changes.
// We will not use this call for seeking change due to its unreliability.
let ignoreChange = false;

function onPlayerStateChange(event) {
    if (ignoreChange) {
        console.log("Player state change ignored.")

    } else if (event.data == YT.PlayerState.PAUSED) {
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


function initRoom(roomName) {
    room = roomName;

    db = firebase.firestore();
    roomRef = db.doc("rooms/" + room);

    // Create room if doeesn't exist
    roomRef.get()
        .then((docSnapshot) => {
            if (!docSnapshot.exists) {
                roomRef.set({ videoId: videoId }) // create the document
            }
        });
}

// When the Youtube video player is ready.
function onPlayerReady() {
    // Yes it is intentionally left empty. DO NOT remove this function!
}

// Get realtime updates from other users.
function getRealTimeUpdate() {
    roomRef.onSnapshot(function(room) {
        if (room && room.exists) {
            const myData = room.data();
            console.log(myData)

            const playbackTime = (Date.now() - myData.currentTime) / 1000 + myData.elapsedTime;

            if (myData.videoId == null) {
                // Update to default Video ID if it is missing on FireCloud.
                updateVideo(videoId);
            } else if (videoId != myData.videoId) {
                // Change video
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
                updateControl('pause');
            } else if (myData.state == YT.PlayerState.PAUSED) {
                pauseVideo();
                updateControl('play_arrow');
            }

        }
    });
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