angular.module('hupnvs2.controllers', [])
//angular.module('myaphp')



//-------------------------------------------------------------------------------------------
//--- Home Controller
//-------------------------------------------------------------------------------------------
.controller('HomeCtrl', function($q, $scope,$ionicSideMenuDelegate, $cordovaInAppBrowser, $http, $ionicLoading, $ionicSlideBoxDelegate,$ionicPopup, NetworkSettings, WpConfig, LoaderService, CheckConnection,sessionService,wpApi, getUserPrefs, MyApHpDataService,$cordovaFileTransfer){

    //--- Setup the loader
    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });

    
   // $scope.$on('$ionicView.afterEnter', function(event) {
   //      $ionicSideMenuDelegate.canDragContent(false);
   //  });
   //  //enable side menu drag before moving to next view
   //  $scope.$on('$ionicView.beforeLeave', function(event) {
   //      $ionicSideMenuDelegate.canDragContent(true);
   //  });

    //$scope.network = getUserPrefs.netIconStatus();
    //console.log("ionicView")
    
    $scope.$on("$ionicView.enter", function(event, data){
        $scope.doRefreshCat();  
    });

    //--- Récupération des préférences utilisateur
    // $scope.storage = StorageService.getAll();
    // ghList = sessionService.get("ghList");
    // //console.log(ghList)
    // var filter = '&filter[myaphpgh]=aphp,ap-hp';
    // var i = 0;
    // if(ghList){
    //     ghList.forEach(function(){
    //     var ghSlug = ghList[i];
    //     //filter += '&filter[taxonomy]=myaphpgh&filter[term]='+ghSlug;
    //     // if(i > 0){
    //     //     filter += ',';   
    //     // }
    //     filter += ','+ghSlug;
    //     i++;
    // })
    // }
    

    // metiersList = sessionService.get("metiersList");
    // //console.log(ghList)
    // filter += '&filter[myaphpmetier]=aphp,ap-hp';
    // var i = 0;

    // if(metiersList){
    // metiersList.forEach(function(){
    //         var metierSlug = metiersList[i];
    //         //filter += '&filter[taxonomy]=myaphpgh&filter[term]='+ghSlug;
    //         // if(i > 0){
    //         //     filter += ',';   
    //         // }
    //         filter += ','+metierSlug;
    //         i++;
    //     })
    // }

    // console.log(filter);
    var filter = "";
    filter = getUserPrefs.getFilter();
    
    filter = '&categories=51';

    var urlBase = WpConfig.WpBaseUrl;
    
    //--- Methode de chargement des Catégories et du diaporama depuis WP
    $scope.doRefreshCat = function() {
        wpApi.getWPMenus().then(function(data){
            // console.log('******* GET MENUS *******')
            $scope.wpCategories = data;
            $scope.network = getUserPrefs.netIconStatus();
            $ionicLoading.hide();
        })

        //--- récupération des Catégorie (la gesiton du mode offline est faite dans app.js)
        // wpApi.getWPCat().then(function(data){
        //     $scope.wpCategories = data;
        //     $scope.network = getUserPrefs.netIconStatus();
        //     $ionicLoading.hide(); 
        // });

        //--- chargement des posts du diaporama
        var urlQuery = urlBase+ WpConfig.WpUrlPosts+'?per_page=3'+filter+"&_embed";
        // //console.log(urlQuery)

        //--- Requète de récupération des ARTICLES
        $http.get(urlQuery).success(function(data){
            $scope.wpPosts = [];
            var i = 0;
            data.forEach(function(element) {
                var postID = data[i].id;                                //POSTID 
                var title = data[i].title.rendered;                     //TITRE
                var excerpt = data[i].excerpt.rendered;                    //EXTRAIT

                //--- récupération des images à la une
                var thumbUrl = "";
                if(data[i]["_embedded"]["wp:featuredmedia"]){
                    //console.log(JSON.stringify(data[i]["_embedded"]["wp:featuredmedia"][0].media_details.sizes.thumbnail.source_url))
                    if(data[i]["_embedded"]["wp:featuredmedia"][0].media_details.sizes.medium){
                        thumbUrl = data[i]["_embedded"]["wp:featuredmedia"][0].media_details.sizes.medium.source_url    
                    }else{
                        thumbUrl = data[i]["_embedded"]["wp:featuredmedia"][0].media_details.sizes.full.source_url       
                    }
                }

                $scope.wpPosts.push({postID: postID, title: title, thumb: thumbUrl, excerpt: excerpt});
                i++;
                // console.log(JSON.stringify(data[i]))
            });
            $ionicSlideBoxDelegate.update();
            // //--- Arrêt du loader
            // $ionicLoading.hide();
        });
    

$scope.openBrowser = function() {
    var options = {
      location: 'yes',
      clearcache: 'yes',
      toolbar: 'yes'
   };

    extURL = sessionService.get("ExtURL");
    console.log(extURL);
      $cordovaInAppBrowser.open( extURL, '_blank', options)
        
      .then(function(event) {
         // success
      })
        
      .catch(function(event) {
         // error
      });
   }


        // //var urlQuery = urlBase+ WpConfig.WpUrlCat + "?per_page=100"+"&search=home-";
        // var urlQuery = urlBase+ WpConfig.WpUrlCat + "?per_page=100"+"&exclude=1";

        // $http.get(urlQuery,{ timeout: NetworkSettings.TimeOut }).then(
        //     function success(response){
        //         var data = response.data;
        //         $scope.wpCategories = [];
        //         //console.log(urlQuery);
        //         var i = 0;
        //         var groupNum = 0;

        //         data.forEach(function(element) {
        //             var catID = data[i].id; //POSTID 
        //             var name = data[i].name; //TITRE
        //             var parent = data[i].parent; //PARENT

        //             //console.log('ID : '+catID+' Parent : '+parent + ' Groupnum : '+groupNum);
                    
        //             //--- Catégories Principales
        //             if(data[i].parent === 0){
                        
        //                 var itemArr = [];
        //                 $scope.wpCategories[groupNum]={
        //                     catID: catID,
        //                     name: name,
        //                     items: [],
        //                     destURL : '#/app/cat/'+catID,
        //                     iconplus: '',
        //                     iconminus: ''
        //                 };
        //                 groupNum++;
        //             }
        //             //--- Sous Catégories
        //             else{
        //                 $scope.wpCategories[groupNum-1].items.push({
        //                     catID: catID,
        //                     name: name,
        //                     destURL : '#/app/cat/'+catID
        //                 });

        //                 $scope.wpCategories[groupNum-1].iconplus = 'ion-plus';
        //                 $scope.wpCategories[groupNum-1].iconminus = 'ion-minus';
        //                 $scope.wpCategories[groupNum-1].destURL = '#';
        //             }
                    
        //             i++;
        //         });
                
        //         // //--- Hide Loader
        //         $ionicLoading.hide();

        //         //--- Stopper le refresher
        //         $scope.$broadcast('scroll.refreshComplete');
        //     },
        //     function error(response){


        //         //--- TODO: Créer une méthode de récupération des données SQLite

        //         var data = response.data;
        //             $scope.wpCategories = [];
        //             // var alertPopup = $ionicPopup.alert({
        //             //     title: 'Erreur',
        //             //     template: 'Problème de connexion réseau...'
        //             // });
        //             $scope.wpCategories[0]={
        //                 catID: 0,
        //                 name: 'Problème de connexion réseau',
        //                 items: [],
        //                 destURL : '#',
        //                 iconplus: '',
        //                 iconminus: ''
        //             };
        //         $ionicLoading.hide();

                //--- Stopper le refresher
                $scope.$broadcast('scroll.refreshComplete');
        //     });
    };
    

    //--- gestion des accordéons
    //--- cf. codepen : https://codepen.io/shengoo/pen/bNbvdO/
    $scope.toggleGroup = function(cat) {
        cat.show = !cat.show;
    };
    $scope.isGroupShown = function(cat) {
        return cat.show;
    };

})

