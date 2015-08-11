$(document).ready( function() {

  var BASE_URL = 'https://api.spotify.com/v1/';
  var SEARCH_LIMIT = 1;
  var RELATED_LIMIT = 4;
  var searchResultData = {};

  // On click, activate search
  $('.search-panel button').click(function(e){
    e.preventDefault();
    var artist = $('#artist_name').val();
    $('.artist').addClass('hidden');
    $('.related-artists').addClass('hidden');
    searchArtists(artist);
  });

  function searchArtists(query) {
    var oData = {
      q: query,
      type: 'artist',
      limit: SEARCH_LIMIT,
      offset: 0,
      market: 'US'
    };

    var url = BASE_URL+'search?q='+query;
    $.ajax ({
      url: url,
      data: oData,
      dataType: 'json',
      type: 'GET',
      success: function(data){
        if (data.artists.items.length === 0) {
          $('.card-panel.search-panel').css('margin-top', '10%');
          alert("Artist by the name of " + query + " doesn't appear to exist. Let's try that again!");
        } else {
            $('.artist').removeClass('hidden');
            $('.related-artists').css('animation-delay', '0.5s').removeClass('hidden');
            $('.card-panel.search-panel').css('margin-top', '5%');
            $('.primary-artist-img').css({"width": "100%","height": $('.card').css("width"), "background-image": "url(" + data.artists.items[0].images[0].url + ")", "background-size": "cover", "background-position": "top center"});
            $('.primary-artist-name').html('<i class="mdi-navigation-more-vert right"></i>' + data.artists.items[0].name).append("<br><iframe src='https://embed.spotify.com/follow/1/?uri=spotify:artist:" + data.artists.items[0].id + "&size=basic&theme=light' width='200' height='25' scrolling='no' frameborder='0' style='border:none; overflow:hidden;' allowtransparency='true'></iframe>");
            getRelatedArtists(data.artists.items[0].id);
            getTopTracks(data.artists.items[0].id, $('.artist .card'));

        }
      }
    });
  }

  function getRelatedArtists(id){
    $.ajax({
      url: BASE_URL + "artists/" + id + "/related-artists",
      type: 'GET',
      success: function(data){
        var relatedCards = $('.related-artists .card');
        var relatedImg = $('.related-artist-img');
        var cardName = $('.card-content .related-artist-name');
        var revealName = $('.card-reveal .related-artist-name');

        for(var i = 0; i < 4; i++){
          var artist = data.artists[i];
          relatedImg.eq(i).css({"width": "100%","height": $('.related-artists .card').css("width"), "background-image": "url(" + artist.images[0].url + ")", "background-size": "cover", "background-position": "top center"});
          cardName.eq(i).addClass("truncate").html('<i class="mdi-navigation-more-vert right"></i>' + artist.name);
          revealName.eq(i).html('<i class="mdi-navigation-more-vert right"></i>' + artist.name).css("font-size", "20px");
          getTopTracks( artist.id, relatedCards.eq(i) );
        }
      }
    });
  }

  function getTopTracks(id, element) {
    $.ajax({
      url: BASE_URL + "artists/" + id + "/top-tracks?country=US",
      type: 'GET',
      success: function(data){
          element.find('.card-reveal p').html("<span>Most Popular Track on Spotify:</span> " + data.tracks[0].name + "<br><br><iframe src='https://embed.spotify.com/?uri=spotify:track:" + data.tracks[0].id + "' width='100%' height='80' frameborder='0' allowtransparency='true'></iframe>");
      }
    });
  }

// Maintaining perfect square dimensions on window resize
  $(window).resize(function(){
    $('.related-artist-img').css("height", $('.related-artists .card').css("width"));
    $('.primary-artist-img').css("height", $('.card').css("width"));
  });


});