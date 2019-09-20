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
  //update media preview metadata
  navigator.mediaSession.metadata = metadata
}

//OKAY THIS IS GROSS I KNOW BUT API IS HERE
var App = {

  audio: document.querySelector('audio'),

  initialize: function() {
    var url = WS.getTrackUrl()
    App.load("http://api.soundcloud.com/users/1539950/favorites")

    App.audio.play().then(_ => {
    // Then we assign listeners for media keys
    navigator.mediaSession.setActionHandler('play', App.play );
    navigator.mediaSession.setActionHandler('pause', App.pause );
    navigator.mediaSession.setActionHandler('previoustrack', App.prev );
    navigator.mediaSession.setActionHandler('nexttrack', App.next );
    })
  },

  lookup: function(query, cb) {
    SC.lookup(query, cb)
  },

  load:   function(url, cb) {
    SC.getMetadata(url, updateMetadata)
    SC.load(url, cb)
  },

  play:   function() {
    WS.sendMessage("play");
    console.log("play");
    navigator.mediaSession.playbackState="playing"
    SC.play();
  },

  pause:  function() {
    WS.sendMessage("pause");
    console.log("pause");
    SC.pause();
  },

  prev:   function() {
    WS.sendMessage("prev");
    console.log("prev");
    trackNr--
    App.load('/tracks/' + trackNr, App.play)
  },

  next:   function() {
    WS.sendMessage("next");
    console.log("next");
    trackNr++
    App.load('/tracks/' + trackNr, App.play)
  },
}


// bind init to app ready
widget.bind("ready", function(eventData) {
  App.initialize()
});
