(function(window, document) {
    'use strict';

    var FeedApp = window.FeedApp = window.FeedApp || {};
    var Favorites, Photo, photoViewModel;
    var beingDragged = false;

    window.store = {
        localStoreSupport: function() {
            try {
                return 'localStorage' in window && window['localStorage'] !== null;
            } catch (e) {
                return false;
            }
        },
        set: function(name,value,days) {
            if (days) {
                var date = new Date();
                date.setTime(date.getTime()+(days*24*60*60*1000));
                var expires = "; expires="+date.toGMTString();
            }
            else {
                var expires = "";
            }
            if( this.localStoreSupport() ) {
                localStorage.setItem(name, value);
            }
            else {
                document.cookie = name+"="+value+expires+"; path=/";
            }
        },
        get: function(name) {
            var ret;
            if( this.localStoreSupport() ) {
                ret = localStorage.getItem(name);
                switch (ret) {
                    case 'true': 
                        return true;
                    case 'false':
                        return false;
                    default:
                        return ret;
                }
            }
            else {
                var nameEQ = name + "=";
                var ca = document.cookie.split(';');
                for(var i=0;i < ca.length;i++) {
                    var c = ca[i];
                    while (c.charAt(0)==' ') c = c.substring(1,c.length);
                    if (c.indexOf(nameEQ) == 0) {
                        ret = c.substring(nameEQ.length,c.length);
                        switch (ret) {
                            case 'true': 
                                return true;
                            case 'false':
                                return false;
                            default:
                                return ret;
                        }
                    }
                }
                return null;
            }
        },
        del: function(name) {
            if( this.localStoreSupport() ) {
                localStorage.removeItem(name);
            }
            else {
                this.set(name,"",-1);
            }
        }
    };

    FeedApp.solveResult = (function() {

        var init = function(data) {

            if ( data.items.length <= 0 ) mainFeed.innerHTML = 'There is no results or API is failing again...';
            var mainFeed = document.getElementsByClassName('main-feed')[0];
            
            Photo = function(id, author, title, link, mediaUrl) {
                this.id = id;
                this.author = author;
                this.title = title;
                this.link = link;
                this.mediaUrl = mediaUrl;                
            };

            Favorites = function(Photo) {
                return this.Photo = Photo;
            };

            photoViewModel = {

                photos: ko.observableArray([]),

                favorites: ko.observableArray([]),

                addToFavorites: function(photoItem) {
                    if(!beingDragged){
                        var photoItemId = photoItem.id;
                        var currentPhotoObj, favoriteExists;
                        currentPhotoObj = _.find(photoViewModel.photos(), function(photo) {
                            return photo.photoObj['id'] === photoItemId;
                        });
                        favoriteExists = _.find(photoViewModel.favorites(), function(favorite) {
                            return favorite.photoObj['id'] === currentPhotoObj.photoObj.id;
                        });
                        if (!favoriteExists) {
                            photoViewModel.favorites.push(currentPhotoObj);
                            var favsArrayFromStorage = window.store.get('_X11_banaszczyk_flickrapp_favsArray');
                            var newFavsArrayFromStorage;
                            if ( favsArrayFromStorage != '' && favsArrayFromStorage != null ) { 
                                favsArrayFromStorage = favsArrayFromStorage.replace(/[\[\]]/g,'');
                                newFavsArrayFromStorage = favsArrayFromStorage + ',' + JSON.stringify(currentPhotoObj); 
                            }
                            else { 
                                newFavsArrayFromStorage = JSON.stringify(currentPhotoObj); 
                            }
                            newFavsArrayFromStorage = '[' + newFavsArrayFromStorage + ']';
                            window.store.set('_X11_banaszczyk_flickrapp_favsArray', newFavsArrayFromStorage, 365);
                            photoViewModel.fadeInLoadedImgTiles();
                            photoViewModel.addEventsToTiles();
                        }
                    }
                },

                removeFromFavorites: function(photoItem) {
                    if(!beingDragged){
                        var photoItemId = photoItem.id;

                        var currentPhotoObj = _.find(photoViewModel.favorites(), function(photo) {
                            return photo.photoObj['id'] === photoItemId;
                        });

                        var favsArrayFromStorage = window.store.get('_X11_banaszczyk_flickrapp_favsArray');
                        var newFavsArrayFromStorage;
                        newFavsArrayFromStorage = favsArrayFromStorage.replace(JSON.stringify(currentPhotoObj),'');
                        newFavsArrayFromStorage = newFavsArrayFromStorage.replace('[,{','[{');
                        newFavsArrayFromStorage = newFavsArrayFromStorage.replace('},]','}]');
                        newFavsArrayFromStorage = newFavsArrayFromStorage.replace('},,{','},{');    
                        newFavsArrayFromStorage = newFavsArrayFromStorage.replace('[]','');
                        newFavsArrayFromStorage = newFavsArrayFromStorage.replace('[,]','');
                        window.store.set('_X11_banaszczyk_flickrapp_favsArray', newFavsArrayFromStorage, 365);

                        var photoInFavs = document.getElementById('fav'+photoItemId);
                        if( photoInFavs != null ) { photoInFavs.parentNode.classList.toggle('visible');
                                                    if( window.innerWidth < 433 ) photoInFavs.parentNode.parentNode.classList.toggle('removing-singlecolumn');
                                                    else photoInFavs.parentNode.parentNode.classList.toggle('removing');
                                                  }
                        
                        var mainFeedPhotoItemId = photoItemId.replace('fav','');
                        var photoInDom = document.getElementById(mainFeedPhotoItemId);
                        if( photoInDom != null ) { photoInDom.parentNode.classList.toggle('selected'); }
                        
                        setTimeout(function(){
                            return photoViewModel.favorites.splice(_.indexOf(photoViewModel.favorites(),
                                                                                     _.find(photoViewModel.favorites(), function(favorite) {
                                return favorite.photoObj['id'] === photoItemId;
                            })), 1);
                        }, 300);
                    }
                },

                openImgInNewTab: function(photoItem) {
                    if(!beingDragged){
                        var win = window.open(photoItem.link, '_blank');
                        win.focus();
                    }
                },
                
                addEventsToTiles: function() {
                    var imageTiles = document.getElementsByClassName('imgResult');
                    function selectedTapOrClick(event) {
                        event.preventDefault();
                        if(!beingDragged){
                            if ( !this.classList.contains('selected') ) this.classList.add('selected');
                        }
                        return false;
                    }
                    function touchStartImgTile(event) {
                        beingDragged = false;
                    }
                    function touchDragImgTile(event) {
                        beingDragged = true;                
                    }        
                    for (var i = 0; i < imageTiles.length; i++) {
                        if( imageTiles[i].getAttribute('data-events-added') === null ){
                            imageTiles[i].addEventListener('mouseup', selectedTapOrClick, false);
                            imageTiles[i].addEventListener('touchend', selectedTapOrClick, false);
                            imageTiles[i].addEventListener('touchmove', touchDragImgTile, false);
                            imageTiles[i].addEventListener('touchstart', touchStartImgTile, false);
                            imageTiles[i].setAttribute('data-events-added','true')
                        }                        
                    }
                },
                
                fadeInLoadedImgTiles: function() {
                    var imageTiles = document.getElementsByClassName('imgResult');
                    function opacityToVisible(event) {
                        this.parentNode.classList.add('visible');
                    } 
                    for (var i = 0; i < imageTiles.length; i++) {
                        var currentImgTag = imageTiles[i].getElementsByTagName('img')[0];
                        if( currentImgTag.complete ){
                            currentImgTag.parentNode.classList.add('visible');
                        }else{
                            currentImgTag.addEventListener('load', opacityToVisible, false);
                        }                   
                    }
                },
                
                addSelectedClassIfExists: function(){
                    if ( favsArrayFromStorageExists !='' && favsArrayFromStorageExists != null  ) {
                        var favoritesObjectsArrayFromStorage = JSON.parse(favsArrayFromStorageExists);
                        _.each(favoritesObjectsArrayFromStorage, function(photo) {
                            var favImgId = document.getElementById(photo.photoObj.id);
                            if ( favImgId != null ){ favImgId.parentNode.classList.toggle('selected'); }
                        });
                        return;
                    }

                }
            }

            var photosArray = data.items;
            _.each(photosArray, function(photo) {
                var image;
                image = {
                    photoObj: new Photo(
                        photo.link.match(/(\d+)\/$/)[1],
                        photo.author,
                        photo.title,
                        photo.link,
                        photo.media.m )
                };
                return photoViewModel.photos.push(image);
            });

            var favsArrayFromStorageExists = window.store.get('_X11_banaszczyk_flickrapp_favsArray');
            if ( favsArrayFromStorageExists !='' && favsArrayFromStorageExists != null  ) {
                var favoritesObjectsArrayFromStorage = JSON.parse(favsArrayFromStorageExists);
                _.each(favoritesObjectsArrayFromStorage, function(photo) {
                    return photoViewModel.favorites.push(photo);
                });
            }

            ko.applyBindings(photoViewModel);
            photoViewModel.fadeInLoadedImgTiles();
            photoViewModel.addEventsToTiles();
            photoViewModel.addSelectedClassIfExists();

        };

        return {
            init: init
        };

    })();

    window.FeedApp = FeedApp;

}(this, this.document));