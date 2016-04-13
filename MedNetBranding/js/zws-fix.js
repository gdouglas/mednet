function cleanSpace(){
	var elements = ["h1","h2","h3","h4","p","strong","label","span","a"];
	for (var i = 0; i < elements.length; i++) {
		jQuery(elements[i]).each(
			jQuery(this).html(jQuery(elements[i]).html().replace(/\u200B/g,''))
          );
	}
}

//jQuery('#s4-bodyContainer').html(jQuery('#s4-bodyContainer').html().replace(/\u200B/g,''));


// function spCleanup(code){
// if(code.children().length > 0){
// code.html(jQuery('<div>').append(code.children().clone()).html().replace(/&nbsp;|&#160;|\r\n|\n|\r|\t/g,'').replace(/\s{2,}/g,' '));
//        code.children().each(function(){
       
// spCleanup(jQuery(this));
//        });
// };
// };
// spCleanup(jQuery('#s4-bodyContainer'));

var elements = ["h1","h2","h3","h4","p","strong","label","span","a"];
for (var i = 0; i < elements.length; i++) {
  jQuery(elements[i]).each(
    removeZWS(this)
  );
}


function removeZWS(target) {
  jQuery(target).html(jQuery(target).html().replace("S",''));
}