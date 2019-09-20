//Extending the exsting SC global
var iframe = document.querySelector('.iframe');
initialTarget = "http://api.soundcloud.com/users/1539950/favorites"
iframe.src = "https://w.soundcloud.com/player/?url=" //+ initialTarget
var widget = SC.Widget(iframe);


SC.play   = function() {
  widget.play()
};

SC.pause  = function() {
  widget.pause()
};

SC.seek   = function(time) {};

SC.lookup = function(url, cb) {
  cb(url)
}

SC.load   = function(url, cb) {
  widget.load(url, {callback: cb})
};


SC.getMetadata = function(url, cb) {

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