//-------------------------------------------------------------------------------------------
//--- Account Controller
//-------------------------------------------------------------------------------------------
.controller('accountCtrl', function($scope, $http, $ionicLoading, sessionService, WpConfig, $cordovaKeyboard){
    //CF. : http://codepen.io/ionic/pen/saoBG?editors=1010
    //$scope.storage = StorageService.getAll();
    console.log("accountCtrl");

    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });
    
    var urlBase = WpConfig.WpBaseUrl;

    //--- Sychro GH + récup préfs
    var urlQueryGH = urlBase+ "myaphpgh";
    $http.get(urlQueryGH).success(function(data){
        $scope.wpTerms = [];
        i = 0;
        choosedGh = sessionService.get("ghList");
            //console.log("data (gh): " + data);
            data.forEach(function(){

                //--- On verifie si le Gh est dans le stockage local
                var checkedVal = false;
                if (choosedGh){
                    itemIdx = choosedGh.indexOf( data[i].slug );
                    if(itemIdx >= 0){
                        checkedVal = true;    
                    }
                }
                
                $scope.wpTerms.push({
                    name    : data[i].name,
                    slug    : data[i].slug,
                    checked : checkedVal
                }); 

                 
                i++;
            });
        //}
        
    });


    //--- Sychro Metiers + récup préfs
    var urlQueryMetier = urlBase+ "myaphpmetier";
    $http.get(urlQueryMetier).success(function(data){
        $scope.wpTermsMetiers = [];
        i = 0;
        choosedMetiers = sessionService.get("metiersList");
            //console.log("data (metiers): " + data);
        
            data.forEach(function(){
                
                var checkedVal = false;

                if (choosedMetiers){
                    itemIdx = choosedMetiers.indexOf( data[i].slug );
                    if(itemIdx >= 0){
                        checkedVal = true;    
                    }
                }

                $scope.wpTermsMetiers.push({
                    name : data[i].name,
                    slug : data[i].slug,
                    checked : checkedVal
                });  
                i++;
            });
        $ionicLoading.hide();
    });
    
    // $scope.settings = {
    //     slug: 'hupc'
    // };

    $scope.userNotes = {
         userName: sessionService.get("userName"),
         gestName: sessionService.get("gestName"),
         gestTel: sessionService.get("gestTel"),
    };

    $scope.closKeyb = function(){
        console.log("return");
        $cordovaKeyboard.close();
    }

    $scope.saveStorage = function(search, $event){
        sessionService.set("userName", $scope.userNotes.userName);
        sessionService.set("gestName", $scope.userNotes.gestName);
        sessionService.set("gestTel", $scope.userNotes.gestTel);
        if($event.keyCode === 13 ){
            console.log("return");
        $cordovaKeyboard.close();
        }
    }



    //--- Methode de sauvegarde des préférences Gh (à la volée)
    $scope.saveGh = function(){
        //StorageService.reset();

        var i = 0;
        var choosedGh = [];
        //StorageService.remove(ghList);
        $scope.wpTerms.forEach(function(){
            if ($scope.wpTerms[i].checked){
                //console.log($scope.wpTerms[i].slug);
                choosedGh.push($scope.wpTerms[i].slug);
            }
            i++;
            
        });
        //StorageService.add({ghList : choosedGh});
        sessionService.set("ghList", choosedGh);
        //$scope.storage = StorageService.getAll();
        console.log(sessionService.get("ghList"));
    }

    //--- Methode de sauvegarde des préférences métier (à la volée)
    $scope.saveMetiers = function(){
        // StorageService.reset();

        var i = 0;
        var choosedMetiers = [];
        $scope.wpTermsMetiers.forEach(function(){
            if ($scope.wpTermsMetiers[i].checked){
                //console.log($scope.wpTerms[i].slug);
                choosedMetiers.push($scope.wpTermsMetiers[i].slug);
            }
            i++;
        });
        //StorageService.add({metiersList : choosedMetiers});
        sessionService.set("metiersList", choosedMetiers);
        //$scope.storage = StorageService.getAll();

        console.log("metiersList : "+sessionService.get("metiersList"));
    }


    //

    $scope.clientSideList = $scope.wpTerms;
    //console.log( "clientSideList : "+$scope.clientSideList);

})
//-------------------------------------------------------------------------------------------
//--- Category Controller
//-------------------------------------------------------------------------------------------
.controller('CatCtrl', function($scope, $http, $stateParams, $ionicLoading, NetworkSettings, WpConfig, sessionService, LoaderService, getUserPrefs, wpApi){

    //--- Configuration du loader
      $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
      });
    var filter = "";
    $scope.$on("$ionicView.enter", function(event, data){
       $scope.doRefreshPosts();
       $scope.network = getUserPrefs.netIconStatus();
    });

    //--- Récupération des constantes de configuration
    var urlBase = WpConfig.WpBaseUrl;
    //var filter = "";
    var filter = "";
    filter = getUserPrefs.getFilter();
    //--- Récupération des préférences utilisateur
    // $scope.storage = StorageService.getAll();
    // ghList = sessionService.get("ghList");
    // //console.log(ghList)
    // var filter = '&filter[myaphpgh]=aphp,ap-hp';
    // var i = 0;
    // if(ghList){
    //     ghList.forEach(function(){
    //     var ghSlug = ghList[i];
    //     //filter += '&filter[taxonomy]=myaphpgh&filter[term]='+ghSlug;
    //     // if(i > 0){
    //     //     filter += ',';   
    //     // }
    //     filter += ','+ghSlug;
    //     i++;
    // })
    // }

    // metiersList = sessionService.get("metiersList");
    // //console.log(ghList)
    // filter += '&filter[myaphpmetier]=aphp,ap-hp';
    // var i = 0;

    // if(metiersList){
    // metiersList.forEach(function(){
    //         var metierSlug = metiersList[i];
    //         //filter += '&filter[taxonomy]=myaphpgh&filter[term]='+ghSlug;
    //         // if(i > 0){
    //         //     filter += ',';   
    //         // }
    //         filter += ','+metierSlug;
    //         i++;
    //     })
    // }
    

    // console.log(filter);
    //filter = getUserPrefs.getFilter();
    // if($scope.storage[0]){
    //     var ghSlug = $scope.storage[0].ghSlug;
    //     var filter = '&filter[taxonomy]=myaphpgh&filter[term]='+ghSlug;
    // }


    //--- Methode de chargement des posts depuis WP
    $scope.doRefreshPosts = function() {
        var urlQueryCat = urlBase+WpConfig.WpUrlCat+'/'+$stateParams.catID;
        console.log(urlQueryCat);
        $scope.catTitle = '';
        $http.get(urlQueryCat,{ timeout: NetworkSettings.TimeOut }).then(
            function success(response){
                console.log(response)
                var data = response.data;
                $scope.catTitle = data.name;
                var catInfos = getUserPrefs.getCatInfos(data.parent);
                console.log(data.name);
            },
            function error(response){
                var data = response.data;

            }
        );

        //--- récupération des Catégorie (la gesiton du mode offline est faite dans app.js)
        //console.log('$stateParams.catID : '+$stateParams.catID);
        wpApi.getWPPosts($stateParams.catID).then(function(data){
            console.log(JSON.stringify(data))
            $scope.wpPosts = data;
            $scope.network = getUserPrefs.netIconStatus();
            $ionicLoading.hide();
        });


        // var urlQuery = urlBase+ WpConfig.WpUrlPosts+'?per_page=100&categories='+$stateParams.catID+filter;
        
        // //--- Requète de récupération des ARTICLES
        // $http.get(urlQuery).success(function(data){
        //     $scope.wpPosts = [];
        //     var i = 0;
        //     data.forEach(function(element) {
        //         var postID = data[i].id;                                //POSTID 
        //         var title = data[i].title.rendered;                     //TITRE
        //         $scope.wpPosts.push({postID: postID, title: title});
        //         i++;
        //     });

        //     //--- Arrêt du loader
        //     $ionicLoading.hide();
        // });

        //--- Stopper le refresher
        $scope.$broadcast('scroll.refreshComplete');
    }
})



