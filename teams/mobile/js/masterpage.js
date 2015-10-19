/*position document at content *
*
*
*
*
*needs to be done only for mobile*/
jQuery(document).ready(function($){
    $(document).scrollTop($(".breadcrumb").offset().top-20);
});

/*
*
*
*Navbar Controls
*
*/
$(".navbar-toggle").click(function() 
{  
    // hides children divs if shown, shows if hidden 
    $('#navbar').slideToggle();
    jQuery('#side-nav').slideToggle();
});

/*
*
*
*Smooth scrolling on bookmarks
*
*/
$('a[href*=#]:not([href=#])').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') 
        || location.hostname == this.hostname) {

        var target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
           if (target.length) {
             $('html,body').animate({
                 scrollTop: target.offset().top
            }, 1000);
            return false;
        }
    }
});