// WEBSOCKET "API" HERE
var WS = {
  init:         function() {

    WS.raw = new WebSocket("ws://jump0.ty-po.com/ws")

    WS.raw.onclose = function(event) {
      if (event.wasClean) {
        console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
      } else {
        // e.g. server process killed or network down
        // event.code is usually 1006 in this case
        console.log('[close] Connection died');
      }
    };

    WS.raw.onerror = function(error) {
      console.log(`[error] ${error.message}`);
    };
    
    WS.raw.onopen = function(e) {
      console.log("[open] Connection established");
      console.log("Sending user info");
      WS.sendMessage("open")
    };

    WS.raw.onmessage = function(event) {
      //console.log(`[message] Raw data received from server: ${event.data}`);

      data = JSON.parse(event.data)

      if(!["position"].includes(data.type)) {
        console.log(data)
      }

      if(["init", "sync"].includes(data.type)) {
        WS.queue = data.data
        WS.queueIndex = data.queueIndex
        App.url = WS.current();
        var position = data.position
        App.load(App.url, function() {
          console.log(data)
          App.seek(position)
        })
      }
      else if(["queue", "shuffle", "clear"].includes(data.type)) {
        var initialQueueIndex = WS.queueIndex

        WS.queue = data.data;
        WS.queueIndex = data.queueIndex;
        if(WS.queue.length > 0 && WS.queueIndex == -1) { //if the queue has an item and iterator is uninit, set to 0
          WS.queueIndex = 0
          App.url = WS.current()
          App.load(App.url)
        }

        if(["shuffle","clear"].includes(data.type)) {
          App.url = WS.current()
          App.load(App.url)
        }

        App.renderQueue();
      }
      else if(!WS.isMaster() && data.broadcast) {
        WS.queueIndex = data.queueIndex
        switch (data.type) {
          case "position":
            if(!App.playing) {
              App.play();
            }
            break;
          case "play":
            App.play();
            break;
          case "pause":
            App.pause();
            break;
          case "prev":
            App.prev();
            break;
          case "next":
            App.next();
            break;
          case "seek":
            App.seek(data.data);
            break;
        }
      }
    };
    //set interval to request 
  },

  queue: [],

  queueIndex: -1,

  current: function() {
    if(WS.queueIndex != -1) {
      return WS.queue[WS.queueIndex]
    }
  },

  prev: function() { 
    if(WS.queueIndex > 0) {
      WS.queueIndex -= 1
    }
    App.renderQueue(WS.queue, WS.queueIndex)
    return WS.current()
  },

  next: function() {
    if(WS.queueIndex < WS.queue.length - 1) {
      WS.queueIndex += 1
    }
    App.renderQueue(WS.queue, WS.queueIndex)
    return WS.current()
  },

  raw: null,

  ready:        false,

  getUserName:  function() {
    return document.getElementById('username').value
  },

  isMaster:     function() {
    return document.getElementById("leader").checked
  },

  sendMessage:  function(type, data, broadcast) {
    var message = {
      user: WS.getUserName(),
      broadcast: (WS.isMaster() || broadcast) ? true : false,
      type: type,
      data: data,
      queueIndex: WS.queueIndex
    }
    var serialized = JSON.stringify(message)
    console.log(serialized)
    WS.raw.send(serialized)
  }
}
