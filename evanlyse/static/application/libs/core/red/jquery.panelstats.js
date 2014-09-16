  /*!
 * PANEL STATS UX
 * Version 1
 * Requires jQuery v1.11 or later  & Bootstrap 3
 * 
 * Author: Arun V.Sarma
 */
/*
 * TODO LIST:
 * - 
 */

(function($) {

    $.panelstats = function(element, options) {

        var defaults = {
            graphData                      : '',
            utilsObj                       : $engine,
            showHelp                       : false,
            templateObj                    : $('#statstemplate')
        }
        
        var plugin = this;
        var version = '1.0';
        var boolShowHelp = 'true';
        var objTemplate, objGraphData, objEngine;
        
        plugin.settings = {}

        var $panelstats = $(element),
             panelstats = element;

        plugin.init = function() {
            logMessages('Plugin loaded')
            plugin.settings = $.extend({}, defaults, options);
            setOptions();
        }
        
        plugin.getPluginVersion = function(){
            return version;
        }
        
        var setOptions = function(){
            objGraphData = plugin.settings.graphData;
            objTemplate = plugin.settings.templateObj;
            objEngine = plugin.settings.utilsObj;
            boolShowHelp = plugin.settings.showHelp;
            configurePanels()
        }
        
        var configurePanels = function(){
            $.each(objGraphData, function(index, elem){
                $panelstats.find('div[data-role=widget-container]').empty()
                objTemplate.find('div[data-role=panel-container]').attr('class','panel panel-'+ elem['type'] +' panel-stat');
                $.each(elem.data, function(_index, _elem){
                    switch(_elem['type']){
                        case 'main':
                            objTemplate.find('span[data-role=icon-container]').attr('class', 'fa fa-arrow-'+_elem['icon']);
                            objTemplate.find('small[data-role=stats-heading]').html(_elem['label']);
                            objTemplate.find('h1[data-role=stats-value]').html(_elem['value']);
                        break;
                        case 'sub1':
                            objTemplate.find('span[data-role=sub-icon-container1]').attr('class', 'fa fa-arrow-'+_elem['icon']);
                            objTemplate.find('small[data-role=stats-sub1]').html(_elem['label']);
                            objTemplate.find('h4[data-role=stats-val1]').html(_elem['value']);                        
                        break;
                        case 'sub2':
                            objTemplate.find('span[data-role=sub-icon-container2]').attr('class', 'fa fa-arrow-'+_elem['icon']);
                            objTemplate.find('small[data-role=stats-sub2]').html(_elem['label']);
                            objTemplate.find('h4[data-role=stats-val2]').html(_elem['value']);                        
                        break;
                        case 'sub3':
                            objTemplate.find('small[data-role=stats-sub3]').html(_elem['label']);
                            objTemplate.find('h4[data-role=stats-val3]').html(_elem['value']);                        
                        break;
                    }
                     objTemplate.find('button[data-role=help-container]').attr('data-index', _index);
                })
                if(boolShowHelp){
                    objTemplate.find('button[data-role=help-container]').show();
                   
                } else{
                    objTemplate.find('button[data-role=help-container]').hide();
                }
                $panelstats.append(objTemplate.html())
                
            })
            
            //bindEventListeners();
            
        }
        
        var bindEventListeners = function(){
            var tempHelpArr = [
            'Traffic comparison is for the last 24Hrs',
            'Comparison is for the last 24Hrs',
            'Unique IPs is for last 24hrs'
        ]
            var popOverSettings = {
                placement: 'left',
                html: true,
                content: function () {
                    console.log(tempHelpArr[0])
                    var _info = tempHelpArr[0];
                    return _info
                }
            }
            
            $panelstats.find('button[data-role=help-container]').popover(popOverSettings);
            
        }
        
        var logMessages = function(_strMsg){
            console.log("** PanelStats > "+_strMsg);
        }

        plugin.init();

    }

    $.fn.panelstats = function(options) {
        return this.each(function() {
            if (undefined == $(this).data('panelstats')) {
                var plugin = new $.panelstats(this, options);
                $(this).data('panelstats', plugin);
            }
        });
    }

})(jQuery);