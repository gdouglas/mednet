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
        console.log(medNetAlert);
    } else {
        medNetAlert = "alerted today";
        showAlert();
    }
}

function showAlert() {
    var browserAlertDiv = document.createElement('div');
    browserAlertDiv.innerHTML = 
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
    browserAlertDiv.class = "browser-alert";

    $('#browser-alert').remove();
    $('#s4-bodyContainer').append(browserAlertDiv);
    addCloseListener();
}

function addCloseListener() {
    $('#close').click(function() {
        $('#browser-alert').remove();
    });
}
$(document).ready(function() {
    checkCookie();
});

