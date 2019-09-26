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
  widget.seekTo(time) 
};

SC.setVolume = function(vol) {
  widget.setVolume(vol);
};

SC.lookup = function(url, cb) {
  SC.resolve(url).then(function(data) {
    cb(data)
  })
}

SC.loadPlaylist = function(playlist_url, cb) {
  var capturePlaylist = function(playlist) { 
    
    var playlistLoaded = true

    playlist.forEach(function(track, key) {
      if(!track.permalink_url) {
        playlistLoaded = false
      }
    })
  
    if(playlistLoaded) {
      SC.fetchMetadataCache()
      playlist.forEach(function(track, key) { 
        metadata = SC.marshalMetadata(track)
        track_url = track.permalink_url
        SC.updateMetadataCache(metadata)
        cb(track_url)
      })
    }
    else {
      setTimeout(getSounds, 1000)
    }
  };
  
  var getSounds = function() {
    widget.getSounds(capturePlaylist)
  };


  widget.load(playlist_url, {callback: getSounds})
}

SC.load   = function(url, cb) {
  widget.load(url, {callback: cb})
};

SC.metadataCache = {};

SC.fetchMetadataCache = function(url) {
  var localstore = window.localStorage.getItem('soundcloud-metadata-cache')
  if(localstore) {
    SC.metadataCache = JSON.parse(localstore)
  }
  if(url in SC.metadataCache) {
    return SC.metadataCache[url]
  }
  else {
    return null
  }
}


SC.updateMetadataCache = function(metadata) {
  //push metadata
  if(metadata.url) {
    SC.metadataCache[metadata.url] = metadata
  }
  window.localStorage.setItem('soundcloud-metadata-cache', JSON.stringify(SC.metadataCache));
}

SC.marshalMetadata = function(data) {
  var metadata = {
    source: 'soundcloud',
    artist: data.user.username,
    track: data.title,
    artwork: data.artwork_url,
    url: data.permalink_url
  }
  return metadata
}

SC.getMetadata = function(url, cb) {
  
  var generateBarebonesMetadata = function(inputUrl) {
    var reduced = url.replace("https://soundcloud.com/", "").split('/')
    var artist = reduced[0]
    var track = reduced[1]
    if(track) {
      track = track.split('?')[0]
    }
    return {
      source: 'soundcloud',
      artist: artist, 
      track: track,
      artwork: '403',
      url: inputUrl
    }
  }


  if(SC.fetchMetadataCache(url)) {
    cb(SC.fetchMetadataCache(url))
  }
  else {
    SC.resolve(url)
    .then(function(data) {
      metadata = SC.marshalMetadata(data)
      SC.updateMetadataCache(metadata)
      cb(metadata)
    })
    .catch(function(error) {
      metadata = generateBarebonesMetadata(url)
      SC.updateMetadataCache(metadata)
      cb(metadata);
    })
  }
}

SC.getCurrentMetadata = function(cb) {

  widget.getCurrentSound(function(raw_metadata) {

    SC.fetchMetadataCache()
    SC.updateMetadataCache(SC.marshalMetadata(raw_metadata))

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
