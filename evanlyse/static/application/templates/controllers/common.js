/* Common.js: Is a container for all common code utilized by the application */
/* DECLARATIONS/VARS */
var appServerURL, currentPage, applicationName, currentPageTitle, currentPageSubTitle, accountName, datasetLabel, applicationName, applicationAuthor, applicationVersion = '';
var dataReqArr = [];
var selectedMetricsArr = [];
var accctArr = [];
var updateInterval = [];
var config_id, from_date, to_date, aggreg_typ, metrics_arr, accounts_arr, sessionmetrics_arr, data_event, session_id, session_ip;
var sessionObject;
/* GET ALL DATA FROM ENGINE */
var setupApplication = function(){
    currentPage = $engine.getCurrentPage();
    applicationName = $engine.getApplicationName();
    applicationVersion = $engine.getApplicationVersion();
    applicationAuthor = $engine.getApplicationAuthor();
    $(document).find('.daterangepicker').remove();
    setApplicationInfo();
};
/* SETUP HEADER & FOOTER PANEL */
var setApplicationInfo = function(){
    $('#appname_txt').html(applicationName);
    $('#appversion_txt').html('<i>Version: </i>'+applicationVersion);
    $('#appauthor_txt').html('<i>Hand-crafted By: </i>'+applicationAuthor);
};
/* SESSION OBJECT */
var SessionObject = function(){
    var _session = this;
    var _status = false;
    this.getSessionObject = function(){
        session_id = $engine.getQuerystringParam('session_id');
        $engine.makeAJAXRequest(
            '/session/?session_id='+ session_id,
            'get',
            {},
            '',
            'json',
            {},
            true,
            getSessionHandler,
            dataErrorHandler
        );
        function getSessionHandler(_data){
            session_id = _data.id;
            config_id = _data.config_id;
            metrics_arr = _data.metrics;
            sessionmetrics_arr = metrics_arr;
            accounts_arr = _data.accounts;
            from_date = _data.from_date;
            to_date = _data.to_date;
            session_ip = _data.ip;
            aggreg_typ = _data.aggreg_type;
            data_event = _data.data_event;
            $engine.log('DASHBOARD > Type: ' + data_event);
            
            if(metrics_arr.length == 0){
                $.growl.error({title:'NOTE', message: 'Your session has expired. Redirecting you to the Configure page..'});
                setTimeout(function () {
                    $engine.setContent('CONFIGURE');
                }, 3000);
            }else{
                renderAccountsPanel();
                $.event.trigger({
                    type: "GET_SESSION_COMPLETE"
                });
            }
        }
    };
    this.updateSessionObject = function(_sessionobj, _page){
        $engine.makeAJAXRequest(
            '/session/?session_id=' + session_id,
            'put',
            _sessionobj,
            'application/x-www-form-urlencoded; charset=UTF-8',
            'json',
            {},
            true,
            updateSessionHandler,
            dataErrorHandler
        );
        function updateSessionHandler(_data){
            if(_page == '') $engine.getCurrentPage();
            cleanupBeforeNavigate();
            $engine.setContent(_page);
        }
    };
    this.resetSession = function(){
        $engine.makeAJAXRequest(
            '/session/reset/?config_id=' + config_id,
            'get',
            {},
            '',
            'json',
            {},
            true,
            resetSessionHandler,
            dataErrorHandler
        );
        function resetSessionHandler(_data){
            var _page = $engine.getCurrentPage();
            cleanupBeforeNavigate();
            $engine.setContent(_page);
        }
    };
    this.updateSessionAccounts = function(_accobj){
        $engine.makeAJAXRequest(
            '/session/update/accounts/',
            'post',
            {'account_ids': JSON.stringify(_accobj)},
            'application/x-www-form-urlencoded; charset=UTF-8',
            'json',
            {},
            true,
            updateAccountsHandler,
            dataErrorHandler
        );
        function updateAccountsHandler(_data){
            var _page = $engine.getCurrentPage();
            cleanupBeforeNavigate();
            $engine.setContent(_page);
        }
    };
    this.setSessionDates = function(_from, _to, _type){
        $engine.makeAJAXRequest(
            '/session/set_dates/',
            'post',
            {'start_date': _to, 'to_date': _from, 'aggreg_type':_type},
            'application/x-www-form-urlencoded; charset=UTF-8',
            'json',
            {},
            true,
            updateDatesHandler,
            dataErrorHandler
        );
        function updateDatesHandler(_data){
            var _page = $engine.getCurrentPage();
            cleanupBeforeNavigate();
            $engine.setContent(_page);
        }
    };
    
}
/* SET ACCOUNTS PANEL */
function renderAccountsPanel(){
    var _accounts = '';
    $engine.makeAJAXRequest(
        /config/+config_id,
        'get',
        {},
        'application/x-www-form-urlencoded; charset=UTF-8',
        'json',
        {},
        true,
        acctSuccessHandler,
        dataErrorHandler
    );
    function acctSuccessHandler(_data){
        var _acctsArr = _data.accounts
        var _checked = false;
        var _count = 0

        $.each(_acctsArr, function(indx, ele){
            _accounts += '<div class="col-md-4">\
                            <div class="acctschk checkbox">\
                                <label>\
                                    <input id="'+ ele['id'] + '" type="checkbox" value="'+ ele['id'] +'">'+ ele['name'] +'\
                                </label>\
                            </div>\
                        </div>'; 
        })
        $('#accts-container').find('div').remove();
        $('#accts-container').append(_accounts);

        $.each(accounts_arr, function(_indx, _ele){
            $('#'+_ele['id']).prop('checked', true);
        })
        $('.acctschk').on('click', function (event) {
            var _acctArr = [];
            $('#accts-container input:checked').each(function() {
                _acctArr.push($(this).val()) 
            });
            $.event.trigger({
                type: "SET_SESSION_ACCOUNTS",
                accounts: _acctArr
            });
        });
    }
}
/* DATE OBJECT */
var DateFilterComponent = function(_target, _options){
    var _dateFilter = this;
    var _target = _target;
    var _aggregType = '';
    var _settings = _options;
    _dateFilter._filterContainer = $('<div id="datefilter_container" class="date-range pull-right"></div>');
    _dateFilter._btnGroup = $('<div class="btn-group"></div>').appendTo(_dateFilter._filterContainer);
    _dateFilter._rangeToggleContainer = $('<div id="reportrange-btns" class="btn-group" data-toggle="buttons"></div>').appendTo(_dateFilter._btnGroup);
    _dateFilter._rangeSelectButton = $('<a id="reportrange" class="btn btn-info reportrange"></a>').appendTo(_dateFilter._btnGroup);
    _dateFilter._rangeSelectIcon = $('<i class="fa fa-calendar">&nbsp;</i>').appendTo(_dateFilter._rangeSelectButton);
    _dateFilter._rangeSelectLabel = $('<span class="daterange"></span>').appendTo(_dateFilter._rangeSelectButton);
    _dateFilter._rangeSelectCaret = $('<i class="fa fa-caret-down" style="margin:2px"></i>').appendTo(_dateFilter._rangeSelectButton);
    this.setOptions = function(){
        var _toggleButtons = _settings.rangeToggleButtons;
        $.each(_toggleButtons, function(_index, _elem){
            _dateFilter._rangeToggleOptButton = $('<label id="sel'+ removeSpacesInBetween(_elem) +'" class="btn btn-default" data-set="'+ _elem +'"><input type="radio" name="options">'+ _elem +'</label>');
            _dateFilter._rangeToggleOptButton.appendTo(_dateFilter._rangeToggleContainer)
        });
        _dateFilter._rangeSelectLabel.html(_settings.rangeSelectLabel);
        _dateFilter._rangeSelectButton
            .dateRangePicker({
                format: 'MMMM DD, YYYY',
                startDate: _settings.startDate,
                endDate: moment(),
                showShortcuts: true,
                getValue: function()
                {
                    return this.value;
                },
                setValue: function(s)
                {
                    this.innerHTML = s;
                },
                shortcuts : 
                {
                    'prev-days': [3,5,7],
                    'prev': null,
                    'next-days':null,
                    'next':null
                },
                customShortcuts: [
                    {
                        name: _settings.customShortcuts[0],
                        dates: function(){}
                    },
                    {
                        name: _settings.customShortcuts[1],
                        dates: function(){}
                    },
                    {
                        name: _settings.customShortcuts[2],
                        dates: function(){}
                    }
                ]
            })
            .on('datepicker-apply', function(event, obj){
                var _start = obj.date1;
                var _end = obj.date2;
                var _filter = obj.filter;
                _dateFilter.setDateRange(_start, _end, _filter);
            });
        _dateFilter.renderComponent();
    };
    this.setDateRange = function(_start, _end, _filter){
        var _numofdays = (_end - _start) / (1000*60*60*24);
        var _booltrigger = false;
        $engine.log(':::: _numofdays: '+_numofdays);
        switch(_filter.toLowerCase()){
            case 'hourly':
                if(_numofdays !== 1){
                    $.growl.error({title:'NOTE', message: 'Hourly data filter will only be available for date range less than a day'});
                    _booltrigger = false;
                }else{
                    _booltrigger = true;
                }
            break;
            case 'daily':
                if(_numofdays > 30){
                    $.growl.error({title:'NOTE', message: 'Daily data filter will only be available for date range less than 30 days'});
                    _booltrigger = false;
                }else{
                    _booltrigger = true;
                }
            break;
            case 'weekly':
                if(_numofdays > 90){
                    $.growl.error({title:'NOTE', message: 'Weekly data filter will only be available for date range less than 90 days'});
                    _booltrigger = false;
                }else{
                    _booltrigger = true;
                }
            break;
            case 'monthly':
                if(_numofdays > 180){
                    $.growl.error({title:'NOTE', message: 'Monthly data filter will only be available for date range less than 180 days'});
                    _booltrigger = false;
                }else{
                    _booltrigger = true;
                }
            break;
        }
        
        if(_booltrigger){
            $.event.trigger({
                type: "FILTER_BY_DATE",
                date_range: {'startDate':moment(_end).format('MMMM DD, YYYY'), 'endDate':moment(_start).format('MMMM DD, YYYY'), 'aggreg_type':_filter.toLowerCase()}
            });
        }
        $engine.log('startDate: '+moment(_end).format('MMMM DD, YYYY') + ' endDate: '+moment(_start).format('MMMM DD, YYYY') + ' aggreg_type: '+_filter.toLowerCase());
    }
    this.bindDateListeners = function(){
        var _selectedDate = $engine.getLocalStorage('selectedDate');
        if(_selectedDate){
            $('#sel'+removeSpacesInBetween(_selectedDate)).addClass('active');
        }else{
            var _defaultDate = removeSpacesInBetween(_settings.rangeToggleButtons[0]);
            $('#sel'+_defaultDate).addClass('active');
        };
        $('#reportrange-btns > .btn').on('click',function(event){
            console.log($(this).attr('id'))
            var _dataset = $(this).attr('data-set')
            var _start;
            var _end;
            var _filter = _settings.customShortcuts[0];
            switch(_dataset){
                case '3 Months':
                    _start = moment();
                    _end = moment().subtract('months', 3);
                    _filter = 'monthly';
                break;
                case 'Current Month':
                    _start = moment();
                    _end = moment().startOf("month");
                    _filter = 'weekly';
                break;
                case 'All':
                    _start = moment();
                    _end = _settings.startDate; 
                    _filter = 'daily';
                break;
                case 'Last 24 Hrs':
                    _start = moment(); 
                    _end =  moment().subtract('days', 1);
                    _filter = 'hourly';
                break;
            }
            $('#reportrange').removeClass('active')
            $engine.setLocalStorage('selectedDate', _dataset)
            _dateFilter.setDateRange(_end, _start, _filter)
        })
    };
    this.renderComponent = function(){
        _target.empty();
        _target.append(_dateFilter._filterContainer);
        _dateFilter.bindDateListeners();
    };
    this.removeComponent = function(){
        _target.data('dateRangePicker').destroy();
    };
    this.setOptions();    
}
/* REMOVE INTERVALS ETC BEFORE NAVIGATE AWAY - TBD: RATIONALIZE! */
var cleanupBeforeNavigate = function(){
    $engine.log('Cleaning up and garbage collection: '+updateInterval);
    $.each(updateInterval, function(index, elem){
        clearInterval(elem);
    })
    updateInterval.length = null;
}
/* SET APPLICATION ERROR STATE - LOADS ERROR.HTML */
var setApplicationDataError = function(){
    $engine.setContent('ERROR');
};
/* COMMON ERROR HANDLER FOR DATA LOAD */
var dataErrorHandler = function(jqXHR, textStatus, errorThrown){
    $engine.toggleViewLoader(false);
    setTimeout(function () {
        setApplicationDataError();
    }, 3000);
    $engine.log('ERROR > '+jqXHR.responseText);
};
/* CONFIGURE NAVIGATION AND BIND NAV EVENTS */
var configureNavigation = function(){
    currentPage = $engine.getCurrentPage();
    $('#main_nav > li.nav-toggle').each(function() {
        var _id= $(this).attr('id');
        if(_id === currentPage.toLowerCase()){
            $(this).addClass('active');
        }else{
            $(this).removeClass('active')
        }
    });
    $('#btn-export').on('click', function(event){
        currentPage = $engine.getCurrentPage();
        $.growl.warning({title:'NOTE', message: 'Exporting the view takes a few seconds. Please wait while export is in progress'});
        window.location = '/exportpdf/' + session_id + '/'+currentPage+'/';
    });
    $('#btn-edit').on('click', function(event){
        $('#config-panel').toggle('fast', function(){
            if($('#config-panel').is(':hidden')){
                $('#btn-edit').removeClass('active');
            }else{
                $('#btn-edit').addClass('active');
            }
        });
        event.preventDefault();
    });
    $('.btn-nav').on('click', function(event){
        var _content = $(this).attr('data-link')
        $engine.setContent(_content);
        cleanupBeforeNavigate();
        event.preventDefault();
    });
    $('#btn-clearfilters').on('click', function(event){
        sessionObject.resetSession();
    });
    $('.close-wl-win').on('click', function(event){
        $(this).parent().hide();
        $('#btn-edit').removeClass('active');
    });
    $('body').on('click', function (e) {
        $(this).find('.tooltip').hide();
    });
    $('.btn-nav').tooltip();
    $('#btn-export').tooltip();
    $('#btn-edit').tooltip();
    $('#btn-clearfilters').tooltip();
};
/* UTILS FUNCTION TO REMOVE SPACES IN BETWEEN A SENTENCE */
var removeSpacesInBetween = function(_str){
    _str = _str.replace(/ +/g, "");
    return _str;
}
/* HASH_CHANGE EVENT  HANDLER TRIGGERED BY ENGINE */
$(document).on("HASH_CHANGE", function(event){
    setupApplication();
});
