//Extending the exsting SC global
var iframe = document.querySelector('.iframe');
initialTarget = "http://api.soundcloud.com/users/1539950/favorites"
iframe.src = "https://w.soundcloud.com/player/?url=" //+ initialTarget
var widget = SC.Widget(iframe);

SC.initialize({
  client_id: '5519289b32d3c193afafd4c2388a29d7',
  redirect_uri: 'http://jump0.ty-po.com/callback'
});

SC.play   = function() {
  widget.play()
};

SC.pause  = function() {
  widget.pause()
};

SC.seek   = function(time) {
  
};

SC.lookup = function(url, cb) {
  SC.resolve(url).then(function(data) {
    for (var track in data.tracks)
    {
      cb(data.tracks[track].permalink_url)
    }
  })
}

SC.load   = function(url, cb) {
  widget.load(url, {callback: cb})
};

SC.getMetadata = function(url, cb) {
  var reduced = url.replace("https://soundcloud.com/", "").split('/')
  var artist = reduced[0]
  var track = reduced[1]
  if(track) {
    track = track.split('?')[0]
  }
  cb({'source': 'soundcloud','artist': artist, 'track': track}) //fuck soundcloud and their undocumented unsupported api
}

SC.getCurrentMetadata = function(cb) {

  widget.getCurrentSound(function(raw_metadata) {

    metadata = new MediaMetadata({
      title: raw_metadata.title,
      artist: raw_metadata.user.username,
      album: raw_metadata.release,
      artwork: [
        { src: raw_metadata.artwork_url,   sizes: '100x100',   type: 'image/jpg' },
      ]
    });

    cb(metadata)
  });
}
