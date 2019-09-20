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

  playing: false,

  url: null,

  initialize: function() {
    App.url = WS.getTrackUrl()
    App.load(App.url)
    document.getElementById("init").addEventListener("click", function() {

      App.audio.play().then(_ => {
      // Then we assign listeners for media keys
      navigator.mediaSession.setActionHandler('play', App.play );
      navigator.mediaSession.setActionHandler('pause', App.pause );
      navigator.mediaSession.setActionHandler('previoustrack', App.prev );
      navigator.mediaSession.setActionHandler('nexttrack', App.next );
      })
      //potentially set a interval to repeatedly play the dummy audio
      document.getElementById("init").innerHTML = "Soundcloud Sync"
    });
  },

  lookup: function(query, cb) {
    SC.lookup(query, cb)
  },

  queue: function(url) {
    WS.sendMessage("queue:" + url)
  },

  load:   function(url, cb) {
    SC.load(url, function(){
      SC.getMetadata(url, updateMetadata)
      cb()
    })
  },

  //this function dont work for media keys since we cant pause our takeover audio
  play:   function() {
    WS.sendMessage("play");
    console.log("play");
    SC.play();
    App.audio.play();
  },

  pause:  function() {
    if(App.playing) {
      WS.sendMessage("pause");
      console.log("pause");
      SC.pause();
      App.playing = false;
    }
    else{
      WS.sendMessage("play");
      console.log("play");
      SC.play();
      App.playing = true;
    }
  },

  prev:   function() {
    WS.sendMessage("prev");
    console.log("prev");

    App.url = WS.getTrackUrl()
    App.load(App.url, App.play)
  },

  next:   function() {
    WS.sendMessage("next");
    console.log("next");

    App.url = WS.getTrackUrl()
    App.load(App.url, App.play)
  },
}


// bind init to app ready
widget.bind("ready", function(eventData) {
  App.initialize()
});
