var DesignPageLayouts = false;
console.log(DesignPageLayouts);

/*prevent focus on content by default*/
window.onload = function() {
    if(SetFullScreenMode !== undefined && SetFullScreenMode !== null) {
        // SetFullScreenMode(false);
    } else {
        var SetFullScreenMode = false;
    }
    if (checkURL) {
        DesignPageLayouts = true;
    } else {
        DesignPageLayouts = false;
    }
}

function checkURL() {
    if (window.location.href.indexOf("DesignPageLayouts") > -1) {
        return true;
    }
}
/*
*
*
*Navbar Controls
*
*/
function addListeners(){
    $(".navbar-toggle").click(function() {  
        $('#navbar').slideToggle();
        $('#sideNavBox').slideToggle();
    });
}
/*
*
*
*Smooth scrolling on bookmarks
*
*/
function addSmoothScroll(){
    $('a[href*=#]:not([href=#],#accordion a[href*=#])').click(function() {
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
}

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
    /*check if designpagelayouts page and do not show sideNavBox*/
    if($(window).width() >= 768){
        if (!checkURL){
            $('#sideNavBox').show();
        }
        $('#navbar').show();
        calcFooter();
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
    var $ribbon = $("#top-ribbon");
    var ribbonheight = $ribbon.outerHeight();
    var windowheight = $(window).height();

    //if ribbon is hidden size is zero
    if($ribbon.css('display') == 'none'){
        ribbonheight = 0;
    }
    
    //if no ms-designer-ribbon try to calculate with suitebar + ribbonrow
    if(ribbonheight==null){
        ribbonheight = $("#suiteBar").height() + $("#s4-ribbonrow").height() + $('#s4-statusbarcontainer').height();
    }
    
    //handle null if something wasn't found
    ribbonheight == null && (ribbonheight = 0);
    
    //if content is less than the window size add margin to customFooter
    var difference = windowheight-(bodyheight+ribbonheight+footerheight);
    if (difference > 0) $('footer').css('margin-top', difference);
    
    //show footer after calculating
    $footer.show();
}

/*hide extra pages on top level nav*/
function pruneSideNav(){
    if(DesignPageLayouts) {
       console.log("its DesignPageLayouts")
    } else {
         if ($('li').hasClass('selected')){
            $('li.selected').parent().css('display','block');
            $('li.selected').children().css('display','block');
         } else {
            $('#sideNavBox ul ul').css('display','none');
        }
        //set nav to visible
        $('#sideNavBox a').css('color','#000');
    }
}

/*prevent focusOnContent*/
function Hidesuite() {
    document.getElementById('ctl00_fullscreenmodeBtn').style.visibility = 'hidden';
} 


function isIE () {
  var myNav = navigator.userAgent.toLowerCase();
  return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
}

if (isIE () && isIE () < 9) {
 checkCookie();
} else {
 // is IE 9 and later or not IE
}

// IE 7 and 8 alert 
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

function checkCookie() {
    var medNetAlert = getCookie("medNetAlert");
    if (medNetAlert == "alerted today") {
        //do not show alert
    } else {
        medNetAlert = "alerted today";
        showAlert();
    }
}

function showAlert() {
   
   var bamAlert = 
       "<div id='browser-alert'>"+
        "<div class='alert-wrapper'>"+
            "<p>You are using Internet Explorer 7 or 8 which is an outdated browser. For the best experience on MedNet, please use one of the following browsers:</p>"+
            "<table class='icons'>"+
            "  <tr>"+
            "    <th><image src='~SiteCollection/_layouts/15/MedNetBranding/images/ie.png' class='browser-icon'></th>"+
            "    <th><image src='~SiteCollection/_layouts/15/MedNetBranding/images/chrome.png' class='browser-icon'></th>"+
            "    <th><image src='~SiteCollection/_layouts/15/MedNetBranding/images/ff.png' class='browser-icon'></th>"+
            "    <th><image src='~SiteCollection/_layouts/15/MedNetBranding/images/safari.png' class='browser-icon'></th>"+
            "  </tr>"+
            "  <tr class='titles'>"+
            "    <td>Internet Explorer<br>Version 9+</td>"+
            "    <td>Chrome</td>"+
            "    <td>Firefox</td>"+
            "    <td>Safari</td>"+
            "  </tr>"+
            "</table>"+
            "<p><strong>Need help?</strong><br>"+
            "If you have any questions or to get support upgrading or installing a new browser, please contact the MedIT Service Desk at 1-877-266-0666 or <a href='mailto:medit.servicedesk@ubc.ca'>medit.servicedesk@ubc.ca</a>.</p>"+
            "<span id='close'>X</span>"+
        "</div>"+
    "</div>"; 

    var wHeight = $(window).height()+'px';
    document.write(bamAlert);
    addCloseListener();
}

function addCloseListener() {
    $('#close').click(function() {
        $('#browser-alert').remove();
    });
}

$(document).ready(function(){
    pruneSideNav();
});
/*load functions*/
$(document).ready(function() {
    _spBodyOnLoadFunctionNames.push("addListeners", "Hidesuite", "pruneSideNav", "addSmoothScroll", "calcFooter");
});