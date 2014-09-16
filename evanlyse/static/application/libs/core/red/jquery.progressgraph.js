  /*!
 * RHYTHM UX - Progress Graph
 * Version 1
 * Requires jQuery v1.11 or later  & Bootstrap 3
 * 
 * Author: Arun V.Sarma
 */

(function($) {

    $.progressgraph = function(element, options) {

        var defaults = {
            graphData                      : '',
        }

        var plugin = this;

        plugin.settings = {}

        var $progressgraph = $(element),
             progressgraph = element;

        plugin.init = function() {
            logMessages('Plugin loaded')
            plugin.settings = $.extend({}, defaults, options);
            setConfiguration();
        }

        var setConfiguration = function(){
            logMessages(' fn > setConfiguration');
            var _strConfig = plugin.settings.graphData;
            setGraphData(_strConfig);
        }

        var setGraphData = function(_objData){
            logMessages(' fn > setGraphData');
            $.each(_objData, function(i, _elem){
                var _progressGraph = getUI(_elem['type'], _elem['value'], _elem['label']) 
                $progressgraph.append(_progressGraph)
            })
        }
        
        var getUI = function(_type, _value, _label){
            logMessages(' fn > getUI');
            var _badge = '<span class="tiny-text pull-right">'+_value+'</span>' 
            var _progressBar = '<div class="small-heading pull-left">'+ _label +'</div><div class="clearfix"></div><div class="progress"><div class="progress-bar progress-bar-'+ _type +'" role="progressbar" aria-valuenow="' + _value + '" aria-valuemin="0" aria-valuemax="100" style="width:' + _value + '%" >' + _badge + '</div></div>';
            return _progressBar
        }

        var logMessages = function(_strMsg){
            console.log("** ProgressGraph > "+_strMsg);
        }

        plugin.init();

    }

    $.fn.progressgraph = function(options) {
        return this.each(function() {
            if (undefined == $(this).data('progressgraph')) {
                var plugin = new $.progressgraph(this, options);
                $(this).data('progressgraph', plugin);
            }
        });
    }

})(jQuery);