//-------------------------------------------------------------------------------------------
//--- Post Controller
//-------------------------------------------------------------------------------------------
.controller('PostCtrl', function($scope, $http, $stateParams, $ionicLoading, $ionicPopup, WpConfig, LoaderService, MyApHpDataService, getUserPrefs, wpApi){
    console.log($stateParams.postId);
    var urlBase = WpConfig.WpBaseUrl;
    var url = urlBase+ WpConfig.WpUrlPosts+'/'+$stateParams.postId;
    
    
    $scope.$on('$ionicView.enter', function(e) {
        wpApi.getWPPost($stateParams.postId).then(function(data){
            $scope.wpPosts = data;
            $scope.postTitle = data[0].title;
            $scope.postContent = data[0].content;
            $scope.hasThumb = data[0].hasThumb;
            $scope.postThumb = data[0].thumb;
            $scope.classPortrait = data[0].classPortrait;
            $scope.imgPortrait = data[0].imgPortrait;
            $scope.nomPortrait = data[0].nomPortrait;
            $scope.titrePortrait = data[0].titrePortrait;
            // console.log('Post Has Thumb : '+data[0].hasThumb)
            //--- Gestion icone favoris
            $scope.favIcon = "ion-ios-star-outline";
            MyApHpDataService.checkFavQuery(data[0].id, function(data){
                
                if(data > 0){
                    $scope.favIcon = "ion-ios-star";
                }else{
                    $scope.favIcon = "ion-ios-star-outline";
                }
            });

            //--- icone reseau offline
            $scope.network = getUserPrefs.netIconStatus();

            //--- masquage loader
            $ionicLoading.hide();
        });

    });

    //--- verification si en favori
    $scope.checkFav = function(){
        MyApHpDataService.checkFavQuery($scope.wpPosts[0].id, function(data){
            
            if(data > 0){
                MyApHpDataService.removeFavorite($scope.wpPosts[0].id);  
                        
                $scope.favIcon = "ion-ios-star-outline ";
                var alertPopup = $ionicPopup.alert({
                    title: 'Mes Favoris',
                    template: 'Article supprimé de mes favoris'
                });
            }else{
                MyApHpDataService.addFavorite($scope.wpPosts);
                $scope.favIcon = "ion-ios-star";
                var alertPopup = $ionicPopup.alert({
                    title: 'Mes Favoris',
                    template: 'Article Ajouté à mes favoris'
                });
            }
        });
    }

})

