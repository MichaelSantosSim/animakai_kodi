
$(document).ready(function(){

	chrome.storage.local.get('address', function(result) {
	  console.log('Value currently is ' + result.address);
	  $("#address_input").val(result.address);
	});

	$("#save_button").click(function(){
		let value =  $("#address_input").val();
		chrome.storage.local.set({'address' : value}, function() {
		  console.log('Value is set to ' + value);
		  window.close();
		});

	});	
});