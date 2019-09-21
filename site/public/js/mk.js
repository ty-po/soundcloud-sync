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
    App.url = WS.current()
    App.load(App.url)
    document.getElementById("init").addEventListener("click", function() {

      App.audio.play().then(_ => {
        // Then we assign listeners for media keys
        navigator.mediaSession.setActionHandler('play', function() {
          if(WS.isMaster()) {
            App.play
          }
        });
        navigator.mediaSession.setActionHandler('pause', function() {
          if(WS.isMaster()) {
            if(App.playing) {
              App.pause();
            }
            else{
              App.play();
            } 
          }
        });
        navigator.mediaSession.setActionHandler('previoustrack', function() {
          if(WS.isMaster()) {
            App.prev()
          }
        });
        navigator.mediaSession.setActionHandler('nexttrack', function() {
          if(WS.isMaster()) {
            App.next()
          } 
        });
      })
      //potentially set a interval to repeatedly play the dummy audio
      document.getElementById("init").innerHTML = "Soundcloud Sync"
    });
  },

  lookup: function(query, cb) {
    SC.lookup(query, cb)
  },

  enqueue: function(url) {
    WS.sendMessage("enqueue", url, true)
  },

  load:   function(url, cb) {
    SC.load(url, function(){
      SC.getMetadata(url, updateMetadata)
      if(cb) {
        cb()
      }
    })
  },
  
  seek:   function(time) {
    console.log("seek " + time)
    WS.sendMessage("seek:"+time)
    SC.seek(time)
  },

  //this function dont work for media keys since we cant pause our takeover audio
  play:   function() {
    WS.sendMessage("play");
    console.log("play");
    SC.play();
    App.audio.play();
    App.playing = true;
  },

  pause:  function() {
    WS.sendMessage("pause");
    console.log("pause");
    SC.pause();
    App.playing = false;
  },

  prev:   function() {
    WS.sendMessage("prev");
    console.log("prev");

    App.url = WS.prev()
    App.load(App.url, App.play)
  },

  next:   function() {
    WS.sendMessage("next");
    console.log("next");

    App.url = WS.next()
    App.load(App.url, App.play)
  },
}


// bind init to app ready
widget.bind("ready", function(eventData) {
  App.initialize()
});

// bind finish to next track gross and specific TODO: refactor
widget.bind("finish", function() { 
  if(WS.isMaster()) {
    App.next()
  }
});
