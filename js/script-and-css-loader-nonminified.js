;(function() {

    var cb = function() {
        var stylesheetArray = ['css/styles.css','https://fonts.googleapis.com/css?family=Open+Sans+Condensed:300'];
        for( var i=0; i < stylesheetArray.length; i++ ){
            var l = document.createElement('link'); l.rel = 'stylesheet';
            l.href = stylesheetArray[i];
            var h = document.getElementsByTagName('head')[0]; h.parentNode.insertBefore(l, h);
        }
    };

    var raf = requestAnimationFrame || mozRequestAnimationFrame ||
        webkitRequestAnimationFrame || msRequestAnimationFrame;
    if (raf) raf(cb);
    else window.addEventListener('load', cb);

    function getScript(urls,success){
        for( var i=0; i < urls.length; i++ ){
            var script=document.createElement('script');
            script.src=urls[i];
            var head=document.getElementsByTagName('head')[0],
                done=false;
            script.onload=script.onreadystatechange = function(){
                if ( !done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete') ) {
                    done=true;
                    success();
                    script.onload = script.onreadystatechange = null;
                    head.removeChild(script);
                }
            };
            head.appendChild(script);
        }
    }
    getScript(['js/libs/knockout-2.1.0.debug.js', 'js/libs/underscore.js'],function(){
        function downloadJSAtOnload() {
            var scriptArray = ['js/feed-app.js', 'js/prologue.js'];
            for( var i=0; i < scriptArray.length; i++ ){
                var element = document.createElement('script');
                element.src = scriptArray[i];
                document.body.appendChild(element);
            }
        }

        if (window.addEventListener)
            window.addEventListener('load', downloadJSAtOnload, false);
        else if (window.attachEvent)
            window.attachEvent('onload', downloadJSAtOnload);
        else window.onload = downloadJSAtOnload;
    });
})();