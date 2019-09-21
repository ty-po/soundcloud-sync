// WEBSOCKET "API" HERE
var WS = {
  init:         function() {

    WS.raw.onopen = function(e) {
      console.log("[open] Connection established");
      console.log("Sending user info");
      WS.sendMessage("open")
    };

    WS.raw.onmessage = function(event) {
      console.log(`[message] Data received from server: ${event.data}`);
      if(!WS.isMaster()) {
        //switch message
      }
    };

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

  },

  raw:          new WebSocket("ws://jump0.ty-po.com/ws"),

  ready:        false,

  getUserName:  function() {
    return document.getElementById('username').value
  },

  isMaster:     function() {
    return document.getElementById("leader").checked
  },

  getTrackUrl:  function(cb) {
    return "https://soundcloud.com/nlechoppa/camelot" 
  },

  sendMessage:  function(type, data) {
    var message = {
      user: WS.getUserName(),
      broadcast: WS.isMaster(),
      type: type,
      data: data
    }
    var serialized = JSON.stringify(message)
    console.log(serialized)
    WS.raw.send(serialized)
  }
}

WS.init()
