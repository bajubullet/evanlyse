  /*!
 * DASHBOARD UX
 * Version 1
 * Requires jQuery v1.11 or later  & Bootstrap 3
 * 
 * Author: Arun V.Sarma
 */
/*
 * TODO LIST:
 * - Toolbar Buttons - info button handler!!
 */

(function($) {

    $.dashboard = function(element, options) {

        var defaults = {
            configSrc                      : '',
            utilsObj                       : '',
            templateObj                    : '',
            metricsArr                     : []
        }

        var SETUP_UI_COMPLETE = 'SETUP_UI_COMPLETE'
        
        var plugin = this;
        var version = '1.0';
        
        var strConfigPath = '';
        var objTemplate = new Object();
        var objUtils, objWidgets;
        var arrMetrics = [];
        var arrInfo = [];
        
        plugin.settings = {}

        var $dashboard = $(element),
             dashboard = element;

        plugin.init = function() {
            logMessages('Plugin loaded')
            plugin.settings = $.extend({}, defaults, options);
            setOptions();
        }
        
        plugin.getPluginVersion = function(){
            return version;
        }

        var setOptions = function(){
            strConfigPath = plugin.settings.configSrc;
            objTemplate = plugin.settings.templateObj;
            objUtils = plugin.settings.utilsObj;
            arrMetrics = plugin.settings.metricsArr;
            loadDashboardConfig();
            
        }
        
        var loadDashboardConfig = function(){
            objUtils.loadJSON(strConfigPath).done(function(_conf){
                objWidgets  = _conf.app.panels;
                $.each(objWidgets, function(_index) {
                    configureWidgetPanel(_index);
                    if(_index == (objWidgets.length - 1)){
                        $.event.trigger({ type: SETUP_UI_COMPLETE });
                        bindEvents();
                    }
                });
            })
            .fail(function(jqxhr, textStatus, error){
                logMessages('ERROR: Config file could not be loaded')
            })
        }
        
        var configureWidgetPanel = function(_index){
            objTemplate.find('div[data-role=panel-container]').attr('class',objWidgets[_index]['bootstrapClass']);
            objTemplate.find('div[data-role=panel-container]').attr('data-set',objWidgets[_index]['dataSet']);
            
            
            if(arrMetrics[_index] !== objWidgets[_index].widget['widgetName']){
                objUtils.toggleUIMessages(true, 'Not Configured', objTemplate.find('div[data-role=panel-container]'), 80, 50);
                objTemplate.find('div[data-role=panel-container]').css('opacity', 0.6);
                objTemplate.find('div[data-role=panel-container]').attr('data-set', 'NA');
            }else{
                objTemplate.find('div[data-role=panel-container]').css('opacity', 1);
                objUtils.toggleUIMessages(false, '', objTemplate.find('div[data-role=panel-container]'), 0, 0);
                objTemplate.find('div[data-role=panel-container]').attr('data-set', objWidgets[_index].widget['widgetName']);
            }
            
            configureWidgets(objWidgets[_index].widget);
            $dashboard.append(objTemplate.html());
            
        }
        
        var configureWidgets = function(_obj){
            if((_obj['widgetTitle'] == '') && (_obj['widgetIcon'] == '') && (_obj.widgetTools.length == 0)){
                objTemplate.find('div[data-role=widget-heading]').hide();
            }else{
                objTemplate.find('span[data-role=widget-heading-title]').html(_obj['widgetTitle']);
                objTemplate.find('em[data-role=widget-heading-subtitle]').html(_obj['widgetSubtitle']);
                objTemplate.find('span[data-role=widget-heading-icon]').attr('class', _obj['widgetIcon']);
                objTemplate.find('div[data-role=widget-heading]').show();
            }
            objTemplate.find('div[data-role=widget-container]').attr('id',_obj['widgetId']);
            objTemplate.find('div[data-role=popover-template]').html(_obj['widgetInfo']);
            objTemplate.find('div[data-role=widget-container]').attr('class',_obj['widgetClass']);
            
            if(_obj.widgetTools.length > 0) configureWidgetTools(_obj.widgetTools)
            if(_obj.subWidgets.length > 0) configureSubwidgets(_obj.subWidgets);
            
        }
        
        var configureSubwidgets = function(_obj){
            objTemplate.find('div[data-role=widget-content]').empty();
            $.each(_obj, function(_index, _elem){
                objTemplate.find('div[data-role=widget-content]').append('<div id="'+ _elem['id'] +'" class="'+ _elem['class'] + '" style="height:'+ _elem['height']+'" data-set="'+ _elem['dataSet'] +'"></div');
                if(_elem['footer']){
                    objTemplate.find('div[data-role=widget-footer]').css('visibility', 'visible');
                } else {
                    objTemplate.find('div[data-role=widget-footer]').css('visibility', 'hidden');
                } 
            })
        }
        
        var configureWidgetTools = function(_obj){
            objTemplate.find('div[data-role=widget-heading-toolbar]').empty();
            $.each(_obj, function(_index, _elem){
                objTemplate.find('div[data-role=widget-heading-toolbar]').append('<button type="button" id='+ _elem['id'] +' class="'+ _elem['class'] +'" data-action="'+ _elem['action']+'"></button>');
            })
        }
        
        var bindEvents = function(){
            $dashboard.find('.widget .widget-header .collapse-btn').on('click', function(event){
                if($(this).hasClass('collapsed')){
                    $(this).removeClass('collapsed')
                } else {
                    $(this).addClass('collapsed')
                } 
                $(event.currentTarget).parent().parent().parent().find('.panel-collapse').collapse('toggle');
            })
            
            var popOverSettings = {
                placement: 'left',
                html: true,
                content: function () {
                    return $(this).parent().parent().parent().find('div[data-role=popover-template]').html();
                }
            }
            
            $dashboard.find('.widget .widget-header .info-btn').popover(popOverSettings);
            
            $('body').on('click', function (e) {
                $('[data-action="popover"]').each(function () {
                    if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                        $(this).popover('hide');
                    }
                });
                $('[data-toggle="popOptions"]').each(function () {
                    if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.tooltip').has(e.target).length === 0) {
                        $(this).tooltip('hide');
                    }
                });
            });
            
        }
        
        var logMessages = function(_strMsg){
            console.log("** Dashboard > "+_strMsg);
        }

        plugin.init();

    }

    $.fn.dashboard = function(options) {
        return this.each(function() {
            if (undefined == $(this).data('dashboard')) {
                var plugin = new $.dashboard(this, options);
                $(this).data('dashboard', plugin);
            }
        });
    }

})(jQuery);