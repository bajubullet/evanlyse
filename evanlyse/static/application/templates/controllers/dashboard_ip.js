/* JS for Detailed/Historical Dashboard */
$(document).ready(function(){
    /* STATIC */
    var DASHBOARD_CONFIG = 'application/data/ip_dashboard_config.json';
    var CHART_CONFIG = 'application/data/ip_chart_config.json';
    var DATA_SERVICE_URI = '/dashboard/realtime/';
    var DATA_METRICS_ARR = ["NoOfRulesByTime", "IPDetails", "ImpactedAccounts"];
    /* VARS */
    var objloadedArr = [];
    
    var dataCount = 288;
    var loadCount = 0;
    var widgetsObj, graphObj, options;
    var ips = '';
    var ipSort = 0;
    var dateCompoment;
    var changedOrder;
    /* INIT DASHBOARD & CLEANUP */
    function initDetailDashboard(){
        $('#dashboard-container').find('div[data-role=panel-container]').remove();
        $engine.toggleViewLoader(false);
        $engine.toggleViewLoader(true, 'Loading.. Please wait.', $('#dashboard-loader'));
        var _options = {
            startDate: moment(new Date(2014, 5, 12)),
            minDate: moment().subtract('months', 6),
            rangeToggleButtons: ['All', 'Last 24 Hrs'],
            rangeSelectLabel : 'Custom',
            customShortcuts: ['Hourly', 'Daily', 'Weekly']
        };
        dateCompoment = new DateFilterComponent($('#datefilter_container'), _options);
        loadCount = 0;
        objloadedArr.length = null;
        if(!sessionObject) sessionObject = new SessionObject();
        sessionObject.getSessionObject();
    }
    /*  RENDER DASHBOARD LAYOUT USING JQUERY.DASHBOARD PLUGIN
        CALLED ONCE SESSION OBJECT TRIGGERS "GET_SESSION_COMPLETE" EVENT
    */
    function renderDashboardUX(){
        var _ips = '';
        ips = session_ip;
        if(from_date == 'None'){
            $('#date-subtitle').html('Duration: Last 24 hrs | hourly');
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
                _serviceURI = DATA_SERVICE_URI + "?dataset=" + _dataset + "&session_id=" + session_id + "&data_count="+dataCount+ "&ips="+ ips + '&sort_by='+ipSort+ "&from=" + from_date + "&to=" + to_date + "&aggreg_type=" + aggreg_typ;
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
                case 'highcharts-rt':
                    renderHighcharts(_panelcontainer, options[_itemIndex]);
                    loadCount ++;
                break;
                case 'listbox':
                    renderListbox(_panelcontainer, graphObj[0].dataset);
                    loadCount ++;
                break;
                case 'dendro':
                    renderDendro(_panelcontainer, graphObj[0].dataset);
                    loadCount ++;
                break;
            }
        }catch(ex){
            $engine.log("APP > Exception: "+ex.toString());
        }
        graphsLoadCompleteHandler();
    }
    /*  RENDER HIGHCHARTS */
    function renderHighcharts(_target, _data){
        if(graphObj[0].dataset.xAxis) _data.config.xAxis.categories = graphObj[0].dataset.xAxis.categories;
        if(graphObj[0].dataset.series) _data.config.series = graphObj[0].dataset.series;
        _data.config.plotOptions.series['pointStart'] = graphObj[0].dataset.xAxis.categories[0];
        Highcharts.setOptions({
            global : {
                useUTC : true
            }
        });
       _target.highcharts('StockChart', _data.config);
    }
    /*  RENDER LISTBOX */
    function renderListbox(_target, _data){
        _target.empty();
        if(_data['IP']){
            $('#title-txt').html('IP Profile For: '+_data['IP']);
            _target.prepend('<h4><i>Network &amp; Location Details:</i></h4><br>');
            $.each(_data, function(key, element){
                _target.append('<div class="col-md-6" style="color:#39C3E4;font-size:13px;text-align:left">'+ key +': </div><div class="col-md-6" style="color:#666666;font-size:13px;text-align:left;text-overflow:ellipsis;overflow:hidden">'+ element +'</div>');
            });
        }else{
            _target.prepend('<h4><i></i></h4><br>');
        }
    }
    /*  RENDER DENDRO - USING DENDRO LIB */
    function renderDendro(_target, _data){
        //if(!_data.insights){
        var _targetId = _target.attr('id'); 
        _target.css('text-align', 'center');
        var width = 960, height = 500;
        var cluster = d3.layout.cluster().size([height, width - 160]);
        var diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; });
        var svg = d3.select('#'+_targetId).append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(40,0)");   
    var nodes = cluster.nodes(_data),
          links = cluster.links(nodes);

        var link = svg.selectAll(".link")
            .data(links)
            .enter().append("path")
            .attr("class", "link")
            .attr("d", diagonal);

        var node = svg.selectAll(".node")
            .data(nodes)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });
        node.append("circle")
            .attr("r", 8);

        node.append("text")
            .attr("dx", function(d) { return d.children ? -10 : 10; })
            .attr("dy", 3)
            .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
            .text(function(d) { return d.name; });
        d3.select(self.frameElement).style("height", height + "px");
        //}
        
    }
    /*  SETS ACCOUNTS FOR THE SESSION IN THE ACCOUNTS PANEL - ON SELECT/DESELECT */
    function setSessionAccounts(_acc){
        var _updateSessionObj = {};
        if(from_date === undefined) _from='None';
        if(to_date === undefined) _to='None';
        if(_acc.length > 0){
            _updateSessionObj+='&add_accounts_txt='+ _acc.toString() +'&sel_metrics='+sessionmetrics_arr+'&data_event='+data_event+'&from_date='+from_date+'&to_date='+ to_date +'&aggreg_type='+aggreg_typ;
        }
        sessionObject.updateSessionObject(_updateSessionObj);
    }
    /*  SETS DATE RANGE FOR THE SESSION IN THE ACCOUNTS PANEL - ON SELECT OF DATES */
    function setDateRange(_fromdate, _todate, _aggregtype){
        sessionObject.setSessionDates(_fromdate, _todate, _aggregtype);
    }
    /*  CHECKS FOR "LOADED" BASED ON ARRAY */
    function graphsLoadCompleteHandler(){
        $engine.log('DASHBOARD > LOADER: '+objloadedArr.length + ' / ' + loadCount);
        if(objloadedArr.length == loadCount){
            $engine.toggleViewLoader(false);
            loadCount=0;
            objloadedArr.length = null;
        }
    }
    /*  BIND COMMON DASHBOARD EVENTS */
    function bindDashboardEvents(){
        configureNavigation();
        
        $('#sort-rdo > .btn').on('click',function() {
            var _selectedOption = $(this).attr('data-value');
            if(_selectedOption == 'yes'){
                $('#option1').attr('checked', true);
                ipSort = 0;
            }else{
                $('#option1').attr('checked', false);
                ipSort = 1;
            }
            if($('#dashboard-loader').html() == ''){
                $engine.toggleViewLoader(true, 'Updating Data.. Please wait.', $('#dashboard-loader'));
            }
            loadIPDataset(true);
        });
        
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
    });
    
    initDetailDashboard();
});