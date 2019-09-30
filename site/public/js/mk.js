//https://googlechrome.github.io/samples/media-session/audio.html
if (!('mediaSession' in navigator)) {
    alert('The Media Session API is not yet available. Try Chrome for Android.');
}

// This prevents unnecessary errors when Media Session API is not available.
navigator.mediaSession = navigator.mediaSession || {};
navigator.mediaSession.setActionHandler = navigator.mediaSession.setActionHandler || function() {};
window.MediaMetadata = window.MediaMetadata || function() {};

function updateMetadata(metadata) {
  //console.log('updating metadata')
  //update media preview metadata
  navigator.mediaSession.metadata = metadata
  App.renderQueue()
}

// bind init to app ready
widget.bind("ready", function(eventData) {
  console.log("ready")
  App.initialize()
});

// bind finish to next track gross and specific TODO: refactor
widget.bind("finish", function() { 
  if(WS.isMaster()) {
    App.next()
  }
});

//send timing data up to server regularly
var syncFrames = 50;
var syncCounter = 0;
widget.bind("playProgress", function(data) {
  App.renderPosition(data.currentPosition)
  if(WS.isMaster()) {
    //WS.sendMessage("position", data.currentPosition)

    syncCounter += 1
    if(syncCounter >= syncFrames) {
      WS.sendMessage("sync", data.currentPosition)
      syncCounter = 0
    }
  }
})

//OKAY THIS IS GROSS I KNOW BUT API IS HERE
var App = {

  debug: false,

  currentPosition: 0,
  currentDuration: 0,

  audio: document.querySelector('audio'),

  playing: false,

  url: null,

  initialize: function() {

    document.getElementById("init").addEventListener("click", function() {

      WS.init()

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
      var programStart =  document.getElementById("init")

      programStart.style.display = "none" //Scott this is where you can change 
      //loggin in


      var seekOnClick = function(e) {
        var rect = e.target.getBoundingClientRect();
        var size = e.target.clientWidth
        var x = e.clientX - rect.left;
        //var y = e.clientY - rect.top;
        //console.log(x,size)

        var targetTimecode = App.currentDuration * (x / size)

        if(WS.isMaster()) {
          App.seek(targetTimecode)
        }
      }

      document.getElementById("progress").addEventListener("click", seekOnClick, false);
    });
  },

  setVolume() {
    var vol = document.getElementById("volume").value
    SC.setVolume(vol)
  },

  lookup: function(query, cb) {
    SC.lookup(query, cb)
  },

  loadPlaylist: function(url) {
    SC.loadPlaylist(url, function(track) {
      App.enqueue(track)
      App.load(WS.current())
    })
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

  renderPosition: function(position) {
    SC.getDuration(function(data) {
      App.currentDuration = data
    })

    App.currentPosition = position

    document.getElementById("progress-bar").style.width = App.currentPosition/App.currentDuration * 100 + "%"
  },

  renderQueueInProgress: false,
  renderQueueQueued: false,
  renderQueue: function() {
    var queue = WS.queue
    var i = WS.queueIndex

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
        if(key === "artwork") {
          var img = document.createElement('img')
          img.src = ["403", "null", null].includes(metadata[key])
            ? "https://image.flaticon.com/icons/png/128/2034/2034602.png" 
            : metadata[key]
          img.height = 100
          img.width = 100
          td.innerHTML = ""
          td.appendChild(img)
        }
        if(key === "url") {
          var a = document.createElement('a')
          a.href = metadata[key]
          a.target = "_blank"
          a.innerHTML = "link"
          td.innerHTML = ""
          td.appendChild(a)
        }

        tr.appendChild(td)
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

    var checkCompletion = function() {
      current_queue_length = WS.queue.length
      var table = document.getElementById('queue')

      // render all songs on playlist
      //if(queue.length === table.rows.length)
      //only render next songs and currently playing
      if(queue.length - i === table.rows.length) {
        //mark this render as done and sort
        App.renderQueueInProgress = false;
        sortTable()
        
        //if our currently loaded queue is larger than the working queue rerun the render
        if (current_queue_length !== queue.length) {
          App.renderQueue()
        }
        
        //if we have an outstanding rerender, run it and unmark rerender bit 
        else if(App.renderQueueQueued) {
          App.renderQueue()
          App.renderQueueQueued = false
        }
        
      }
      else {
        setTimeout(checkCompletion, 250)
      }
    }
    
    var createTable = function() {
      var table = document.getElementById('queue')
      table.innerHTML = ""
      if (i != -1) {
        App.renderQueueInProgress = true;
        queue.forEach(function(item, index) {
          SC.getMetadata(item, function(metadata) {
            // render all songs on playlist
            //if(true) {
            //only render next songs and current song
            if(index >= i) {
              var row = createTableRow(metadata, index, i)
              table.appendChild(row)
            }
          })
        })
        setTimeout(checkCompletion, 1000)
      } 
    }

    if(!App.renderQueueInProgress) {
      createTable()
    }
    else {
      App.renderQueueQueued = true
    }
  },

  load:   function(url, cb) {
    if(App.debug) console.log("loading")
    SC.load(url, function(){
      App.synced = false
      App.playing = false
      SC.getCurrentMetadata(updateMetadata)
      if(cb) {
        cb()
      }
    })
  },
  
  
  synced: false,
  syncOffset: 0,
  sync:   function(trackTime, broadcastTime) {

    var playerTime = SC.getTime(function(playerTime) {
      var clientTime = Date.now();

      //I think I want these to be equal
      var eventOffset = clientTime - broadcastTime
      var playerOffset = playerTime - trackTime

      var targetTime = trackTime + (eventOffset) //+ App.syncAdjustment
      var syncAdjustment = eventOffset - playerOffset

      if(App.debug) console.log("Sync", syncAdjustment, App.synced)

      if (Math.abs(syncAdjustment) > 75) { // if we are way off likely the track is still loading
        App.seek(targetTime)
        App.synced = false
      }
      else if(Math.abs(syncAdjustment) > 5 && !App.synced) {
        App.syncOffset = (syncAdjustment + App.syncOffset)
        if(App.debug) console.log("Offset", App.syncOffset)
        App.seek(targetTime + App.syncOffset)
      }
      else {
        App.synced = true
      }
    })
  },


  seek:   function(time) {
    App.synced = false
    if(App.debug) console.log("seek " + time)
    WS.sendMessage("seek:"+time)
    SC.seek(time)
  },

  //this function dont work explicitly for media keys since we cant pause our takeover audio
  play:   function() {
    App.audio.play();

    App.playing = true;
    WS.sendMessage("play");
    if(App.debug) console.log("play");
    App.setVolume();
    SC.play();


  },

  pause:  function() {

    App.playing = false;
    WS.sendMessage("pause");
    if(App.debug) console.log("pause");
    SC.pause();


  },

  prev:   function() {
    WS.sendMessage("prev");
    if(App.debug) console.log("prev");

    App.url = WS.prev()
    App.load(App.url, App.play)
  },

  next:   function() {
    WS.sendMessage("next");
    if(App.debug) console.log("next");

    App.url = WS.next()
    App.load(App.url, App.play)
  },
}
