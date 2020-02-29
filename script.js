// This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// This function creates an <iframe> (and YouTube player)
// after the API code downloads.
var player;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        width: "100%",
        videoId: 'M7lc1UVf-VE',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// The API will call this function when the video player is ready.
function onPlayerReady(event) {
    // event.target.playVideo();
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

    console.log(player.getCurrentTime())

    if (event.data == YT.PlayerState.PAUSED) {
        color = "#DD2C00"; // paused = red
        sendPauseVideo();
    } else if (event.data == YT.PlayerState.PLAYING) {
        color = "#33691E"; // playing = green
        sendPlayVideo();
    }


    // Use border color as notification
    if (color) {
        changeBordereColor(color)
        setTimeout(() => { changeBordereColor("#000000") }, 1500); // notification timeout
    }
}

function changeBordereColor(color) {
    const player = document.querySelector('#player')
    player.style.borderColor = color;
}


function sendPlayVideo() {
    console.log("Send Play Video");
}

function sendPauseVideo() {
    console.log("Send Pause Video");
}

// function sendSeekVideo() {
//     console.log("Send Play Video");
// }


function playVideo() {
    player.playVideo();
}

function pauseVideo() {
    player.pauseVideo();
}

function seekVideo(second) {
    player.seekTo(second, true)
}