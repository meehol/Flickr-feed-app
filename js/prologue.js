var cb;
var FeedApp = FeedApp || {};

(function(){
    
    cb = function(data){
        FeedApp.solveResult.init(data);
    }            
//     var tagtext = 'london';
    var script = document.createElement('script');
    script.src='//api.flickr.com/services/feeds/photos_public.gne?format=json&jsoncallback=cb';
    document.head.appendChild(script);
    
    var offcanvasFavs = document.getElementsByClassName('offcanvas-favs')[0];
    var openFavs = document.getElementsByClassName('open-favs')[0];
    var canvasBeingDragged = false;
    function touchStartOffcanvas(event) {
        canvasBeingDragged = false;
    }
    function touchDragOffcanvas(event) {
        canvasBeingDragged = true;                
    }
    function tapOrClick(event) {
        event.preventDefault();
        if(!canvasBeingDragged){
            openFavs.innerHTML = (openFavs.innerHTML == 'View favourites') ? 'Close favourites' : 'View favourites';
            offcanvasFavs.classList.toggle('showing-offcanvas');
        }
        return false;
    }
    openFavs.addEventListener("mouseup", tapOrClick, false);
    openFavs.addEventListener("touchend", tapOrClick, false);
    openFavs.addEventListener("touchmove", touchDragOffcanvas, false);
    openFavs.addEventListener("touchstart", touchStartOffcanvas, false);
    
    var bodyElement = document.body;
    var siteTitle = document.getElementsByClassName('site-wrapper')[0].getElementsByTagName('header')[0].getElementsByTagName('h1')[0];
    bodyElement.className += ' animate-fadein';
    siteTitle.className += ' animate-bounceindown';
    
})();