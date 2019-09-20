//Extending the exsting SC global
SC.ready  = false;

SC.play   = function() {
  if(SC.ready) {
    SC.track.play()
  }
};

SC.pause  = function() {
  if(SC.ready) {
    SC.track.pause()
  }
};

SC.seek   = function(time) {};

SC.load   = function(url, cb) {
  if (SC.ready) {
    SC.ready = false;
    SC.track.kill();
  }
  SC.stream(url).then(function(player) {
    SC.track = player;
    SC.ready = true;
    cb();
  })
};

SC.getMetadata = function(url, cb) {

  SC.get(url).then(function(raw_metadata) {

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

SC.initialize({
	client_id: '5519289b32d3c193afafd4c2388a29d7',
	redirect_uri: 'https://example.com/callback'
});

