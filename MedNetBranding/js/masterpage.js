/*prevent focus on content by default*/
window.onload = function() 
{
  SetFullScreenMode(false);
    
    _spBodyOnLoadFunctionNames.push("Hidesuite");
    function Hidesuite() {
        document.getElementById('ctl00_fullscreenmodeBtn').style.visibility = 'hidden';
    }  
}


/*
*
*
*Navbar Controls
*
*/
$(".navbar-toggle").click(function() 
{  
    $('#navbar').slideToggle();
    $('#sideNavBox').slideToggle();
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
             $('#s4-workspace').animate({
                 scrollTop: target.offset().top
            }, 'fast');
            return false;
        }
    }
});


/*
*
*
*Fix back to top at top of footer
*
*/
function checkOffset() {
    if($('.toplink').offset().top + $('.toplink').height()>= $('footer').offset().top - 10){
        bottomTopLink();
    }//end if
    if($(document).scrollTop() + window.innerHeight < $('footer').offset().top){
        fixTopLink();
    }//end if
}//end checkOffset

function defaultTopLink(){
    $('.toplink').css({
        'position':'static'
    });
}

function bottomTopLink(){
    $('.toplink').css({
        'position': 'absolute',
        'bottom': '22px',
        'background': '#3868a6'
    });
}//end defaultTopLink

function fixTopLink(){
    $('.toplink').css({
        'position': 'fixed',
        'bottom': '0',
        'background':'#002145'
    }); // restore when you scroll up
}//end fixTopLink


/*position toplink with timer*/
setInterval(function(){
    if ($(window).width() < 768) {
        checkOffset(); 
    }else{
        defaultTopLink();
    }
},100);

$(window).resize(function(){
    if($(window).width() >= 768){
        $('#sideNavBox').show();
        $('#navbar').show();
    }
});

/*
*
*
*Sticky Footer
*
*/

function calcFooter(){
    var $footer = $("footer");
    var footerheight = $footer.outerHeight();
    //hide footer allows for smoother window resizing
    $footer.hide();

    var bodyheight = $("#s4-bodyContainer").outerHeight();
    var $ribbon = $("#top-ribbon")
    var ribbonheight = $ribbon.outerHeight();
    var windowheight = $(window).height();

    //if ribbon is hidden size is zero
    if($ribbon.css('display') == 'none'){
        ribbonheight = 0;
    }
    
    //if no ms-designer-ribbon try to calculate with suitebar + ribbonrow
    if(ribbonheight==null){
        ribbonheight = $("#suiteBar").height() + $("#s4-ribbonrow").height();
    }
    
    //handle null if something wasn't found
    ribbonheight == null && (ribbonheight = 0);
    
    //if content is less than the window size add margin to customFooter
    var difference = windowheight-(bodyheight+ribbonheight+footerheight);
    if (difference > 0) $('footer').css('margin-top', difference);
    
    //show footer after calculating
    $footer.show();
}

$(document).ready(function() {
    calcFooter();
    
    //change footer with window resize
    $(window).resize(calcFooter);
});