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


/*
*
*
*Fix back to top to footer
*
*/
function checkOffset() {
    if($('.toplink').offset().top + $('.toplink').height()>= $('footer').offset().top - 10){
        $('.toplink').css({
            'position': 'absolute',
            'bottom': '22px',
            'background': '#3868a6'
        });
    }//end if
    if($(document).scrollTop() + window.innerHeight < $('footer').offset().top){
        $('.toplink').css({
        'position': 'fixed',
        'bottom': '0',
        'background':'#002145'
        }); // restore when you scroll up
    }//end if
}//end checkOffset

$(document).scroll(function() {
    checkOffset();
});
