/* JS for Detailed/Historical Dashboard */
$(document).ready(function(){
    /* STATIC */
    var DASHBOARD_CONFIG = 'application/data/ipstart_dashboard_config.json';
    var CHART_CONFIG = 'application/data/ipstart_chart_config.json';
    var DATA_SERVICE_URI = '/dashboard/realtime/';
    var DATA_METRICS_ARR = ['TopN_IPsWithCountry','TopN_IPsWithCountry'];
    /* VARS */
    var objloadedArr = [];
    var dataCount = 20;
    var loadCount = 0;
    var widgetsObj, graphObj, options;
    var rt_from_date, rt_to_date;
    var sort_by = 0;
    /* INIT DASHBOARD & CLEANUP */
    function initDetailDashboard(){
        $('#dashboard-container').find('div[data-role=panel-container]').remove();
        $engine.toggleViewLoader(false);
        $engine.toggleViewLoader(true, 'Loading.. Please wait.', $('#dashboard-loader'));
        loadCount = 0;
        objloadedArr.length = null;
        if(!sessionObject) sessionObject = new SessionObject();
        sessionObject.getSessionObject();
    }
    /*  RENDER DASHBOARD LAYOUT USING JQUERY.DASHBOARD PLUGIN
        CALLED ONCE SESSION OBJECT TRIGGERS "GET_SESSION_COMPLETE" EVENT
    */
    function renderDashboardUX(){
        if(from_date == 'None'){
            $('#date-subtitle').html('Duration: 3 months | monthly');
        }else{
            $('#date-subtitle').html('From: '+ from_date.split(' ')[0] + ' | To: ' + to_date.split(' ')[0] + ' | Filtered: '+ aggreg_typ);
        }
        $('#dashboard-container').empty();
        $('#dashboard-container').dashboard({
            configSrc                      : DASHBOARD_CONFIG,
            utilsObj                       : $engine,
            templateObj                    : $('#graphtemplate'),
            metricsArr                     : DATA_METRICS_ARR
        });
        $engine.log('DASHBOARD > setupDashboardUX: Config: ' + DASHBOARD_CONFIG);
    }
    /*  RENDER DASHBOARD LAYOUT USING JQUERY.DASHBOARD PLUGIN. SETS CHART CONFIGURATION OPTIONS
        CALLED ONCE DASHBOARD PLUGIN TRIGGERS "SETUP_UI_COMPLETE" EVENT
    */
    function configureCharts(){
        $engine.loadJSON(CHART_CONFIG).done(function(_conf){
            var _graphObj = _conf.app.graphs;
            options = _graphObj;
            getDashboardData();
        })
        .fail(function(jqxhr, textStatus, error){
            $engine.log("CFLAPP > Error loading chart config: "+textStatus);
        });
    }
    /*  MAKES AJAX CALLS TO SERVICES THROUGH ENGINE
        DATAMETRICS ARE POPULATED FROM SESSION METRICS ARRAY
    */
    function getDashboardData(){
        var _serviceURI = '';
        $.each(DATA_METRICS_ARR, function(_index, _dataset){
            if((DATA_METRICS_ARR[_index] !== 'NA')){
                objloadedArr.push(DATA_METRICS_ARR[_index]);
                _serviceURI = DATA_SERVICE_URI + "?dataset=" + _dataset + "&session_id=" + session_id + '&data_count='+ dataCount + '&sort_by='+ sort_by;
                $engine.makeAJAXRequest(
                    _serviceURI,
                    'get',
                    {},
                    '',
                    'json',
                    {itemIndex: _index, dataSet: _dataset},
                    true,
                    graphDataSuccessHandler,
                    dataErrorHandler
                );
            }
            sort_by = 1;
        });
        
    }
    /*  LOAD SUCCESS HANDLER SETS CHART DATA */
    function graphDataSuccessHandler(_data){
        var _itemIndex = this.itemIndex;
        var _dataSet = this.dataSet;
        if ( _data.hasOwnProperty('app') ) {
            graphObj = _data.app.graphs;
            setChartData(_itemIndex, _dataSet);
        }else{
            $engine.log("CFLAPP > Error: Malformed data?");
            setApplicationDataError();
        }
        
    }
    /*  SETS CHART DATA TO RENDER CHARTS */
    function setChartData(_itemIndex, _dataSet){
        var _panelcontainer = $('#'+options[_itemIndex].config.chart['renderTo']);
        _panelcontainer.empty();
        if(graphObj[0].dataset.insights){                
            $engine.toggleUIMessages(true, graphObj[0].dataset.insights.graphAlert['text'], _panelcontainer.parent(), 80, 50);
            _panelcontainer.parent().parent().parent().find('.drilldown-button').css('visibility', 'hidden');
            _panelcontainer.parent().parent().parent().find('.refresh-button').css('visibility', 'hidden');
        }else{
            $engine.toggleUIMessages(false, '', _panelcontainer.parent(), 0, 0);
        }
        try{
            switch(options[_itemIndex]['lib']){
                case 'datatable':
                    renderDatatable(_panelcontainer, graphObj[0].dataset.data, _dataSet);
                    loadCount ++;
                break;
            }
        }catch(ex){
            $engine.log("CFLAPP > Exception: "+ex.toString());
        }
        graphsLoadCompleteHandler();
    }
    /*  RENDER DATATABLES */
    function renderDatatable(_target, _data, _dataset){
        var _displayLength = 0;
        _displayLength = 20;
        _target.append('<table cellpadding="0" cellspacing="0" border="0" class="table table-bordered table-hover" id="'+_dataset+'"><thead><th></th><th></th><th></th></thead><tbody></tbody></table>');
        
        _target.find('table').dataTable({
            "bProcessing": true,
            "bAutoWidth": false,
            "bLengthChange": false,
            "iDisplayLength" : _displayLength,
            "bFilter": false,
            "bInfo": false,
            "bPaginate": false,
            "sDom": "<'row'<'col-xs-6'T><'col-xs-6'f>r>t<'row'<'col-xs-6'i><'col-xs-6'p>>",
            "sPaginationType": "bootstrap",
            "bDestroy": true,
            "aoColumns": _data.aoColumns,
            "aaData":_data.aaData,
            "aaSorting": [[ 2, 'desc' ]],
            "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
                $(nRow).on('click', function() {
                    var _ip = aData[1]
                    var _ipsessionObject = {}
                    _ipsessionObject += '&add_accounts_txt=&sel_metrics='+sessionmetrics_arr+'&data_event=ipintel'+'&from_date=None'+'&to_date=None&aggreg_type=None&ip='+_ip;
                    sessionObject.updateSessionObject(_ipsessionObject, 'IPINTELLIGENCE');
                }); 
            }
        });
    }

    /*  SETS ACCOUNTS FOR THE SESSION IN THE ACCOUNTS PANEL - ON SELECT/DESELECT */
    function setSessionAccounts(_acc){
        var _updateSessionObj = {};
        if(from_date === undefined) _from='None';
        if(to_date === undefined) _to='None';
        if(_acc.length > 0){
            _updateSessionObj+='&add_accounts_txt='+ _acc.toString() +'&sel_metrics='+sessionmetrics_arr+'&data_event='+data_event+'&from_date='+from_date+'&to_date='+ to_date +'&aggreg_type='+aggreg_typ;
        }
        sessionObject.updateSessionObject(_updateSessionObj, 'IPINTELLIGENCE');
    }
    /*  SETS DATE RANGE FOR THE SESSION IN THE ACCOUNTS PANEL - ON SELECT OF DATES */
    function setDateRange(_fromdate, _todate, _aggregtype){
        sessionObject.setSessionDates(_fromdate, _todate, _aggregtype);
    }   
    /*  CHECKS FOR "LOADED" BASED ON ARRAY */
    function graphsLoadCompleteHandler(){
        $engine.log('DASHBOARD > LOADER: '+objloadedArr.length + ' / ' + loadCount)
        if(objloadedArr.length == loadCount){
            $engine.toggleViewLoader(false);
            $('.drilldown-button').show();
            loadCount=0;
            objloadedArr.length = null;
        }
    }
    /*  BIND COMMON DASHBOARD EVENTS */
    function bindDashboardEvents(){
        configureNavigation();
        
    }
    /*  DOCUMENT/WINDOW LEVEL EVENT LISTENERS */
    $(document).off("SETUP_UI_COMPLETE").on("SETUP_UI_COMPLETE", function(event){
        configureCharts();
        bindDashboardEvents();
        event.stopPropagation();
    });
    
    $(document).off("GET_SESSION_COMPLETE").on("GET_SESSION_COMPLETE", function(event){
        renderDashboardUX();
        event.stopPropagation();
    });
    
    $(document).off("SET_SESSION_ACCOUNTS").on("SET_SESSION_ACCOUNTS", function(event){
        setSessionAccounts(event.accounts);
        event.stopPropagation();
    });
    
    $(document).off("FILTER_BY_DATE").on("FILTER_BY_DATE", function(event){
        var _from_date = event.date_range['startDate'];
        var _to_date = event.date_range['endDate'];
        var _aggreg_typ = event.date_range['aggreg_type'];
        setDateRange(_from_date, _to_date, _aggreg_typ);
    });
    
    $(window).on('hashchange', function(){
        cleanupBeforeNavigate();
    });
    
    $(document).on('unload', function(event){
        cleanupBeforeNavigate();
    })
    
    initDetailDashboard();
});