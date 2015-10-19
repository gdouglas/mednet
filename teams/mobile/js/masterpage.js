jQuery(document).ready(function($){
   console.log('ready');
});

$(".navbar-toggle").click(function() 
{  
    // hides children divs if shown, shows if hidden 
    $('#navbar').slideToggle();
    jQuery('#side-nav').slideToggle();
});


