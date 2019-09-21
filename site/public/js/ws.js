// WEBSOCKET "API" HERE
var WS = {
  init:         function() {
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
      console.log(`[message] Data received from server: ${event.data}`);

      data = JSON.parse(event.data)

      console.log(data)

      if(data.type === "queue") {
        WS.queue = data.data;
        if(WS.queue.length > 0 && WS.queueIndex == -1) {
          WS.queueIndex = 0
          App.initialize();
        }
        else {
          WS.queueIndex = data.queueIndex
        }
      } 
      else if(!WS.isMaster() && data.broadcast) {
        WS.queueIndex = data.queueIndex
        switch (data.type) {
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
    return WS.current()
  },

  next: function() {
    if(WS.queueIndex < WS.queue.length - 1) {
      WS.queueIndex += 1
    }
    return WS.current()
  },

  raw:          new WebSocket("ws://jump0.ty-po.com/ws"),

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

WS.init()
