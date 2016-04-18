var elements = ["h1","h2","h3","h4","p","strong","label","span","a"];
function targetZWS(){
	for (var i = 0; i < elements.length; i++) {
	  jQuery(elements[i]).each(function() {
	    removeZWS(this);
	  });
	}
}


function removeZWS(target) {
  jQuery(target).html(jQuery(target).html().replace(/\u200B/g,''));
}