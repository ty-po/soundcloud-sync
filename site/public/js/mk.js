//https://googlechrome.github.io/samples/media-session/audio.html
if (!('mediaSession' in navigator)) {
    ChromeSamples.setStatus('The Media Session API is not yet available. Try Chrome for Android.');
}

// This prevents unnecessary errors when Media Session API is not available.
navigator.mediaSession = navigator.mediaSession || {};
navigator.mediaSession.setActionHandler = navigator.mediaSession.setActionHandler || function() {};
window.MediaMetadata = window.MediaMetadata || function() {};

function updateMetadata(metadata) {
  console.log('updating metadata')
  navigator.mediaSession.metadata = metadata
}

var trackNr = 293
SC.load('/tracks/'+trackNr)
SC.getMetadata('/tracks/'+trackNr, updateMetadata)


//OKAY THIS IS GROSS I KNOW BUT API IS HERE
var App = {
  play:   function() {
    console.log("play");
    SC.play();
  },

  pause:  function() {
    console.log("pause");
    SC.pause();
  },

  prev:   function() {
    console.log("prev");
    trackNr--
    SC.getMetadata('/tracks/'+trackNr, updateMetadata)
    SC.load('/tracks/'+trackNr, SC.play)
  },

  next:   function() {
    console.log("next");
    trackNr++
    SC.getMetadata('/tracks/'+trackNr, updateMetadata)
    SC.load('/tracks/'+trackNr, SC.play)
  },
}

// Then we assign listeners for media keys 
navigator.mediaSession.setActionHandler('play', App.play );
navigator.mediaSession.setActionHandler('pause', App.pause );
navigator.mediaSession.setActionHandler('previoustrack', App.prev );
navigator.mediaSession.setActionHandler('nexttrack', App.next );
