var everythingLoaded = setInterval(function() {
  if (window.jQuery) {
    clearInterval(everythingLoaded);
    _spBodyOnLoadFunctionNames.push("init"); // this is the function that gets called when everything is loaded
  }else{
    console.log("slider is loading");
  }
}, 10);

function init(){
    jQuery(document).ready(function ($) {
    var _SlideshowTransitions = [
        //Fade
        { $Duration: 1200, $Opacity: 2 }
    ];
    var options = { 
            $AutoPlay: true,
            $FillMode:4,
            $AutoPlayInterval:3000,
            $SlideDuration:1200,

            $ArrowNavigatorOptions: {                           //[Optional] Options to specify and enable arrow navigator or not
                $Class: $JssorArrowNavigator$,                  //[Requried] Class to create arrow navigator instance
                $ChanceToShow: 2,                               //[Required] 0 Never, 1 Mouse Over, 2 Always
                $AutoCenter: 2,                                 //[Optional] Auto center arrows in parent container, 0 No, 1 Horizontal, 2 Vertical, 3 Both, default value is 0
                $Steps: 1,                                      //[Optional] Steps to go for each navigation request, default value is 1
                $Scale: false                                   //Scales bullets navigator or not while slider scale
            },

            $BulletNavigatorOptions: {                                //[Optional] Options to specify and enable navigator or not
                $Class: $JssorBulletNavigator$,                       //[Required] Class to create navigator instance
                $ChanceToShow: 2,                               //[Required] 0 Never, 1 Mouse Over, 2 Always
                $AutoCenter: 0,                                 //[Optional] Auto center navigator in parent container, 0 None, 1 Horizontal, 2 Vertical, 3 Both, default value is 0
                $Steps: 1,                                      //[Optional] Steps to go for each navigation request, default value is 1
                $Lanes: 1,                                      //[Optional] Specify lanes to arrange items, default value is 1
                $SpacingX: 12,                                   //[Optional] Horizontal space between each item in pixel, default value is 0
                $SpacingY: 4,                                   //[Optional] Vertical space between each item in pixel, default value is 0
                $Orientation: 1,                                //[Optional] The orientation of the navigator, 1 horizontal, 2 vertical, default value is 1
                $Scale: false                                   //Scales bullets navigator or not while slider scale
            }                        
        };


    var jssor_slider1 = new $JssorSlider$('slider1_container', options);

    $(window).resize(scaleSlider());
})};


function scaleSlider(){
    var slider = $("#slider1_container");
    $("#slider1_container").remove();
    $('.fp-slider-zone-container .ms-rte-embedwp').append(slider);
    //call init again without creating a loop
}
