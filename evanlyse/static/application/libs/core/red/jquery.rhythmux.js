  /*!
 * RHYTHM UX
 * Version 3
 * Requires jQuery v1.11 or later  & Bootstrap 3
 * 
 * Author: Arun V.Sarma
 */
/*
 * TODO LIST:
 * - NA
 */

(function($) {

    $.rhythmux = function(element, options) {

        var defaults = {
            strConfigurationPath                : 'application/config/config.json',
            strDefaultSkin                      : 'light',
            objSkins                            : {'dark':'application/styles/skin_dark.css', 'light':'application/styles/skin_white.css'},
            strSkinKey                          : 'mode',
            strConfigKey                        : 'config',
            strViewsPath                        : 'application/appviews/',
            strControllersPath                  : 'application/appcontrollers/',
            strPageTitle                        : 'Untitled',
            objAppServerURL                     : {'DEV':'http://dev.cst.akamai.com', 'PROD':'http://localhost/prod'},
            boolAuthEnabled                     : true,
            boolShowBackButton                  : true
        }

        var plugin = this;
        plugin.settings = {}

        var $rhythmux = $(element),
             rhythmux = element;
        
        var strFrameworkVersion = '3.04.03.2014'

        //VARIABLES
        var strConfigFile = '';
        var strDefaultSkin = '';
        var strSkinKey = '';
        var strConfigKey = '';
        var strViewsPath = '';
        var strControllersPath = '';
        var strPageController = '';
        var strPage = '';
        var strViewDataset = '';
        var strApplicationName = '';
        var strApplicationVersion = '';
        var strApplicationAuthor = '';
        var strCurrentPageTitle = '';
        var strCurrentPageSubTitle = '';
        var strServerURL = '';
        var strAppEnvironment = '';
        
        var objSkins = new Object();
        var objPages = new Object();
        var objPage = new Object();
        var objLibraries = new Object();
        var objEnvironment = new Object();
        var objPageContent = new Object();

        var boolScriptLoaded = false
        var boolLibrariesLoaded = false;
        var boolShowBackButton = true;
        var boolUserIsLoggedIn = false;
        var numOfComponents = 0;
        var compCount = 1;
        
        
        // -- PUBLIC FUNCTIONS -- //
        plugin.init = function() {
            logMessage("Plugin loaded");
            plugin.settings = $.extend({}, defaults, options);
            showApplicationLoader(true);
            setOptions();
        }
        
        plugin.getCurrentPage = function(){
            strPage = getHashURL();
            logMessage('fn > getCurrentPage '+strPage)
            return strPage;
        }
        
        plugin.getFrameworkVersion = function() {
            return strFrameworkVersion;
        }
        
        plugin.getNavigationConfig = function() {
            var _objNavigation = {};
            var _navigationWrapper = $rhythmux.find('#navigation-wrapper').parent().attr('id')
            var _navigationType = _navigationWrapper.split('-')[0];

            if(arrNavigationlist){
                arrNavigationlist.length=0;
            }
            var arrNavigationlist = [];

            $.each(objPages, function(i, _node) {
                if(_node['showInNavigation'] == true){
                    arrNavigationlist.push(_node['pageName'])
                }    
            })

            _objNavigation['navigationType'] = _navigationType;
            _objNavigation['navigationList'] = arrNavigationlist
            
            return _objNavigation;
        }
        
        plugin.setLocalStorage = function(_id, _value){
            if (typeof (window.localStorage) != "undefined") {
                 localStorage.setItem(_id, _value);
            }else{
                console.log('local storage..blah')
            }
            
        }

        plugin.deleteLocalStorageItem = function(_id){
            if (typeof (window.localStorage) != "undefined") {
                localStorage.removeItem(_id);
            }else{
                console.log('local storage..blah')
            }
            
        }

        plugin.getLocalStorage = function(_id){
            if (typeof (window.localStorage) != "undefined") {
                strViewDataset = localStorage.getItem(_id);
            }
            return strViewDataset;
        }
        
        plugin.clearLocalStorage = function(){
            localStorage.clear();
        }
        
        plugin.log = function(_strlog){
            logMessage(_strlog);
        }
        
        plugin.getQuerystringParam = function(_strkey){
            return getParameterByName(_strkey);
        }
        
        plugin.toggleViewLoader = function(_bool, _msg, _target){
            toggleViewLoader(_bool, _msg, _target);
        }
        
        plugin.toggleUIMessages = function(_bool, _msg, _target, _width, _height){
            toggleUIMessages(_bool, _msg, _target, _width, _height);
        }

        plugin.toggleStatusMessages = function(_flag, _target, _message, _type){
            toggleStatusMessages(_flag, _target, _message, _type);
        }
        
        plugin.loadJSON = function(_src){
            return $.getJSON(_src);
        }
        
        plugin.makeAJAXRequest = function(_uri, _method, _data, _contenttype, _datatype, _context, _processdata, _successHandler, _errorHandler){
            var _jqXHR = $.ajax({
                url: _uri,
                type: _method,
                data: _data,
                contentType: _contenttype,
                dataType: _datatype,
                context: _context,
                processData: _processdata
            });
            _jqXHR.done( _successHandler );
            _jqXHR.fail( _errorHandler );
        }
        
        /*plugin.makeAJAXRequest = function(_method, _action, _data, _contentType, _dataType, _processData, _context){
           var _jqxhr = $.ajax({ 
               type: _method,
               url: _action,
               data: _data,
               contentType: _contentType,
               dataType: _dataType,
               context: _context,
               processData: _processData
           });
           _jqxhr.fail(function(_jqxhr) {
           		if(_jqxhr.status == 401) {
           			window.location.href = '#!HOME';
           		}
           });
           return _jqxhr;
        }*/
       
        plugin.cleanupPage = function(){
            cleanPage();
        }
        plugin.getApplicationName = function(){
            return strApplicationName;
        }
        plugin.getApplicationVersion = function(){
            return strApplicationVersion;
        }
        plugin.getApplicationAuthor = function(){
            return strApplicationAuthor;
        }
        plugin.getCurrentPageTitle = function(){
            return strCurrentPageTitle;
        }
        
        plugin.getCurrentPageSubTitle = function(){
            return strCurrentPageSubTitle;
        }
        plugin.getUserIsLoggedIn = function(){
            boolUserIsLoggedIn = plugin.getLocalStorage("isLoggedIn")
            return boolUserIsLoggedIn;
        }
        
        plugin.setUserIsLoggedIn = function(_bool){
            plugin.setLocalStorage("isLoggedIn",_bool);
        }
        
        plugin.getApplicationEnvironment = function(){
            return strAppEnvironment;
        }
        
        plugin.setApplicationEnvironment = function(_strenvir){
            setAppEnvironment(objEnvironment[_strenvir]);
        }
        plugin.setContent = function(_strpage){
            if(strPage == _strpage){
                setupPage(_strpage);
            }else{
                window.location = '#!'+_strpage.toUpperCase();
            } 
        }
        
        plugin.getJSONObj = function(_objNode, _strElement){
            var _obj = getNode(_objNode, _strElement);
            return _obj;
        }
        // -- END PUBLIC FUNCTIONS -- //

        // -- FUNCTIONS -- //
        var setOptions = function(){
            logMessage('fn > setConfiguration')
            strConfigFile = plugin.settings.strConfigurationPath;
            strDefaultSkin = plugin.settings.strDefaultSkin;
            objSkins = plugin.settings.objSkins;
            strSkinKey = plugin.settings.strSkinKey;
            strConfigKey = plugin.settings.strConfigKey;
            strViewsPath = plugin.settings.strViewsPath;
            strControllersPath = plugin.settings.strControllersPath;
            objEnvironment = plugin.settings.objAppServerURL;
            boolShowBackButton = plugin.settings.boolShowBackButton;

            var _strPageTitle = plugin.settings.strPageTitle;
            $('head').find('title').html(_strPageTitle);
            getAppEnvironment();
            setSkin();
        }

        var setSkin = function(){
            logMessage(' fn > setSkin')
            var _strMode = '';
            var _strSkin = '';

            if(strSkinKey){
                _strMode = getParameterByName(strSkinKey);
                if(_strMode){
                    $.each(objSkins, function(key, value){
                        if(_strMode == key) _strSkin = value;
                    });     
                }else{
                    if(strDefaultSkin) _strSkin = objSkins[strDefaultSkin];
                }
            } else {
                if(strDefaultSkin) _strSkin = objSkins[strDefaultSkin];
                
            }

            if(_strSkin){
                $('head').append('<link href="' + _strSkin + '" rel="stylesheet">');
                logMessage('fn > setSkin - skin: '+ _strSkin)
            }else{
                logMessage('Mode and Default Skin has not been specified or is unavailable')
            }
            
            setConfiguration();
        }

        var setConfiguration = function(){
            logMessage('fn > setConfiguration')
            var _strConfigValue = '';
            var _strConfig = '';

            if(strConfigKey){
                _strConfigValue = getParameterByName(strConfigKey);
                if(_strConfigValue){
                    _strConfig = _strConfigValue;
                }else{
                    _strConfig = strConfigFile;
                }
            }else{
                _strConfig = strConfigFile;
            }

            plugin.loadJSON(_strConfig).done(function( _json ) {
                var _objConfigData = _json.application
                logMessage('fn > setConfiguration - config: '+_strConfig)
                checkConfiguration(_objConfigData);

            })
            .fail(function(jqxhr, textStatus, error) {
                logMessage('Error loading config: '+ textStatus + ", " + error);
                showFailover();
            });


        }
        
        var checkConfiguration = function(_objData){
            strApplicationName = _objData['name'];
            strApplicationVersion = _objData['version'];
            strApplicationAuthor = _objData['author'];
            if(strApplicationName){
                objPages = getNode(_objData, 'pages');
                objLibraries = getNode(_objData, 'libraries');
                loadLibraries();
            }else{
                logMessage('The Application name has not been defined in config JSON file' );
            }
        }
        
        var loadLibraries = function(){
            logMessage(' fn > loadLibraries')
            $.each(objLibraries, function(i, _node) {
                try {
                    switch(_node['type']){
                        case 'javascript':
                            $('body').append('<script type="text/javascript" src="'+ _node['libpath'] +'"></script>');
                             logMessage(' fn > loadLibraries > '+_node['libpath'])
                        break;
                        case 'css':
                            $('head').append('<link rel="stylesheet" type="text/css" href="'+ _node['libpath'] +'"/>');
                            logMessage(' fn > loadLibraries > '+_node['libpath'])
                        break;
                    }
                } catch(err) {
                    logMessage(' fn > loadLibraries - Exception: '+err)
                }
            });
            boolLibrariesLoaded = true;
            setupPage();
        }
        
        var setupPage = function(_strpage){
            if(typeof _strpage === 'undefined'){
                _strpage = '';
                strPage = getHashURL();
            }else{
                strPage = strPage
            }
            cleanPage();
            var _intCount = 1;
            logMessage(' > fn > setupPage - Page: '+ strPage)
            if(strPage){
                $.each(objPages, function(i, _node) {
                    var _strPageName = _node['pageName'];
                    if(_strPageName == strPage){
                        objPage = _node;
                        strCurrentPageTitle = _node['pageTitle'];
                        strCurrentPageSubTitle = _node['pageSubTitle'];
                        strPageController = _node['pageController'];
                        createWrappers($rhythmux, objPage, 'componentList');
                    }else{
                        if(_intCount == objPages.length){
                            showFailover();
                        }
                        _intCount++
                    }
                });
                
            }else{
                if(strPage == false){
                    logMessage(' > fn > setupPage - Page: '+ strPage);
                    showFailover();
                }   
            }
        }
        
        var createWrappers = function(_target, _objPage, _strElement){
            logMessage('fn > addWrappers');
            var _objComponents = getNode(_objPage, _strElement);
            if(_objComponents.length != 0){
                numOfComponents = _objComponents.length;
                $.each(_objComponents, function(i, _elem) {
                    var _strWrapper = _elem.view;
                    var _strWrapperId = _strWrapper + "-wrapper";
                    var _strWrapperClass = _elem.wrapper;
                    var _strWrapperCol = _elem.column;
                    if(!_strWrapperClass) _strWrapperClass = "container";
                    
                    switch(_strWrapperCol){
                        case "sidebar":
                            _target.append('<div id="sidebar-wrapper" class="col-xs-12 col-sm-3 col-md-3 col-lg-3"></div>');
                            $("#"+_strWrapperCol+"-wrapper").append('<div class="' + _strWrapperClass + '" id="'+_strWrapperId+'"></div>');
                        break;
                        case "content":
                            _target.append('<div id="content-wrapper" class="col-xs-12 col-sm-9 col-md-9 col-lg-9"></div>');
                            $("#"+_strWrapperCol+"-wrapper").append('<div class="' + _strWrapperClass + '" id="'+_strWrapperId+'"></div>');
                        break;
                        case "page":
                            $("#"+_strWrapperCol+"-wrapper").append('<div class="' + _strWrapperClass + '" id="'+_strWrapperId+'"></div>');
                        break;
                    }
                    addComponents(_strWrapperId);

                });
            }else{
                showFailover();
            }
        }

        var addComponents = function(_strWrapper){
            logMessage(' fn > addComponents')
            var _target = $('#'+_strWrapper)
            var _strView = _strWrapper.split('-')[0]
            var _strComp = strViewsPath + _strView + '.html';  
            objPageContent[_strWrapper] =  _strComp;    
            loadPage(_target, _strComp)

        }

        var addPageController = function(){
            if(strPageController !== ''){
                var _strControllerSrc = strControllersPath + strPageController;
                logMessage(' fn > addControllers > ' + _strControllerSrc)
                try{
                    if(!boolScriptLoaded){
                        $rhythmux.append('<script type="text/javascript" src="'+_strControllerSrc+'.js"></script>');                    
                        showApplicationLoader(false);
                    }
                } catch(ex){
                    logMessage('fn > addControllers - Exception: '+ ex);
                }               
            }

            $.event.trigger({ type: "HASH_CHANGE" });            
            appendScrollButton();
            
        }
        
        var appendScrollButton = function(){
            var _scrollButton = '<div class="scroll-button small-heading pull-right init-hide" data-role="scrollButton" style="cursor:pointer"><span class="glyphicon glyphicon-hand-up"></div>'
            var _offset = 120;
            if(boolShowBackButton){
                $rhythmux.append(_scrollButton);
                bindUIEvents();
                $(window).scroll(function() {
                    if ($(this).scrollTop() > _offset) {
                        $rhythmux.find('div[data-role=scrollButton]').fadeIn(500);
                    } else {
                        $rhythmux.find('div[data-role=scrollButton]').fadeOut(500);
                    }
                });
            }
        }
        
        var bindUIEvents = function(){
            var scrollBtn = $rhythmux.find('div[data-role=scrollButton]')
            scrollBtn.on('click', function(){
               event.preventDefault();
               $(getScrollContainer()).animate({scrollTop: 0}, 200);
               return false; 
            });
        }
        
        
        // -- Helper Functions --//
        var setContent = function(_target, _strPage){
          
          if(_strPage == strPage){
            var _targetDiv = $('#'+_target);
            var _content = JSON.stringify(objPageContent[_target]).replace(/"/g, '');
            _targetDiv.find('div').detach();            
            _targetDiv.load(_content, function(){
                logMessage('page loaded')
            })
          }else{
            window.location.href = '#!'+ _strPage.toUpperCase();
          }
        }
          
        var getAppEnvironment = function(){
            var _userenv = ''
            var _env = getParameterByName('env');
            if(_env.toLowerCase()){
                _userenv = objEnvironment[_env];
                setAppEnvironment(_userenv);
            }else{
                _userenv = objEnvironment[Object.keys(objEnvironment)[0]]
                setAppEnvironment(_userenv)
            }
            
        }
        
        var setAppEnvironment = function(_strEnvir){ 
            strAppEnvironment = _strEnvir;
            logMessage(' fn > setAppEnvironment > '+ strAppEnvironment);
            
        }
        
        var cleanPage = function(){
            logMessage("fn > cleanPage  - Cleaning page.. ")
            $rhythmux.find("div").remove(); 
            $rhythmux.find('script').remove();
            boolLibrariesLoaded = false;
            boolScriptLoaded = false;
        }
        
        $(window).on('hashchange', function(){
            strPage = getHashURL();
            setupPage();
            
            
        });
        
       var getScrollContainer = function() {
            var _body = $('body');
            var _p = _body.scrollTop;
            _body.scrollTop++;
            if (_body.scrollTop === _p) {
                return document.documentElement;
            } else {
                _body.scrollTop--;
                return _body;
            }
        }
        
        var getHashURL = function(){
            var a=window.location.href.match(/#(.)(.*)$/);
            if(!a){
                var _home = '#!'+objPages[0].pageName
                window.location.href = window.location.href+_home;
                logMessage('fn > getHashURL - No HashURL..loading homepage');
                getHashURL();
            }else{
                logMessage('fn > getHashURL - Found HashURL')
                
            }
            return a&&a[1]=="!"&&a[2].replace(/^\//,"");
        }    

        var getNode = function(_objNode, _strElement){
            var _objResNode = _objNode[_strElement] 
            return _objResNode;
        }

        var showApplicationLoader = function(_boolflag){
            if(_boolflag){
                $rhythmux.prepend('<div id="loader" class="page-block"><div class="loader-ui"><img src="application/images/ajax-loader2.gif" />&nbsp;Loading</div></div>');
            }else{
               $rhythmux.find('#loader').remove();
            }
        }
        
        var toggleViewLoader = function(_flag, _text, _target){
            if(_flag){
                $rhythmux.prepend('<div id="viewloader" class="page-block"><div class="views-loader"><img src="application/images/ajax-loader2.gif" />&nbsp;'+_text+'</div></div>');
            }else{
               $rhythmux.find('#viewloader').remove();
            }
        }

        var toggleUIMessages = function(_flag, _text, _target, _width, _height){
            if(_flag){
                $rhythmux.find(_target).prepend('<div class="message-ui" style="width:' + _width + '%;height:'+ _height +'px">'+ _text + '</div>');
                $rhythmux.find(_target).fadeTo("slow",0.45);
            }else{
                $rhythmux.find(_target).fadeTo("fast",1);
                $rhythmux.find(_target).find('.message-ui').remove();
            }
        }

        var toggleStatusMessages = function(_flag, _target, _message, _type){
            _message = (typeof _message === "undefined") ? '' : _message;
            _type = (typeof _type === "undefined") ? '' : _type;

            if(_flag){
                _target.show();
                _target.html(_message);
                if(_type == 'error'){
                    _target.removeClass('status-msg-success');
                    _target.addClass('status-msg-error');
                }else{
                    _target.removeClass('status-msg-error');
                    _target.addClass('status-msg-success');
                }
            }else{
                _target.hide();
                _target.html('');
            }

        }
        

        var showFailover = function(){
            cleanPage();
            var _strFailoverView = strViewsPath + 'failover.html'
            loadPage($rhythmux, _strFailoverView)
            showApplicationLoader(false);
        }
        
        var loadPage = function(_target, _strSrc){
            if(typeof(_strController)==='undefined') _strController = '';

            _target.load(_strSrc, function(response, status, xhr){
                switch(status){
                  case "success":
                    logMessage(' fn > loadPage - Comp > ' + _strSrc);
                    if(numOfComponents == compCount){
                        addPageController();     
                        compCount = 1;
                    }else{
                        compCount++
                    }        
                    break;
                  case "error":
                    logMessage(' fn > loadPage - Error ' + _strSrc);
                    window.location.href = '#!ERROR';
                    boolPageLoaded = false; 
                    break;
                }
                
            });
            
        }

        var logMessage = function(_strMsg){
            console.log("** RHYTHM UX > "+_strMsg);
        }

        var getParameterByName = function(name) {
            name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
            return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }

        plugin.init();

    }

    $.fn.rhythmux = function(options) {
        return this.each(function() {
            if (undefined == $(this).data('rhythmux')) {
                var plugin = new $.rhythmux(this, options);
                $(this).data('rhythmux', plugin);
            }
        });

    }

})(jQuery);