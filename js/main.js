var BASE_URL = 'https://api.spotify.com/v1/';
var SEARCH_LIMIT = 1;
var RELATED_LIMIT = 4;
var searchResultData = {};

$(document).ready( function() {

  $(".button-collapse").sideNav();

  $('.search-panel button').click(function(e){
    e.preventDefault();
    $('.card-panel.search-panel').css('margin-top', '5%');
    $('.artist').removeClass('hidden').addClass('animated bounceInDown');
    $('.related-artists').removeClass('hidden').addClass('animated bounceInDown').css('animation-delay', '0.5s');
    var artist = $('#artist_name').val();
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
      $('.primary-artist-img').css({"width": "100%","height": $('.card').css("width"), "background-image": "url(" + data.artists.items[0].images[0].url + ")", "background-size": "cover", "background-position": "top center"});
      $('.primary-artist-name').html('<i class="mdi-navigation-more-vert right"></i>' + data.artists.items[0].name);
      getRelatedArtists(data.artists.items[0].id);
      getTopTracks(data.artists.items[0].id, $('.artist .card'));
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
        element.find('.card-reveal p').html("<span>Most Popular Track on Spotify:</span> " + data.tracks[0].name);
    }
  });
}

$(window).resize(function(){
  $('.related-artist-img').css("height", $('.related-artists .card').css("width"));
  $('.primary-artist-img').css("height", $('.card').css("width"));
});


});


// THINGS TO DO: Create a function for when an error occors. A recall of the animations when the user clicks "search" again. Unbreak the menu when it's responsive.