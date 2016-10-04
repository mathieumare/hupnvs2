// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
//var db = null;

angular.module('hupnvs2', ['ionic', 'hupnvs2.controllers', 'ngStorage', 'ngCordova'])

.run(function($ionicPlatform, $ionicPopup, MyApHpDataService, sessionService, $q) {
    $ionicPlatform.ready(function(){
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
        navigator.splashscreen.hide();

        //--- Initialisation BD Locale et Synchronisation des données Offline
        MyApHpDataService.openDbObject().then(function(data){
     

            var prom = [];
            prom.push(MyApHpDataService.syncOfflineMenu());
            prom.push(MyApHpDataService.syncOfflinePosts("post"))
            prom.push(MyApHpDataService.syncOfflinePosts("page"))
            prom.push(MyApHpDataService.syncOfflineCategories())

            $q.all(prom).then(function() {
                console.info("DB init : "+JSON.stringify(data));
                            });     
        });
    // });

    if (window.cordova && window.cordova.plugins.Keyboard) {
      console.log('deviceReady');
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

  });
})


//----------------------------------------------------------------------------------------------------
//--- Service de verification de la connectivité reseau
//----------------------------------------------------------------------------------------------------
.service ('CheckConnection', function($ionicPlatform, $ionicPopup){
        this.internetCheck=function(){
            $ionicPlatform.ready(function(){
                console.log("internetCheck")
                if(window.Connection) {
                    var callback = '1';
                    return callback; 
                }else{
                    var callback = '0';
                    return callback; 
                }
            });
        }
})

//----------------------------------------------------------------------------------------------------
//--- Service de récupértion de données WP (wp api)
//----------------------------------------------------------------------------------------------------
.service('wpApi', function($ionicPlatform, $http, WpConfig, NetworkSettings, getUserPrefs, $cacheFactory, $cordovaSQLite, $q, $ionicSlideBoxDelegate, MyApHpDataService,sessionService){
    this.getThumb = function(postId){
        $ionicPlatform.ready(function(){
            var urlQuery = WpConfig.WpBaseUrl+"media/"+postId;
            console.log("getThumb Function : "+ urlQuery);
                $http.get(urlQuery,{ timeout: NetworkSettings.TimeOut }).then(
                    function success(response){
                        var data = response.data;
                        var thumbUrl = data.media_details.sizes.medium.source_url;
                        console.info("thumb url : "+thumbUrl);
                        return thumbUrl;
                    },
                    function error(response){
                        var data = response.data;  
                    }
                )
        });
    }

    this.getWPMenusGroup = function(parent){
        var url = WpConfig.WpUrl;
            var menuId = WpConfig.WpMenuId;
            console.log ('***** getWPMenus '+menuId+' *****')
            var urlQuery = WpConfig.WpUrl+'wp-json/wp-api-menus/v2/menus/'+menuId;

            console.log ('------> getWPMenus query : '+urlQuery)
            //$cacheFactory.get('$http').removeAll()

            $http.get(urlQuery,{ timeout: NetworkSettings.TimeOut,cache:false }).then(
                function success(response){
                }
            );
            return;
    }

    this.getWPMenus = function(){
        var deferred = $q.defer();

        $ionicPlatform.ready(function(){

            // MyApHpDataService.publicExecSQL('SELECT id from POSTS').then(function(datas){
            //     console.log('----> posts : '+datas.rows.length)
            // })
            
            var url = WpConfig.WpUrl;
            var menuId = WpConfig.WpMenuId;
            console.log ('***** getWPMenus '+menuId+' *****')
            var urlQuery = WpConfig.WpUrl+'wp-json/wp-api-menus/v2/menus/'+menuId;

            console.log ('------> getWPMenus query : '+urlQuery)
            //$cacheFactory.get('$http').removeAll()

            $http.get(urlQuery,{ timeout: NetworkSettings.TimeOut,cache:false }).then(
                function success(response){
                    console.log ('------> getWPMenus ONLINE')
                    sessionService.set("online", 1);
                    createMenuStruct(response.data.items).then(function(data){
                        deferred.resolve(data);
                        
                    })
                },
                function error(response){
                    console.log ('------> getWPMenus OFFLINE : '+ JSON.stringify(response))
                    sessionService.set("online", 0);
                    var data = sessionService.get("menuStruct");
                    createMenuStruct(data).then(function(data){
                        deferred.resolve(data);
                        
                    })
                })
        })
        return deferred.promise;
    }

    this.getWPMenusItem = function(item){
        var deferred = $q.defer();

        $ionicPlatform.ready(function(){

            // MyApHpDataService.publicExecSQL('SELECT id from POSTS').then(function(datas){
            //     console.log('----> posts : '+datas.rows.length)
            // })
            var url = WpConfig.WpUrl;
            var menuId = WpConfig.WpMenuId;
            console.log ('***** getWPMenusItems '+item+' *****')
            var urlQuery = WpConfig.WpUrl+'wp-json/wp-api-menus/v2/menus/'+menuId;

            console.log ('------> getWPMenus query : '+urlQuery)
            //$cacheFactory.get('$http').removeAll()

            $http.get(urlQuery,{ timeout: NetworkSettings.TimeOut,cache:false }).then(
                function success(response){
                    console.log ('------> getWPMenusItems ONLINE')
                    sessionService.set("online", 1);
                    createMenuStructItem(response.data.items, item).then(function(data){
                        deferred.resolve(data);
                        
                    })
                },
                function error(response){
                    console.log ('------> getWPMenus OFFLINE : '+ JSON.stringify(response))
                    sessionService.set("online", 0);
                    var data = sessionService.get("menuStruct", item);
                    createMenuStructItem(data, item).then(function(data){
                        deferred.resolve(data);
                        
                    })
                })
        })
        return deferred.promise;
    }


    //--- Methode de récupération des catégories (filtrées suivant les preferences utilisateur)
    this.getWPCat = function(){
        var deferred = $q.defer();

        var urlBase = WpConfig.WpBaseUrl;
        var filter = "";
        filter = getUserPrefs.getFilter();

        var urlQuery = urlBase+ WpConfig.WpUrlCat + "?per_page=100"+"&exclude=1";
        $http.get(urlQuery,{ timeout: NetworkSettings.TimeOut }).then(
            function success(response){
                createCatStruct(response.data).then(function(data){
                    deferred.resolve(wpCategories);
                    sessionService.set("online", 1);
                })
            },
            function error(response){

                createOfflineCatStruct(response.data).then(function(data){
                    deferred.resolve(wpCategories);
                    sessionService.set("online", 0);
                })
            }
        )
        return deferred.promise;
    }


    //--- Methode de récupération des articles de la catégorie (filtrées suivant les preferences utilisateur)
    this.getWPPosts = function(catID){
        var deferred = $q.defer();
        console.log('catID : '+catID)
        var urlBase = WpConfig.WpBaseUrl;
        var filter = "";
        filter = getUserPrefs.getFilter();

        var prefix = catID.substring(0,1);
        var postID = 0;

        // if(prefix == "p" || prefix == "a" ){
        //     //postID = postID.substring(1,postID.length);
        // }else{

        var urlQuery = urlBase+ WpConfig.WpUrlPosts+'?per_page=100&categories='+catID+filter;
        
        //--- Requète de récupération des ARTICLES de la catégorie
        $http.get(urlQuery,{ timeout: NetworkSettings.TimeOut }).then(
            function success(response){
                sessionService.set("online", 1);
                var data = response.data;
                var wpPosts = [];
                var i = 0;
                data.forEach(function(element) {
                    var postID = data[i].id;                                //POSTID 
                    var title = data[i].title.rendered;                     //TITRE
                    var thumb = data[i].acf.vignette;                     //THUMB
                    var hasThumb = '';
                    if(thumb){
                        hasThumb = 'has-thumb';
                    }
                    wpPosts.push({postID: postID, title: title, thumb: thumb, hasThumb : hasThumb});
                    i++;
                });
                deferred.resolve(wpPosts);
                
                //--- Arrêt du loader
                //$ionicLoading.hide();
            },
            function error(response){

                sessionService.set("online", 0);
                var wpPosts = [];
                var datas = response.data;
                // var alertPopup = $ionicPopup.alert({
                //     title: 'Erreur',
                //     template: 'Problème de connexion réseau...'
                // });

                //*** TODO : Ajouter filtre catégorie dans la table POSTS ou dans une table de corresp
                MyApHpDataService.publicExecSQL('SELECT * FROM POSTS WHERE ID in (SELECT DISTINCT POST_ID FROM POST_CAT WHERE CAT_ID = '+catID+')').then(function(datas){
                    //console.log("OFFLINE : " + JSON.stringify(datas.rows.item(0)));
                    dataArray = [];

                    for(i=0; i< datas.rows.length; i++){
                        //console.log(JSON.stringify(datas.rows.item(i).id))
                        var postID = datas.rows.item(i).id;
                        var title = datas.rows.item(i).title;

                        dataArray.push({postID: postID, title: title});
                    }
                    deferred.resolve(dataArray);
                    
                });
            }
        );
        // }
        return deferred.promise;
    }

    //--- Methode de récupération d'un article 
    this.getWPPost = function(postID){
        console.log('getWPPost : '+postID)
        
        var postType = "post"

        var deferred = $q.defer();
        var prefix = postID.substring(0,1);

        if(prefix == "p"){
            postType = "page";
            postID = postID.substring(1,postID.length);
        }

        if(prefix == "a"){
            postID = postID.substring(1,postID.length);
        }

        var urlBase = WpConfig.WpBaseUrl;

        if (postType=="page"){
            var url = urlBase+ WpConfig.WpUrlPages+'/'+postID;
            console.log("page : " +url)
        }else{
            var url = urlBase+ WpConfig.WpUrlPosts+'/'+postID;    
            console.log("post : " +url)
        }
        
   
        var postData = [];
        $http.get(url,{ timeout: NetworkSettings.TimeOut }).then(
        function success(response){
             sessionService.set("online", 1);
            var data = response.data;
            //console.log("data : "+JSON.stringify(data));
            var thumb = data.acf.vignette;                     //THUMB
            var hasThumb = '';
            if(thumb){
                hasThumb = 'has-thumb';
            }
            var postTitle = data.title.rendered;
            // var thumbTitle = data.acf.titre_vignette;                     //THUMB TITLE
            if(data.acf.titre_vignette){
                postTitle = data.acf.titre_vignette
            }
            // wpPosts.push({postID: postID, title: title, thumb: thumb, hasThumb : hasThumb});
            
            postData.push({id: data.id,title: data.title.rendered,content: data.content.rendered, thumb: thumb, hasThumb : hasThumb})
            
            deferred.resolve(postData);  
             
        },
        function error(response){
            console.log('getWPPost : Offline '+postID)
            sessionService.set("online", 0);
            var wpPosts = [];
            var datas = response.data;
            MyApHpDataService.publicExecSQL('select id from POSTS').then(function(datas){
                console.log('TEST : '+ JSON.stringify(datas.rows));  
            })                     

            MyApHpDataService.publicExecSQL('SELECT * FROM POSTS WHERE ID = ?',[postID]).then(function(datas){
                dataArray = [];

                //for(i=0; i< datas.rows.length; i++){
                for(i=0; i< 1; i++){
                    var postID = datas.rows.item(i).id;
                    var title = datas.rows.item(i).title;
                    var content = datas.rows.item(i).content;
                    dataArray.push({id:postID, title: title, content : content});
                }
                console.log('datas : ' + JSON.stringify(datas) )
                deferred.resolve(dataArray);
                
            })
        });
        return deferred.promise;
    }



    // createOfflineCatStruct = function(data){
    //     var deferred = $q.defer();
    //     // var data = response.data;


    //     wpCategories = [];
    //     // var alertPopup = $ionicPopup.alert({
    //     //     title: 'Erreur',
    //     //     template: 'Problème de connexion réseau...'
    //     // });

    //     MyApHpDataService.publicExecSQL('SELECT * FROM CATEGORIES').then(function(datas){
    //         //console.log("OFFLINE : " + JSON.stringify(datas.rows.item(0)));
    //         dataArray = [];

    //         for(i=0; i< datas.rows.length; i++){
    //             var id = datas.rows.item(i).id;
    //             var name = datas.rows.item(i).name;
    //             var parent = datas.rows.item(i).parent;
               
    //             dataArray.push({id:id, name:name,parent:parent});
    //         }

    //         //console.log('dataArray : ' + dataArray);

    //         createCatStruct(dataArray).then(function(data){
    //             deferred.resolve(wpCategories);
    //         })
    //     })

    //     return deferred.promise;
    // }

    //--- fonction de génération de la structure d'affichage des catégories
    // createCatStruct = function(data){
    //     //console.log('createCatStruct'+data)
    //     var deferred = $q.defer();
    //     //var data = response.data;
    //     wpCategories = [];
    //     //console.log(urlQuery);
    //     var i = 0;
    //     var groupNum = 0;

    //     data.forEach(function(element) {
    //         var catID = data[i].id; //POSTID 
    //         var name = data[i].name; //TITRE
    //         var parent = data[i].parent; //PARENT
    //         //console.log(title)
    //         //console.log('ID : '+catID+' Parent : '+parent);
            
    //         //--- Catégories Principales
    //         if(data[i].parent === 0){
                
    //             var itemArr = [];
    //             wpCategories[groupNum]={
    //                 catID: catID,
    //                 name: name,
    //                 items: [],
    //                 destURL : '#/app/cat/'+catID,
    //                 iconplus: '',
    //                 iconminus: ''
    //             };
    //             groupNum++;
    //         }
    //         //--- Sous Catégories
    //         else{
    //             wpCategories[groupNum-1].items.push({
    //                 catID: catID,
    //                 name: name,
    //                 destURL : '#/app/cat/'+catID
    //             });

    //             wpCategories[groupNum-1].iconplus = 'ion-plus';
    //             wpCategories[groupNum-1].iconminus = 'ion-minus';
    //             wpCategories[groupNum-1].destURL = '#';
    //         }
            
    //         i++;
    //     });
    //     deferred.resolve(wpCategories);
    //     return deferred.promise;
    // }

    createMenuStructItem = function(data, catId){
        console.log('createMenuStructItem : '+catId)
        var deferred = $q.defer();
        var clickFn = '';
        var wpMenu = [];

        for(var i=0; i< data.length; i++){
            var menuEntryType = data[i].object;
            var catID = data[i].object_id;
            var name = data[i].title;
            var parentID = 0;
            var itemID = 0;

            var destURL = '';

            if(catId == catID){
                parentID = data[i].parent
                if(parentID > 0){
                    itemID = parentID;
                }else{
                    itemID = data[i].id;
                }
                console.log ('PARENT ID : '+ itemID);
                i=data.length;
            }

        }

        for(var i=0; i< data.length; i++){
            if(itemID == data[i].id){
                var menuEntryType = data[i].object;
                var catID = data[i].object_id;
                var name = data[i].title;
                var destURL = '';

                switch(menuEntryType){
                    case 'category': 
                        destURL = '#/app/cat/'+catID;    
                        break;
                    case 'post': 
                        destURL = '#/app/post/a'+catID;    
                        break;
                    case 'page': 
                        destURL = '#/app/post/p'+catID;    
                        break;
                    case 'custom': 
                        console.log("custom Menu Entry "+encodeURIComponent(data[i].url))
                        
                        sessionService.set("ExtURL",data[i].url);
                        destURL = '#';    
                        clickFn = 'openBrowser()'; 
                        break;
                    default: 
                        destURL = '#/app/cat/'+catID;    
                }

                wpMenu[i] = {
                    catID: catID,
                    name: name,
                    items: [],
                    destURL : destURL,
                    clickFn : clickFn,
                    iconplus: '',
                    iconminus: ''
                }

                //--- Gestion des sous menus
                var childsCount = 0;
                if (data[i].children){
                    childsCount = data[i].children.length;

                    for(j = 0; j < data[i].children.length; j++ ){
                        var subMenuEntryType = data[i].children[j].object;
                        var subMenuID = data[i].children[j].object_id;
                        var subMenuName = data[i].children[j].title;
                        
                        switch(subMenuEntryType){
                            case 'category': 
                                destURL = '#/app/cat/'+subMenuID;    
                                break;
                            case 'post': 
                                destURL = '#/app/post/a'+subMenuID;    
                                break;
                            case 'page': 
                                destURL = '#/app/post/p'+subMenuID;    
                                break;
                            case 'custom': 
                                console.log("custom Sub Menu Entry")
                                var extURL =  data[i].children[j].url
                                // toParamsJson = JSON.stringify(extURL);
                                // destURL = '#/ext/'+extURL;    
                                destURL = '#';  
                                clickFn = 'openBrowser()';
                                break;
                            default: 
                                destURL = '#/app/cat/'+subMenuID;    
                        }

                        wpMenu[i].items.push({
                            catID: subMenuID,
                            name: subMenuName,
                            destURL : destURL,
                            clickFn : clickFn
                        });

                        wpMenu[i].iconplus = 'ion-plus';
                        wpMenu[i].iconminus = 'ion-minus';
                        wpMenu[i].destURL = '#';
                    }
                }
                i=data.length;
            }
        }

        deferred.resolve(wpMenu);
        return deferred.promise;
    }



    createMenuStruct = function(data){
        console.log('createMenuStruct : '+data.length)

        var deferred = $q.defer();
        var clickFn = '';
        var wpMenu = [];
        
        for(var i=0; i< data.length; i++){
            // console.log('ROW ' + i);

            var menuEntryType = data[i].object;
            var catID = data[i].object_id;
            var name = data[i].title;
            var destURL = '';
            // console.log(menuEntryType + catID)
            switch(menuEntryType){
                case 'category': 
                    destURL = '#/app/cat/'+catID;    
                    break;
                case 'post': 
                    destURL = '#/app/post/a'+catID;    
                    break;
                case 'page': 
                    destURL = '#/app/post/p'+catID;    
                    break;
                case 'custom': 
                    console.log("custom Menu Entry "+encodeURIComponent(data[i].url))
                    
                    sessionService.set("ExtURL",data[i].url);
                    destURL = '#';    
                    clickFn = 'openBrowser()'; 
                    break;
                default: 
                    destURL = '#/app/cat/'+catID;    
            }
            // console.log('----->'+destURL)
            
            wpMenu[i] = {
                catID: catID,
                name: name,
                items: [],
                destURL : destURL,
                clickFn : clickFn,
                iconplus: '',
                iconminus: ''
            }
            
            //--- Gestion des sous menus
            var childsCount = 0;
            if (data[i].children){
                childsCount = data[i].children.length;

                for(j = 0; j < data[i].children.length; j++ ){
                    var subMenuEntryType = data[i].children[j].object;
                    var subMenuID = data[i].children[j].object_id;
                    var subMenuName = data[i].children[j].title;
                    
                    switch(subMenuEntryType){
                        case 'category': 
                            destURL = '#/app/cat/'+subMenuID;    
                            break;
                        case 'post': 
                            destURL = '#/app/post/a'+subMenuID;    
                            break;
                        case 'page': 
                            destURL = '#/app/post/p'+subMenuID;    
                            break;
                        case 'custom': 
                            console.log("custom Sub Menu Entry")
                            var extURL =  data[i].children[j].url
                            // toParamsJson = JSON.stringify(extURL);
                            // destURL = '#/ext/'+extURL;    
                            destURL = '#';  
                            clickFn = 'openBrowser()';
                            break;
                        default: 
                            destURL = '#/app/cat/'+subMenuID;    
                    }

                    wpMenu[i].items.push({
                        catID: subMenuID,
                        name: subMenuName,
                        destURL : destURL,
                        clickFn : clickFn
                    });

                    wpMenu[i].iconplus = 'ion-plus';
                    wpMenu[i].iconminus = 'ion-minus';
                    wpMenu[i].destURL = '';
                }
            }

        }
        //console.log(JSON.stringify(wpMenu))
        deferred.resolve(wpMenu);
        return deferred.promise;
    }

    
        
        // for(var i=0; i< data.items.length; i++){
        //     console.log('ROW ' + i);

        //     var menuEntryType = data.items[i].object;
        //     var catID = data.items[i].object_id;
        //     var name = data.items[i].title;
        //     var destURL = '';
            
        //     if(menuEntryType=='category'){
        //         destURL = '#/app/cat/'+catID;
        //     }

        //     if(menuEntryType=='post'){
        //         //console.log(menuEntryType + catID)
        //         destURL = '#/app/post/a'+catID;   
        //     }

        //     if(menuEntryType=='page'){
        //         //console.log(menuEntryType + catID)
        //         destURL = '#/app/post/p'+catID;   
        //     }

        //     wpMenu[i] = {
        //         catID: catID,
        //         name: name,
        //         items: [],
        //         destURL : destURL,
        //         iconplus: '',
        //         iconminus: ''
        //     }
            
        //     //--- Gestion des sous menus
        //     var childsCount = 0;
        //     if (data.items[i].children){
        //         childsCount = data.items[i].children.length;

        //         for(j = 0; j < data.items[i].children.length; j++ ){
        //             var subMenuEntryType = data.items[i].children[j].object;
        //             var subMenuID = data.items[i].children[j].object_id;
        //             var subMenuName = data.items[i].children[j].title;
                    
        //             if(subMenuEntryType=='category'){
        //                 destURL = '#/app/cat/'+subMenuID;
        //             }

        //             if(subMenuEntryType=='post'){
        //                 destURL = '#/app/post/'+subMenuID;   
        //             }

        //             if(menuEntryType=='page'){
        //                 destURL = '#/app/post/'+subMenuID;   
        //             }

        //             wpMenu[i].items.push({
        //                 catID: subMenuID,
        //                 name: subMenuName,
        //                 destURL : destURL
        //             });

        //             wpMenu[i].iconplus = 'ion-plus';
        //             wpMenu[i].iconminus = 'ion-minus';
        //             wpMenu[i].destURL = '#';
        //         }
        //     }

        // }
        //console.log(JSON.stringify(wpMenu))
    //     deferred.resolve(wpMenu);
    //     return deferred.promise;
    // }

    //--- Methode de récupération des post du diaporama (filtrés suivant les preferences utilisateur)
    this.wpGetDiapo = function(){
        var deferred = $q.defer();
        var urlBase = WpConfig.WpBaseUrl;
        var filter = "";
        filter = getUserPrefs.getFilter();

        var urlQuery = urlBase+ WpConfig.WpUrlPosts+'?per_page=3'+filter+"&_embed";
        // //console.log(urlQuery)

        //--- Requète de récupération des ARTICLES
        $http.get(urlQuery).success(function(data){
            wpPosts = [];
            var i = 0;
            data.forEach(function(element) {
                var postID = data[i].id;                                //POSTID 
                var title = data[i].title.rendered;                     //TITRE
                

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

                wpPosts.push({postID: postID, title: title, thumb: thumbUrl});
                i++;
                // console.log(JSON.stringify(data[i]))
            });
            $ionicSlideBoxDelegate.update();
            deferred.resolve(wpCategories);
            // //--- Arrêt du loader
            // $ionicLoading.hide();
        });

        return deferred.promise;
    }

})

//----------------------------------------------------------------------------------------------------
//--- Service de gestion du stockage local
//----------------------------------------------------------------------------------------------------
.factory('sessionService',['$http',function($http){
return {
   set:function(key,value){
      return localStorage.setItem(key,JSON.stringify(value));
   },
   get:function(key){
     return JSON.parse(localStorage.getItem(key));
   },
   destroy:function(key){
     return localStorage.removeItem(key);
   },
 };
}])


//----------------------------------------------------------------------------------------------------
//--- Service récuperation des préférences utilisateur
//----------------------------------------------------------------------------------------------------
.service('getUserPrefs', function($ionicPlatform, $http, $stateParams, $ionicLoading, NetworkSettings, WpConfig, sessionService, LoaderService){
    this.getFilter = function(){
        //--- Récupération des constantes de configuration
        var urlBase = WpConfig.WpBaseUrl;
        filter = '';

        // //--- Récupération des préférences utilisateur
        // ghList = sessionService.get("ghList");
        // var filter = '&filter[myaphpgh]=aphp,ap-hp';
        // var i = 0;
        // if(ghList){
        //     ghList.forEach(function(){
        //     var ghSlug = ghList[i];
        //     filter += ','+ghSlug;
        //     i++;
        // })
        // }

        // metiersList = sessionService.get("metiersList");
        // filter += '&filter[myaphpmetier]=aphp,ap-hp';
        // var i = 0;

        // if(metiersList){
        // metiersList.forEach(function(){
        //         var metierSlug = metiersList[i];
        //         filter += ','+metierSlug;
        //         i++;
        //     })
        // }
        


        return filter;    
    }

    //--- Fonction pour affichage icone reseau offline
    this.netIconStatus = function(){
        var online = sessionService.get("online");
        console.log('online : '+ online);
        var network = '';

        if(online <= 0){
            network = 'network-off ion-ios-bolt';
        }
        return network;
    }
    
})



//----------------------------------------------------------------------------------------------------
//--- Service de gestion de Base de donnée locale
//----------------------------------------------------------------------------------------------------
.factory('MyApHpDataService', function ($q, $http,$cordovaSQLite, $ionicPlatform,LoaderService, WpConfig, getUserPrefs, sessionService) {
    
    //--- déclarations des variables
    var db, dbName = "myaphp.db";
    var urlBase = WpConfig.WpBaseUrl;
    
    //--- fonction de retour des erreurs
    function onErrorQuery(err){
      console.error("SQLITE ERROR : "+JSON.stringify(err))
      alert("SQLITE ERROR : "+JSON.stringify(err))
    }

    //--- fonction d'instanciation WEBSQL
    function useWebSql() {
      db = window.openDatabase(dbName, "1.0", "Note database", 200000)
      console.info('Using webSql')
    }

    //--- fonction d'instanciation SQLITE
    function useSqlLite() {
      db = $cordovaSQLite.openDB({name: dbName, location: 1})
      console.info('Using SQLITE : '+ JSON.stringify(db));
    }

    //--- Fonction d'execution d'une requete SQLite
    //--- ARG : chaine contenant la requete complete
    var execSQL = function(query, params, log){
      var deferred = $q.defer();
      if(!params){
        $cordovaSQLite.execute(db, query)
        .then(function(res){
            if(log){
                console.info("SQL Success: "+query );    
            }        
            setTimeout(function(){
              deferred.resolve(res);  
            }, 0)
            
        }, onErrorQuery)
      }else{
        $cordovaSQLite.execute(db, query, params)
        .then(function(res){
            if(log){
                console.info("SQL Success: "+query );    
            }
            setTimeout(function(){
              deferred.resolve(res);  
            }, 0)
            
        }, onErrorQuery)
       
      }
      
      return deferred.promise;
    }


    //--- Fonction de mise à jour d'une structure de table (ajout de colonne)
    //--- ARG : 
    //---       - Nom de la table a mettre à jour   (chaine)
    //---       - Nom du champ à ajouter            (chaine)
    //---       - Type du champ à ajouter           (chaine)(default: text)
    var updateStruct = function(table, field, type){
      
      var deferred = $q.defer();
      var query = 'PRAGMA table_info('+table+')';

      if(!type){
        type = 'text';
      }
      //console.log ('updateStruct : '+ query)
      $cordovaSQLite.execute(db, query)
      .then(function(res){
        var fieldFound = 0;
        for(var i=0; i<res.rows.length; i++){
            var currentField = res.rows.item(i).name;
            if (field == currentField){
                fieldFound = 1;
            }
        }

        if(fieldFound == 0){
            var queryAlter = 'ALTER TABLE '+table+' ADD COLUMN '+ field +' '+ type;
            //console.log(queryAlter);

            $cordovaSQLite.execute(db, queryAlter).then(function(){
                setTimeout(function(){
                    deferred.resolve("Success");  
                }, 0)  
            });
            
        }else{
            //console.info('Add col "'+ field +'" to table "'+table+'" : no update needed');
            deferred.resolve("Success");    
        }
        
      }, onErrorQuery);
      return deferred.promise;
    }
    
    //--- fonction d'init de la base choisie
    var initDatabase = function(result){
        var deferred = $q.defer();
        // var query1 = 'DROP TABLE IF EXISTS DUMP_POSTS';
        // var query2 = 'CREATE TABLE IF NOT EXISTS DUMP_POSTS (id integer primary key, title, content, favorite integer)';
        // var query3 = 'INSERT INTO DUMP_POSTS(id, title, content, favorite) SELECT id, title, content, favorite FROM POSTS';
        // var query4 = 'DROP TABLE IF EXISTS POSTS';
        // var query5 = 'CREATE TABLE IF NOT EXISTS POSTS (id integer primary key, title, content, favorite integer, post_type text default "post")';

        //--- creation des tables
        var query1 = 'CREATE TABLE IF NOT EXISTS POSTS (id integer primary key, title, content, favorite integer, post_type text default "post")';
        var query2 = 'CREATE TABLE IF NOT EXISTS CATEGORIES (id integer primary key, name, parent)';
        var query3 = 'CREATE TABLE IF NOT EXISTS POST_CAT (id integer primary key autoincrement, cat_id integer, post_id integer)';
        var query4 = 'CREATE TABLE IF NOT EXISTS GH (id integer primary key, title text)';
        var query5 = 'CREATE TABLE IF NOT EXISTS METIER (id integer primary key, title text)';
        
        //--- execution des requetes d'initialisation en séquence       
        execSQL(query1)
        .then(function(){
            return execSQL(query2);
        })
        .then(function(){
            return execSQL(query3);
        })
        .then(function(){
            return execSQL(query4);
        })
        .then(function(){
            return execSQL(query5);
        })
        .then(function(){
            return updateStruct('POSTS', 'favorite', 'integer');
        })
        .then(function(){
            return updateStruct('POSTS', 'post_type');
        })
        .then(function(){
            return updateStruct('CATEGORIES', 'entry_type');
        })
        .then(function(){
            deferred.resolve("Success");
        });

        return deferred.promise;
    }
 
    // $ionicPlatform.ready(function () {
   
    // })


 
    
    //--- Déclaration des méthodes du service
    return {
        //--- Fonction d'execution d'une requete SQLite
        //--- ARG : chaine contenant la requete complete
        publicExecSQL : function(query, params, log){

          var deferred = $q.defer();
          $ionicPlatform.ready(function () {
              if(!params){
                $cordovaSQLite.execute(db, query)
                .then(function(res){
                    if(log){
                        console.info("SQL Success: "+query );    
                    }
                    
                    setTimeout(function(){
                      deferred.resolve(res);  
                    }, 0)
                    
                }, onErrorQuery)
                
              }else{
                $cordovaSQLite.execute(db, query, params)
                .then(function(res){
                    if(log){
                        console.info("SQL Success: "+query );    
                    }
                    setTimeout(function(){
                      deferred.resolve(res);  
                    }, 0)
                    
                }, onErrorQuery)
                
              }
            });

          return deferred.promise;
        },
      
      //--- initilatisations de la BDD(appel des fonctions ci-dessus)
      openDbObject : function(){
        var deferred = $q.defer();

        $ionicPlatform.ready(function () {
          
          if(window.cordova){
            useSqlLite()
          } else {
            useWebSql()
          }

          initDatabase()
          .then(function(result){
             //console.log("DB init done!")
             deferred.resolve("ok");
          });

        })

        return deferred.promise; // Doit être la derniere instruction
      },


    //-----------------------------------------
    //--- Méthodes de gestion de posts offline
    //-----------------------------------------
    syncOfflineCategories : function(){
        filter = getUserPrefs.getFilter();
        var query1 = urlBase+ WpConfig.WpUrlCat + "?per_page=100"+"&exclude=1";
        $http.get(query1).then(
            function success(response){
                var data = response.data
            //execSQL(query1).then(function(data){
                //console.log(JSON.stringify(data));
                // data.forEach(function(element) {
                var prom = [];
                for(var i = 0; i< data.length; i++){
                    var catID = data[i].id; //POSTID 
                    var name = data[i].name; //TITRE
                    var parent = data[i].parent; //PARENT

                    var sqlInsert = 'INSERT OR REPLACE INTO CATEGORIES (id, name, parent) VALUES (?, ?, ?)';
                    var sqlParams = [catID, name, parent];
                    prom.push(execSQL(sqlInsert,sqlParams));
                    //console.log('ID : '+catID+' Parent : '+parent);
                }

               $q.all(prom).then(function () {
                  console.info('Offline categories Sync : ok');
                  // execSQL('select count(*) as count from CATEGORIES').then(function(datas){
                  //   console.log(JSON.stringify(datas.rows.item(0)));  
                  // })
                });
            }
        )
    },

    syncOfflineMenu : function(){
        var deferred = $q.defer();
        $ionicPlatform.ready(function(){
            //console.log ('***** getWPMenus *****')
            var url = WpConfig.WpUrl;
            var menuId = WpConfig.WpMenuId;
            var urlQuery = WpConfig.WpUrl+'wp-json/wp-api-menus/v2/menus/'+menuId;
            var prom = [];
            //console.log ('getWPMenus : '+urlQuery)
            $http.get(urlQuery).then(
                function success(response){
                    var data = response.data

                    sessionService.set("menuStruct", data.items);
                    deferred.resolve(response); 
                 }

             )

            console.info('Offline Menu Sync : ok');
        })

        return deferred.promise;
    },

    // syncOfflinePostCat : function(){
    //     console.log("syncOfflinePostCat");

    // },
    // syncOfflinePages : function(){
    //     console.log("syncOfflinePages " );
    //     var urlQuery = urlBase+ WpConfig.WpUrlPages+'?per_page=100';
        
    //     $http.get(urlQuery).success(function(data){
    //         wpPosts = [];

    //         var query = 'INSERT OR REPLACE INTO POSTS (id, title, content, favorite, post_type) VALUES (?, ?, ?, ?, ?)';
            
    //         for(var i = 0; i<data.length; i++){
    //             var postID = data[i].id;                        //POSTID 
    //             var postTitle = data[i].title.rendered;         //TITRE
    //             var postContent = data[i].content.rendered;     //CONTENT
    //             var favorite = 0;                               //FAVORITE
    //             var post_type = 'page';                      //POST_TYPE
    //             console.log("page id : "+postID);

    //             var dataArgs = [];
    //             dataArgs.push(postID);
    //             dataArgs.push(postTitle);
    //             dataArgs.push(postContent);
    //             dataArgs.push(favorite);
    //             dataArgs.push(post_type);


    //         }
    //     });
    //     return 1;
    // },


    syncOfflinePosts : function(postType){
          //var deferred = $q.defer();
          console.log("syncOfflinePosts " +postType);
          //var url = urlBase+ WpConfig.WpUrlPosts;

          filter = getUserPrefs.getFilter();
          
          if(!postType){
            postType="post";
          }

          if(postType=="post"){
            //postType="post";
            var urlQuery = urlBase+ WpConfig.WpUrlPosts+'?per_page=100'+filter;
          }if(postType=="page"){
            postType="page";
            var urlQuery = urlBase+ WpConfig.WpUrlPages+'?per_page=100';
          }else{
            postType="post";
            var urlQuery = urlBase+ WpConfig.WpUrlPosts+'?per_page=100'+filter;
          }

          // var urlQuery = urlBase+ WpConfig.WpUrlPosts+'?per_page=100'+filter;  
          
          //console.log('syncOfflinePosts Query : '+urlQuery)
          $http.get(urlQuery).success(function(data){
            //console.log("get posts to sync : " + data.length);
            wpPosts = [];
            var i = 0;

            var deferred = $q.defer();
            var promise = deferred.promise;
            var prom = [];

            var dataArgs = [];
            var rowArgs = [];
            var query0 = 'DELETE FROM POST_CAT';
            prom.push(execSQL(query0));
            // var query1 = 'DELETE FROM POSTS';
            // prom.push(execSQL(query1));

            // MyApHpDataService.publicExecSQL('SELECT DISTINCT POST_ID FROM POST_CAT').then(function(datas){
            //     console.log('postCat : '+datas.rows.length)
            // })

            // var query01 = 'DELETE FROM POSTS ';
            // prom.push(execSQL(query01))



            var query = 'INSERT OR REPLACE INTO POSTS (id, title, content, favorite, post_type) VALUES (?, ?, ?, (SELECT favorite FROM POSTS WHERE id = ?), ?)';
            //var query = 'INSERT OR REPLACE INTO POSTS (id, title, content, favorite, post_type) VALUES (?, ?, ?, ?, ?)';

            for(var i = 0; i<data.length; i++){
                var postID = data[i].id;                        //POSTID 
                var postTitle = data[i].title.rendered;         //TITRE
                var postContent = data[i].content.rendered;     //CONTENT
                var favorite = postID;                               //FAVORITE
                var post_type = postType;                      //POST_TYPE
                //console.log("post id : "+postID);

                //var queryFav = 'SELECT favorite FROM POSTS WHERE id = ?';

                var dataArgs = [];
                dataArgs.push(postID);
                dataArgs.push(postTitle);
                dataArgs.push(postContent);
                dataArgs.push(favorite);
                dataArgs.push(post_type);

                // prom.push($cordovaSQLite.execute(db, query, dataArgs))
                
                prom.push(execSQL(query,dataArgs));
                //console.log('POST TYPE  :' +postType);
                if(postType=="post"){
                    var postCategories = data[i].categories;//categories
                    for(var j = 0; j < postCategories.length; j++){
                        var query2 = 'INSERT OR REPLACE INTO POST_CAT (cat_id, post_id) VALUES (?, ?)';
                        // var query2 = 'INSERT INTO POST_CAT (cat_id, post_id) VALUES ('+postCategories[j]+', '+postID+') WHERE (cat_id = '+postCategories[j]+' and post_id = '+ postID +')';
                        //console.log(query2);

                        var queryArgs = [];
                        queryArgs.push(postCategories[j])       
                        queryArgs.push(postID)
                        // queryArgs.push(postCategories[j])       
                        // queryArgs.push(postID)
                        // prom.push($cordovaSQLite.execute(db, query2, queryArgs));   

                        prom.push(execSQL(query2,queryArgs));
                    }
                }
               
            };

            // queryControlCat = 'select * from POST_CAT';
            // prom.push(execSQL(queryControlCat));  

            $q.all(prom).then(function() {
              // $cordovaSQLite.execute(db, 'select * from POST_CAT').then(function(res){
              //       var items = [];

              //       for(var i=0; i<res.rows.length; i++) {       
              //           // items.push({id : res.rows.item(0).id, title : res.rows.item(0).title, content : res.rows.item(0).content});
              //           console.log('cat_id : '+ res.rows.item(i).cat_id);
              //       }
              //   });
              // deferred.resolve('response'); 
              console.info("Offline posts sync ("+post_type+"): ok");
              return
            });
          });

          //return deferred.promise;
    },

      //--- méthode d'ajout d'un POST offline
      // addOfflinePost : function(postId, post_type){
      //   $ionicPlatform.ready(function () {
          
      //     console.log("addOfflinePost : " + postId);


      //     var url = urlBase+ WpConfig.WpUrlPosts+'/'+postId;
      //     postData = [];
      //     $http.get(url).then(
      //        function success(response){
      //           var data = response.data;
      //           // console.log("data : "+JSON.stringify(data));
      //           postData.push({id: data.id,title: data.title.rendered,content: data.content.rendered})
      //           postIdData = data.id
      //           postTitle = data.title.rendered;
      //           postContent = data.content.rendered;
      //           return($cordovaSQLite.execute(db, 'INSERT OR REPLACE INTO POSTS (id, title, content, favorite) VALUES (? , ?, ?, ?)',[postIdData, postTitle, postContent, 0]));
      //        }
      //     )
      //   });
      // },

      //--- méthode d'ajout d'une PAGE offline
      //  addOfflinePage : function(pageId){
      //   $ionicPlatform.ready(function () {
          
      //     console.log("addOfflinePost : " + pageId);

      //     var urlBase = WpConfig.WpBaseUrl;
      //     var url = urlBase+ 'pages/'+pageId;
      //     postData = [];
      //     $http.get(url).then(
      //        function success(response){
      //           var data = response.data;
      //           // console.log("data : "+JSON.stringify(data));
      //           postData.push({id: data.id,title: data.title.rendered,content: data.content.rendered})
      //           postIdData = data.id
      //           postTitle = data.title.rendered;
      //           postContent = data.content.rendered;
      //           return($cordovaSQLite.execute(db, 'INSERT OR REPLACE INTO POSTS (id, title, content, favorite, post_type) VALUES (? , ?, ?, ?, ?)',[postIdData, postTitle, postContent, 0, "page"]));
      //        }
      //     )
      //   });
      // },

      //--- méthode de lecture d'un POST offline
      // getOfflinePost : function(id, callback){
      //   $ionicPlatform.ready(function () {
      //     $cordovaSQLite.execute(db, 'SELECT * FROM POSTS where id = ? and post_type="post"', [id])
      //     .then(function(res){
      //       var items = [];

      //       if(res.rows.length > 0) {       
      //           items.push({id : res.rows.item(0).id, title : res.rows.item(0).title, content : res.rows.item(0).content});
      //       }
      //       callback(items);
      //     }, onErrorQuery);
      //   })
      // },
      
      //--- méthode de lecture d'une PAGE offline
      // getOfflinePage : function(id, callback){
      //   $ionicPlatform.ready(function () {
      //     $cordovaSQLite.execute(db, 'SELECT * FROM POSTS where id = ? and post_type="page"', [id])
      //     .then(function(res){
      //       var items = [];

      //       if(res.rows.length > 0) {       
      //           items.push({id : res.rows.item(0).id, title : res.rows.item(0).title, content : res.rows.item(0).content});
      //       }
      //       callback(items);
      //     }, onErrorQuery);
      //   })
      // },

      //------------------------------------
      //--- Méthodes de gestion des favoris
      //------------------------------------

      //--- méthode d'ajout en favori
      addFavorite: function(favorite){
        //console.log("addFavorites : " + favorite[0].content);
        //return($cordovaSQLite.execute(db, 'INSERT OR REPLACE INTO POSTS (id, title, content, favorite post_type) VALUES (? , ?, ?, ?, ?)',[favorite[0].id, favorite[0].title, favorite[0].content, 1, "post"]));
        var query = 'INSERT OR REPLACE INTO POSTS (id, title, content, favorite, post_type) VALUES (? , ?, ?, ?, ?)';
        var args = [favorite[0].id, favorite[0].title, favorite[0].content, 1, "post"]
        return execSQL(query, args)
      },

      //--- méthode de suppression de favori
      removeFavorite: function(id){
        console.log("removeFavorite : " + id);
        return $cordovaSQLite.execute(db, 'DELETE FROM POSTS where id = ? and favorite = ? and post_type = "post"', [id, 1])
      },

      //--- méthode de vidage de la table posts
      emptyPosts: function(){
        console.error("Empty Post table ");
        return $cordovaSQLite.execute(db, 'DELETE FROM POSTS where post_type = "post"');
      },

      //--- méthode de récupération de tous les favoris
      getAllFavoriteQuery : function(callback){
        $ionicPlatform.ready(function () {
          $cordovaSQLite.execute(db,"select * from posts where favorite = 1")
          // $cordovaSQLite.execute(db,"select * from posts")
          .then(function(res){
            var items = [];

            if(res.rows.length > 0) {
                  for(var i = 0; i < res.rows.length; i++) {
                      // console.log("select query : "+res.rows.item(i).content);          
                      items.push({id : res.rows.item(i).id, title : res.rows.item(i).title, content : res.rows.item(i).content})
                  }
              }
              callback(items);
          }, onErrorQuery);
        })
      },
      
      //--- méthode de verification d'un favori
      checkFavQuery : function(id, callback){
        $ionicPlatform.ready(function () {
            $cordovaSQLite.execute(db, 'SELECT COUNT(*) as infav FROM POSTS where id = ? and favorite = ?', [id, 1])
            .then(function(res){
                console.log("check fav : "+res.rows.item(0).infav);
                callback(res.rows.item(0).infav);
            }, onErrorQuery);
        })
      },

      //--- méthode de récupération d'un favori
      getFavoriteQuery : function(id, callback){
        $ionicPlatform.ready(function () {
            console.log('getFavoriteQuery : '+ id)
          $cordovaSQLite.execute(db, 'SELECT * FROM POSTS where id = ? and favorite = ?', [id, 1])
          .then(function(res){
            var items = [];

            if(res.rows.length > 0) {       
                items.push({id : res.rows.item(0).id, title : res.rows.item(0).title, content : res.rows.item(0).content});
            }
            callback(items);
          }, onErrorQuery);
        })
      }

    }
  })



//----------------------------------------------------------------------------------------------------
//--- Pull to reload service
//----------------------------------------------------------------------------------------------------
.factory('LoaderService', function($rootScope, $ionicLoading) {
  // Trigger the loading indicator
  return {
        show : function() { //code from the ionic framework doc
            // Show the loading overlay and text
            $rootScope.loading = $ionicLoading.show({
                // The text to display in the loading indicator
                content: 'Loading',
                // The animation to use
                animation: 'fade-in',
                // Will a dark overlay or backdrop cover the entire view
                showBackdrop: true,
                // The maximum width of the loading indicator
                // Text will be wrapped if longer than maxWidth
                maxWidth: 200,
                // The delay in showing the indicator
                showDelay: 500
            });
        },

        hide : function(){
            $rootScope.loading.hide();
        }
    }
})

//----------------------------------------------------------------------------------------------------
//--- Tabs to bottom everywhere
//----------------------------------------------------------------------------------------------------
.config(['$ionicConfigProvider', function($ionicConfigProvider) {
    $ionicConfigProvider.tabs.position('bottom'); // other values: top
}])

//----------------------------------------------------------------------------------------------------
//--- Définition des routes
//----------------------------------------------------------------------------------------------------
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'views/tabs.html'
  })

  .state('app.search', {
    url: '/search',
    views: {
      'tab-search': {
        templateUrl: 'views/search.html',
        controller: 'searchCtrl'
      }
    }
  })

  .state('app.account', {
      url: '/account',
      views: {
        'tab-account': {
          templateUrl: 'views/account.html',
          controller: 'accountCtrl'
        }
      }
    })

  .state('app.help', {
      url: '/help',
      views: {
        'tab-help': {
          templateUrl: 'views/help.html',
          controller: 'helpCtrl'
        }
      }
    })

  .state('app.favorites', {
    url: '/favorites',
    views: {
      'tab-favorites': {
        templateUrl: 'views/favorites.html',
         controller: 'favoritesCtrl'
      }
    }
  })

  .state('app.favorite', {
    url: '/favorite/:favoriteId',
    views: {
      'tab-favorites': {
        templateUrl: 'views/favorite.html',
         controller: 'favoriteCtrl'
      }
    }
  })

  .state('app.post', {
    url: '/post/:postId',
    views: {
      'tab-home': {
        templateUrl: 'views/post.html',
        controller: 'PostCtrl'
      }
    }
  })

  .state('app.cat', {
    url: '/cat/:catID',
    views: {
      'tab-home': {
        templateUrl: 'views/category.html',
        controller: 'CatCtrl'
      }
    }
  })

  .state('app.ext', {
    url: '/ext/:extURL',
    views: {
      'tab-home': {
        templateUrl: 'views/external.html',
        controller: 'ExtCtrl'
      }
    }
  })

    .state('app.home', {
    url: '/home',
    views: {
      'tab-home': {
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
});