//-------------------------------------------------------------------------------------------
//--- Favorite Controller (SINGLE)
//-------------------------------------------------------------------------------------------
.controller('favoriteCtrl', function($scope, $state, $ionicPopup, $ionicLoading, $http, $stateParams, $cordovaFileTransfer, $ionicLoading, sessionService, WpConfig, MyApHpDataService){
    console.info($stateParams.favoriteId);
    console.log("favorite Single");

    var id = $stateParams.favoriteId;

    MyApHpDataService.getFavoriteQuery(id, function(data){
        $scope.favTitle = data[0].title;
        $scope.favContent = data[0].content;
    })

    $scope.removePostFromFavorites = function(){

        var confirmPopup = $ionicPopup.confirm({
                 title: 'Effacer le favori',
                 template: 'Voulez vous vraiment effacer ce favori?'
               });

            confirmPopup.then(function(res) {
                 if(res) {
                   
                   MyApHpDataService.removeFavorite(id);
                   $state.go('app.favorites');
                 } 
            });

    }
})

//-------------------------------------------------------------------------------------------
//--- Favorites Controller
//-------------------------------------------------------------------------------------------
.controller('favoritesCtrl', function($scope, $state, $ionicPopup, $http, $ionicLoading, $cordovaFileTransfer, $ionicLoading, sessionService, WpConfig, MyApHpDataService, MyApHpDataService){

        //--- Fonction de récupération de tous les favoris (Service : MyApHpDataService / Methode : getAllFavoriteQuery)
        $scope.$on('$ionicView.enter', function(e) {
            MyApHpDataService.getAllFavoriteQuery(function(data){
                $scope.itemsList = data;

                //--- Arrêt du loader
                $ionicLoading.hide();
            })
        })

        //--- Fonction d'effacement de tous les favoris (Service : MyApHpDataService / Methode : emptyPosts)
        $scope.emptyPosts = function(){
               var confirmPopup = $ionicPopup.confirm({
                 title: 'Effacer les favoris',
                 template: 'Voulez vous vraiment effacer tous les favoris?'
               });

            confirmPopup.then(function(res) {
                 if(res) {
                    MyApHpDataService.emptyPosts();
                    $state.reload();
                 } 
            });

        }
})

