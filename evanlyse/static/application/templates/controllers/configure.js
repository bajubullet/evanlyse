/* JS for Configure page */
$(document).ready(function(){
    /* STATIC */
    var CONFIG_DATA_URI = '/config/';
    var ACCOUNTS_DATA_URI = '/accounts/';
    /* VARS */
    var configArr = [];
    var configId = '';
    var buttonLabel = '';
    
    /* FUNCTION TO INITIALIZE CONFIGURATION PAGE */
    function initConfigure(){
        $engine.clearLocalStorage();
        getAllConfigurations();
    };
    /* FUNCTION TO GET ALL AVAILABLE CONFIGURATIONS */
    function getAllConfigurations(){
        $('#config-sel').find('option').remove();
        $engine.makeAJAXRequest(
            CONFIG_DATA_URI,
            'get',
            {},
            'application/x-www-form-urlencoded; charset=UTF-8',
            'json',
            {},
            true,
            setConfigurations,
            errorHandler
        );
        function setConfigurations(_data){
            $.each(_data, function(){
                $('#config-sel').append('<option value=' + this['id'] + '>' + this['name'] +'</option>');
            });
            getSelectedConfiguration(); 
        }
        bindPageEvents();
    };
    /* FUNCTION TO BIND CONFIGURATION VIEW EVENTS */
    function bindPageEvents(){
        $("#add_accounts_txt").tokenInput(
            ACCOUNTS_DATA_URI,
            {
                hintText            : "Start typing an account name..",
                preventDuplicates   : true,
                theme               : "facebook"
            }
        );
        $('#config-sel').on('change', function(event){
            getSelectedConfiguration();
        });
        $('#chkSelectall').on('click', function(event) {
            $('.configchk').prop('checked', this.checked);
        });
        $('.configchk').on('click', function () {
            if (!$(this).is(':checked')) $('#chkSelectall').prop('checked', false);
        });
        $('#load-btn').on('click', function(event){
            buttonLabel = $(this).html();
            $('#config-form').find('.val-msg').remove();
            $('#metrics-container').find('.val-msg').remove();
            saveConfiguration();
            event.preventDefault();
        });
        function saveConfiguration(){
            var _selectedMetrics = [];
            var _regdataObj = $('#config-form').serialize();
            var _dataEvent = 'realtime';
            var _selectedConfig = $('#config-sel option:selected').attr('value');
            $('.configchk:checked').each(function() {
                _selectedMetrics.push($(this).val());
            });
            _regdataObj+='&sel_metrics='+_selectedMetrics+'&data_event='+_dataEvent;
            selectedMetricsArr = _selectedMetrics
            $('#load-btn').attr('disabled', 'disabled');
            $engine.makeAJAXRequest(
                CONFIG_DATA_URI + _selectedConfig,
                'put',
                _regdataObj,
                'application/x-www-form-urlencoded; charset=UTF-8',
                'json',
                {},
                true,
                saveSuccessHandler,
                errorHandler
            );
        };
        function saveSuccessHandler(_data){
            if (_data.errorText) {
                $engine.toggleStatusMessages(true, $('#config-msg'), 'ERROR: Error processing request.', 'success');
                $('#load-btn').html(buttonLabel);
                $('#load-btn').attr('disabled', false);
            } else {
                $engine.toggleStatusMessages(true, $('#config-msg'), 'Your Configuration has been saved. Loading Dasboard..', 'success');
                setTimeout(function () {
                    $('#load-btn').html(buttonLabel);
                    $('#load-btn').attr('disabled', false);
                    $engine.setContent('REALTIME');
                }, 2000);
            }
        }
    }
    /* FUNCTION TO GET SELECTED CONFIGURATION */
    function getSelectedConfiguration(){
        configId = $('#config-sel option:selected').attr('value');
        if (!configId) return;
        $engine.makeAJAXRequest(
            CONFIG_DATA_URI + configId,
            'get',
            {},
            'application/x-www-form-urlencoded; charset=UTF-8',
            'json',
            {},
            true,
            configureSettings,
            errorHandler
        );
        function configureSettings(_data){
            resetSettings();
            $('#configname_txt').val(_data['name']);
            $.each(_data['accounts'], function(){
                $("#add_accounts_txt").tokenInput('add', this);
            });
            $('.configchk').each(function() {
                if ($.inArray($(this).val(), _data['graphs']) !== -1) {
                    $(this).prop('checked', true);
                }
            });
            if ($('.configchk:checked').length === 9) {
                $('#chkSelectall').prop('checked', true);
            }
            $('#token-input-add_accounts_txt').off();
            $('.token-input-list-facebook').find('li').find('span').empty();
            $('.token-input-list-facebook').off();
            $('#token-input-add_accounts_txt').prop('readonly', true); 
        };
        
    }
    /* FUNCTION TO CONFIGURATION LANDING VIEW EVENTS */
    function bindLandingPageEvents(){
        $('#home-container .btn-home').on('click', function(event){
            $('#home-container').hide();
            $('#config-form-container').show();
            initConfigure();
        })
    }
    /* FUNCTION TO RESET ELEMENTS */
    function resetSettings() {
        $('#configname_txt').val('');
        $("#add_accounts_txt").tokenInput('clear');
        $('.configchk').prop('checked', false);
        $('#chkSelectall').prop('checked', false);
    }
    /* FUNCTION TO HANDLE SERVICE ERRORS */
    function errorHandler(jqXHR, textStatus, errorThrown){
        setTimeout(function () {
            setApplicationDataError();
        }, 1000);
        $engine.log('ERROR > '+jqXHR.responseText);
    }
    bindLandingPageEvents();
});
