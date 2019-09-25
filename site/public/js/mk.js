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

  clearQueue: function() {
    WS.sendMessage("clear", null, true)
  },

  shuffleQueue: function() {
    WS.sendMessage("shuffle", null, true)
  },

  renderQueue: function(queue, i) {
    var createTableRow = function(metadata, rowIndex, playingIndex) {
      var tr = document.createElement('tr')

      var td = document.createElement('td')
      td.innerHTML = rowIndex + 1
      td.style.fontWeight = rowIndex === playingIndex ? "bold" : "normal"
      tr.appendChild(td)

      Object.keys(metadata).forEach(function(key, _) {
        td = document.createElement('td')
        td.innerHTML = metadata[key]
        td.style.fontWeight = rowIndex === playingIndex ? "bold" : "normal"
        tr.appendChild(td)
        //handle case for artwork array
      })
      return tr
    }

    // thanks to https://www.w3schools.com/howto/howto_js_sort_table.asp
    var sortTable = function() {
      var table = document.getElementById('queue')
      var rows, switching, i, x, y, shouldSwitch;
      switching = true;
      while (switching) {
        switching = false;
        rows = table.rows;
        for (i = 0; i < (rows.length - 1); i++) {
          shouldSwitch = false;
          x = rows[i].getElementsByTagName("TD")[0];
          y = rows[i + 1].getElementsByTagName("TD")[0];
          if (Number(x.innerHTML) > Number(y.innerHTML)) {
            shouldSwitch = true;
            break;
          }
        }
        if (shouldSwitch) {
          rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
          switching = true;
        }
      }
    }

    var table = document.getElementById('queue')
    table.innerHTML = ""

    if (i != -1) {
      queue.forEach(function(item, index) {
        SC.getMetadata(item, function(metadata) {
          var row = createTableRow(metadata, index, parseInt(i))
          table.appendChild(row)
        })
      })
      setTimeout(sortTable, 2000)
    }
  },

  load:   function(url, cb) {
    SC.load(url, function(){
      SC.getCurrentMetadata(updateMetadata)
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
