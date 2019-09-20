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
  //make my gross ui populate
  document.getElementById("title").innerHTML = metadata.title;
  document.getElementById('artist').innerHTML = metadata.artist;
  document.getElementById('album').innerHTML = metadata.album;
  document.getElementById('artwork').src = metadata.artwork[0].src;
}

//OKAY THIS IS GROSS I KNOW BUT API IS HERE
var App = {
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

// Do Inital load
var url = WS.getTrackUrl()
var trackNr = 293
App.load('/tracks/'+trackNr)

// Then we assign listeners for media keys 
navigator.mediaSession.setActionHandler('play', App.play );
navigator.mediaSession.setActionHandler('pause', App.pause );
navigator.mediaSession.setActionHandler('previoustrack', App.prev );
navigator.mediaSession.setActionHandler('nexttrack', App.next );
