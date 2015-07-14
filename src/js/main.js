
var SPOTIFY_SCOPES = 'playlist-read-private playlist-modify-public playlist-modify-private user-library-read user-library-modify user-read-private user-read-email';
var REDIRECT_URL = 'http://localhost/spotify-materialize/index.html';
var SPOTIFY_AUTHORIZE_URL = 'https://accounts.spotify.com/authorize';
var REQUEST_TOKEN_PARAMS = {
  client_id: SPOTIFY_CLIENT_ID,
  response_type: 'token',
  redirect_uri: REDIRECT_URL,
  scope: SPOTIFY_SCOPES,
  show_dialog: true
};
var BUILT_URL = buildURL(SPOTIFY_AUTHORIZE_URL, REQUEST_TOKEN_PARAMS);
var accessToken;
var tokenType;
var expiresIn;
    
    
var spotifyApi = new SpotifyWebApi();



var ls = new localStorageDB('spotify', localStorage);
if (ls.isNew()) {
  ls.createTable('userinfo', ['country', 'display_name', 'email', 'external_urls', 'followers', 'href', 'type', 'images', 'product', 'uri']);
  ls.createTable('logininfo', ['accessToken', 'tokenType', 'retrieved', 'expires']);
  ls.commit();
}

 

  if (window.location.hash !== '') {
    accessToken = getHashValue('access_token');
    tokenType = getHashValue('token_type');
    expiresIn = getHashValue('expires_in');
    console.log('accessToken: ', accessToken);
    console.log('tokenType: ', tokenType);
    console.log('expiresIn: ', expiresIn);
    
    var retrieved = new Date();
    var expires = new Date();
    expires.setSeconds(expires.getSeconds() + expiresIn);
    

    ls.insertOrUpdate('logininfo', {accessToken: accessToken}, {accessToken: accessToken, tokenType: tokenType, retrieved: retrieved, expires: expires});
    ls.commit();    
    
    spotifyApi.setAccessToken(accessToken);    
    
    spotifyApi.getMe()
      .then(function(data) {
        console.log('Me: ', data);
      }, function(err) {
        console.error(err);
      }); 
    
    spotifyApi.getUserPlaylists('peterthomaslane')
      .then(function(data) {
        console.log('User playlists', data);
      }, function(err) {
        console.error(err);
      }); 
    
  }


 
  var BASE_URL = 'https://api.spotify.com/v1/';
  var SEARCH_LIMIT = 5;
  var RELATED_LIMIT = 6;
  var $ajaxlog = $('#ajaxlog');  
  var $searchResults = $('#searchresults');
  var $selectedArtistTemplate = $('#selectedartisttemplate');
  var $relatedArtistTemplate = $('#relatedartisttemplate');
  var $spotifyResults = $('#spotifyresults');  
  var searchResultData = {};

  
  
  
  
  
  
  
  $(document).ajaxComplete(function(event, request, settings) {
    $ajaxlog.append('<li>Request Complete.</li>');
  });
  $(document).ajaxError(function(event, request, settings, thrownError) {
    $ajaxlog.append('<li>Error requesting page <b>' + settings.url + '</b></li>');
    $ajaxlog.append('<li>Error Thrown: <b>' + thrownError + '</b></li>');
  });
  $(document).ajaxSend(function(event, request, settings) {
    $ajaxlog.append('<li>Starting request at ' + settings.url + '</li>');
  });
  $(document).ajaxStart(function() {
    $ajaxlog.append('<li>ajax call started</li>');
  });
  $(document).ajaxStop(function() {
    $ajaxlog.append('<li>ajax call stopped</li>');
  });
  $(document).ajaxSuccess(function(event, request, settings) {
    $ajaxlog.append('<li>Successful Request!</li>');
  });  
  
  $('.modal-trigger').leanModal();
  
  $('#btnsearchartists').on('click', function(e) {
    var query = $('#txtArtistSearch').val();
    if (query.length > 2) {
      $searchResults.html('');      
      searchArtists(query);
    }
  });
  

  $('body').on('click', '.artist', function(e) {
    e.preventDefault();
    selectedIndex = $(this).attr('data-selected-index');
    selectedID = $(this).attr('href');
    selectedArtistData = searchResultData.artists.items[selectedIndex];
    console.log('passed to template1: ', selectedArtistData);
    var $renderedTemplate = $selectedArtistTemplate.tmpl(selectedArtistData);
    console.log('renderedTemplate: ', $renderedTemplate);
    $spotifyResults.html($renderedTemplate);
    getRelatedByID(selectedID);
    //$searchResults.html('');
    //$('#card-toggler').slideToggle(3000);
    $('#searchcard').addClass('hidden');
    $('#hiddenrow').removeClass('hidden').addClass('animated bounceInDown');
  });
  
  
  $('body').on('click', '#searchagainbutton', function(e) {
    $('#searchcard').removeClass('hidden').addClass('animated bounceInDown');
    $('#hiddenrow').removeClass('animated bounceInDown').addClass('hidden'); 
  });
  
  $('body').on('click', '#spotifylogin', function(e) {
    e.preventDefault();
    console.log($(this).attr('id') + ' clicked');    
    console.log(e);
    window.location = BUILT_URL;
  });  
  
  
searchArtists('Dave Matthews');
  
  function getRelatedByID(artistID) {
    return $.get(BASE_URL+'artists/'+artistID+'/related-artists')
      .pipe(trimResults)
      .pipe(renderRelatedTemplate);
  }

  function trimResults(response) {
    if (response.artists.length > RELATED_LIMIT) {
      response.artists = response.artists.slice(0, RELATED_LIMIT);
    }
    return response;
  }

  function renderRelatedTemplate(relatedArtists) {
    console.log('relatedArtists: ', relatedArtists);
    console.log('passed to template2: ', relatedArtists.artists);
    var $renderedTemplate = $relatedArtistTemplate.tmpl(relatedArtists.artists);
    console.log('renderedTemplate: ', $renderedTemplate);
    $('#relatedartists').html($renderedTemplate);
  } 
  
  function searchArtists(query) {
    var oData = {
      q: query,
      type: 'artist',
      limit: SEARCH_LIMIT,
      offset: 0,
      market: 'US'
    };
    var url = BASE_URL+'search';
    return $.get(url, oData)
      .pipe(renderSearchResults);
  }

  function renderSearchResults(response) {
    searchResultData = response;
    var artists = response.artists.items;
    var result = '';
    for (var i = 0; i < artists.length; i++) {
      var artistName = artists[i].name;
      var artistID = artists[i].id;
      result += '<li><a class="artist" data-selected-index="'+i+'" data-artist-name="'+artistName+'" href="'+artistID+'">'+artistName+'</a></li>';
    }
    $searchResults.html(result);  
  }


function justDisplayResponse(response) {
  console.log('response: ', response);
}











function buildURL(url, parameters) {
  var qs = '';
  for (var key in parameters) {
    if (parameters.hasOwnProperty(key)) {
      var value = parameters[key];
      qs += encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&';
    }
  }
  if (qs.length > 0){
    qs = qs.substring(0, qs.length - 1); //chop off last '&'
    url = url + '?' + qs;
  }
  return url;
}


function getHashValue(value) {
  var hash = [];
  var returnval = false;
  var q = window.location.href.split('#')[1];
  if(q !== undefined){
    q = q.split('&');
    for(var i = 0; i < q.length; i++){				
      hash = q[i].split('=');
      if (hash[0] === value) {
        returnval = hash[1];
      }				
    }
  }
  return returnval;
}