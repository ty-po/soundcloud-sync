SC.initialize({
	client_id: '5519289b32d3c193afafd4c2388a29d7',
	redirect_uri: 'https://example.com/callback'
});

SC.stream('/tracks/293').then(function(player){
    player.play();
});
