//Extending the exsting SC global
SC.ready  = false;

var iframe = document.querySelector('.iframe');
iframe.src = "https://w.soundcloud.com/player/?url=http://api.soundcloud.com/users/1539950/favorites"
var widget = SC.Widget(iframe);


SC.play   = function() {
  if(SC.ready) {
    widget.play()
  }
};

SC.pause  = function() {
  if(SC.ready) {
    widget.pause()
  }
};

SC.seek   = function(time) {};

SC.lookup = function(url, cb) {
  cb(url)
}

SC.load   = function(url, cb) {
  if (SC.ready) {
    SC.ready = false;
  }
  widget.load(url, {callback: function(){ SC.ready=true }})
};


SC.getMetadata = function(url, cb) {

  widget.getCurrentSound(function(raw_metadata) {

    console.log(raw_metadata)

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
