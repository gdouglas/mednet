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
    medNetAlert = "alert";
    if (medNetAlert == "alerted today") {
        //do not show alert
        alert(medNetAlert);
    } else {
        medNetAlert = "alerted today";
        showAlert();
    }
}

function showAlert() {
    var browserAlertDiv = document.createElement('div');
    browserAlertDiv.innerHTML = "<div id='browser-alert'><div class='alert-wrapper'><p>You are using internet explorer 7 which is an outdated browser. MedNet does not support this browser which will result in you having a inferior and insecure experience. To use MedNet please use a <a href='#' target = '_blank'>recommended browser</a></p><p>Thank you</p><span id='close'>X</span></div></div>";
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
