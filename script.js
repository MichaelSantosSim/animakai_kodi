$(document).ready(function(){
 addButtons();
 addPlayAll();
 addPlayPause();
});

function addPlayPause(){

	var playPauseImage = $("<img/>")
  						.addClass("hidden-xs play-pause")
  						.attr("src", chrome.extension.getURL('play-pause.png'));
  	playPauseImage.click(function(){
  		sendPauseRequest(pauseRequest);
  	});

	$(".container").append(playPauseImage);
}


var	playRequest = {
   "jsonrpc":"2.0",
   "id":1,
   "method":"Player.Open",
   "params":{
      "item":{
         "file":"file"
      }
   }
}

var pauseRequest = {
	"jsonrpc": "2.0",
	"id": 1,
	"method": "Player.PlayPause",
	"params": {
	 "playerid": 1 
	}
}

var queueRequest  = {
	   "jsonrpc":"2.0",
	   "id":1,
	   "method":"Playlist.Add",
	   "params":{
	      "playlistid":1,
	      "item":{
	         "file":"file"
	      }
	   }
	}


function ajaxRequest(request, epName){
	jQuery.ajax({
	    type: "POST",
	    url: "http://192.168.1.41:80/jsonrpc",
	    data: JSON.stringify(request),
	    async: false,
	    headers: { 
	        'Accept': 'application/json',
	        'Content-Type': 'application/json' 
    	},
	    success: function(data) {

	    	var requestType = request == playRequest ? "sent" : "queued";

	    	showNotification("Sucess", epName + " was successfuly " + requestType + "!", "success")
	    	console.log("Request: " + JSON.stringify(request));
	        console.log("Response: " + JSON.stringify(data));
	        console.log("---------------------------------------------------------");
	    },
	    error: function(xhr, textStatus, errorThrown){
       		console.log('Send error '  + textStatus + " - " + errorThrown);
       		showNotification("Error", "Failed to "+ epName +" to your kodi player", "error");
    	}
	});
}

function sendPauseRequest(request){
	jQuery.ajax({
	    type: "POST",
	    url: "http://192.168.1.41:80/jsonrpc",
	    data: JSON.stringify(request),
	    async: false,
	    headers: { 
	        'Accept': 'application/json',
	        'Content-Type': 'application/json' 
    	},
	    success: function(data) {
	    	console.log("Request: " + JSON.stringify(request));
	        console.log("Response: " + JSON.stringify(data));
	        console.log("---------------------------------------------------------");
	    },
	    error: function(xhr, textStatus, errorThrown){
       		console.log('Send error '  + textStatus + " - " + errorThrown);
       		showNotification("Error", "Failed to pause kodi player", "error");
    	}
	});
}

function showNotification(title, message, type){
	new PNotify({
	    title: title,
	    text: message,
	    type: type
	  });
}

function extractVideoUrl(pageData){
	try{
		var regex = new RegExp("(?<=<source src=\")[^\"]*");
		var result = regex.exec(pageData);
		result = result[0];
		result = result.replace(/ /g, '')
					   .replace(/\r/g, '')
					   .replace(/\n/g, '');
		return result;
	}catch(e){
		console.log(pageData);
		throw e;
	}
}

function getPageData(page, request, epName){
	$.ajax({
	   type: 'GET',
	   async: false,
	   crossDomain: true,
	   dataType: 'text',
	   url: page,
	   success: function(pageData){
		   	var videoLink = extractVideoUrl(pageData);
		   	request.params.item.file = videoLink;
		   	ajaxRequest(request, epName);
	   },
	   error: function(xhr, textStatus, errorThrown){
       	alert('request failed ' + textStatus + " - " + errorThrown);
    	}
	});
}

function addButtons(){
	$(".content-servers ul").each(function(){

  		var playBtn = $("<li></li>")
  						.addClass("kodi-link")
  						.append("<a>Kodi Play</a>");

  		var queueBtn = $("<li></li>")
  						.addClass("kodi-link")
  						.append("<a>Kodi Queue</a>");
  						
  		var link = $(this).find("a.btn-online").attr("href");

  		var epName = $(this).parent().parent().parent().find(">:first-child").find(">:first-child").html();

  		if(link===undefined){
  			link = $(this).parent().find("a.btn-online").attr("href");
  		}

  		if(!link.includes(window.location.origin)){
  			link = window.location.origin + link;
  		}

		playBtn.click(function(){
		  	getPageData(link, playRequest, epName);
		});

		queueBtn.click(function(){
		  	getPageData(link, queueRequest, epName);
		});

		$(this).append(playBtn);
		$(this).append(queueBtn);
  });
}


function addPlayAll(){
	var isAllEpisodesPage = $(".col-episodios").length > 0;

	if(isAllEpisodesPage){
		var nameHeader = $(".top-padrao");
		var playBtn = $("<h2><a href='#'>[Play all episodes]</a></h2>")
						.addClass("tt-padrao");
  		
  		playBtn.click(function(){

  			var isFirst = true;

  			$(".item-pg-anime").each(function(){

  				var link = $(this).find("a.thumb").attr("href");

  				var epName = $(this).find(">:first-child").find(">:first-child").html();

		  		if(link===undefined){
		  			link = $(this).parent().find("a.btn-online").attr("href");
		  		}

		  		if(!link.includes(window.location.origin)){
		  			link = window.location.origin + link;
		  		}

		  		if(isFirst){
		  			getPageData(link, playRequest, epName);
		  			isFirst = false;
		  		}else{
		  			getPageData(link, queueRequest, epName);
		  		}

		  		var name = $(this).find("a.thumb").attr("title");

		  		console.log("Requesting: " + name);

  			});
  		});

  		nameHeader.append(playBtn);
	}
}