//-------------------------------------------------------------------------------------------
//--- Help Controller
//-------------------------------------------------------------------------------------------
.controller('helpCtrl', function($scope, $state, $ionicPopup, $http, $ionicLoading, $cordovaFileTransfer, $ionicLoading, sessionService, WpConfig, MyApHpDataService, MyApHpDataService){
     $scope.$on('$ionicView.enter', function(e) {

       var id = 964; 
       MyApHpDataService.getOfflinePage(id, function(data){
            $scope.pageTitle = data[0].title;
            $scope.pageContent = data[0].content;
        })
        $ionicLoading.hide();
     })
})

//-------------------------------------------------------------------------------------------
//--- Search Controller
//-------------------------------------------------------------------------------------------
.controller('searchCtrl', function($scope, $http, $stateParams, $ionicLoading, $ionicPopup, WpConfig, LoaderService, MyApHpDataService, getUserPrefs, $cordovaKeyboard){
    
    //--- initialisations
    var urlBase = WpConfig.WpBaseUrl;
    var filter = ""
    //--- Fonctions à lancer au chargement de la vue
    $scope.$on('$ionicView.enter', function(e) {
        filter = getUserPrefs.getFilter();
        //--- Arrêt du loader
        $ionicLoading.hide();
    })
    

    //--- Méthode de recherche
    $scope.submitSearch = function(search, $event){
        console.log('Submit search');
        $scope.wpPosts = [];
        var urlQuery = urlBase+ WpConfig.WpUrlPosts+"?search="+search+filter+"&per_page=100";
        if(window.cordova){
            $cordovaKeyboard.close();
        }
        //--- Execution de la requete de recherche
        $http.get(urlQuery).then(
            function success(response){
                var data = response.data;

                var i = 0;
                console.log(data.length);
                if (data.length > 0){
                    data.forEach(function(element) {
                        var postID = "#/app/post/"+data[i].id;                                //POSTID 
                        var title = data[i].title.rendered;                     //TITRE
                        $scope.wpPosts.push({postID: postID, title: title});
                        i++;
                    });    
                }else{
                    var postID = "#/app/search";                                //POSTID 
                    var title = "Aucun résultat pour cette recherche...";                     //TITRE
                    $scope.wpPosts.push({postID: postID, title: title});
                }
                
            },
            function error(response){

            }
        )
    }

})

//-------------------------------------------------------------------------------------------
//--- External Controller
//-------------------------------------------------------------------------------------------
.controller('ExtCtrl', function($scope, $cordovaInAppBrowser, $stateParams, sessionService) {
    //console.info('PARAM : '+ JSON.stringify($stateParams.extURL));
    extURL = sessionService.get("ExtURL");
    console.log(extURL);
   var options = {
      location: 'yes',
      clearcache: 'yes',
      toolbar: 'yes'
   };

   // openBrowser()
   $scope.$on("$ionicView.enter", function(event, data){
        // $scope.openBrowser();  

    });

   $scope.openBrowser = function() {
      $cordovaInAppBrowser.open( extURL, '_blank', options)
        
      .then(function(event) {
         // success
      })
        
      .catch(function(event) {
         // error
      });
   }

})

.controller('NavCtrl', function($scope, $stateParams, $ionicSideMenuDelegate, wpApi) {
    //console.info('PARAM : '+ JSON.stringify($stateParams));
    

    $scope.menuTitre = "test Titre";
    //console.log($scope.menuitems);
    $scope.closeMenu = function (item) {
        // parent.items.length;
        console.log('ITEM : ' + JSON.stringify(item.destURL));
        if(item.destURL!=""){
             //console.log('------ >close Menu : ' + parent.items.length);    
            console.log('ITEM : '+JSON.stringify(item));
            $scope.menuTitre = item.name; 
            $ionicSideMenuDelegate.toggleLeft();  
        }
        
        //
    }

    $scope.showMenu = function() {
        console.info('PARAM : '+ JSON.stringify($stateParams));
        wpApi.getWPMenus().then(function(data){
            // console.log('******* GET LEFT MENUS *******')
            $scope.wpCategories = data;
            //$scope.network = getUserPrefs.netIconStatus();
            //$ionicLoading.hide();

            
        })
        //
        $ionicSideMenuDelegate.toggleLeft();
    };

    $scope.showRightMenu = function () {
        $ionicSideMenuDelegate.toggleRight();
    };

     //--- gestion des accordéons
    //--- cf. codepen : https://codepen.io/shengoo/pen/bNbvdO/
    $scope.toggleGroup = function(cat) {
        cat.show = !cat.show;
    };
    $scope.isGroupShown = function(cat) {
        return cat.show;
    };
})