//TO DO while Dev: Edit Existing refresh combo?

$(document).ready(function(){
    /* All VARS */
    var configURI =  '/config/';
    var accountsURI ='/accounts/';
    var configArr = []
    var isUpdate = false;
    var pageMode = '2';
    var buttonLabel = '';
    var firstTime = true;

    /* Function to init this view */
    function initConfigure(){
       loadConfiguration()
    }

    function loadConfiguration(){
        $('#config-sel').find('option').remove();
        callAJAXService(
                configURI,
                '',
                'get',
                'application/x-www-form-urlencoded; charset=UTF-8',
                'json',
                '',
                confSuccessHandler,
                errorHandler
        );
        bindAllEvents();
    }

    /* Function to bind events for elements in this view */
    function bindAllEvents(){
        
        // LOAD EXISTING CONFIGURATION -----
        $('#config-rdo > .btn').on('click',function() {
            $('#config-form').find('.val-msg').remove();
            $('#config-msg').html('');
            $('#metrics-container').find('.val-msg').remove();
            var _selectedOption = $(this).attr('data-value');
            if(_selectedOption == 'yes'){
                $('#option1').attr('checked', false);
                $('#config-container').show();
                fetchConfig();
                isUpdate = true;
            }else{
                $('#option1').attr('checked', true);
                $('#config-container').hide();
                clearConfig();
                isUpdate = false;
            }
        });

        $('#config-sel').on('change', function(event){
            fetchConfig();
        })

        $('#data-rdo > .btn').on('click',function() {
            var _selectedOption = $(this).attr('data-value');
            if(_selectedOption == 'yes'){
                $('#option1').attr('checked', true);
                $('#metrics-container').hide();
                //isUpdate = true;
            }else{
                $('#option1').attr('checked', false);
                $('#metrics-container').show();
                //isUpdate = true;
            }
        });
        // LOAD EXISTING CONFIGURATION END-----
        
        // SELECT METRICS -----
        $('#chkSelectall').on('click', function(event) {
            $('.configchk').prop('checked', this.checked);
        });

        $('.configchk').on('click', function () {
            if (!$(this).is(':checked')) $('#chkSelectall').prop('checked', false);
        });
        // SELECT METRICS END -----

        // ADD NEW ACCOUNT FORM-------
        $('#toggle-addacct-form').on('click', function(event){
            $('#config-msg').html('');
            $('#addacct-form').find('.valmsg').remove();
            $('#addacct_email_txt').val('');
            $('#addacct-form').toggle('fast');
            event.preventDefault();
        });

        $('#addacct-btn-add').on('click', function(event){
            $('#addacct-form').find('.valmsg').remove();
            var _accountId = $('#addacct_acctid_txt').val();
            var _acgId = $('#addacct_acgid_txt').val();
            var _accountName = $('#addacct_acctname_txt').val();
            var _accountCPCode = $('#addacct_cpcode_txt').val();
            var _acctAbbr = $('#addacct_acctabbr_txt').val();
            if((_accountId !== '') && (_acgId !== '') && (_accountName !== '') && (_accountCPCode !== '') && (_acctAbbr !== '')){
                saveAccount();
            }else{
                if(_accountId == ''){
                    $('#addacct_acctid_txt').after('<span class="val-msg">Account ID is required</span>');
                }
                if(_acgId == ''){
                    $('#addacct_acgid_txt').after('<span class="val-msg">ACG ID is required</span>');
                }
                if(_accountName == ''){
                    $('#addacct_acctname_txt').after('<span class="val-msg">Account Name is required</span>');
                }
                if(_accountCPCode == ''){
                    $('#addacct_cpcode_txt').after('<span class="val-msg">Atleast one CP Code is required</span>');
                }
                if(_acctAbbr == ''){
                    $('#addacct_acctabbr_txt').after('<span class="val-msg">Account Abbreviation is required</span>');
                }

            }
        });

        function saveAccount() {
            var _accdataObj = {};
            $.each($('#addacct-form input'), function(){
                _accdataObj[this.name] = this.value;
            })
            callAJAXService(
                accountsURI,
                _accdataObj,
                'post',
                'application/x-www-form-urlencoded; charset=UTF-8',
                'json',
                '',
                accSuccessHandler,
                accErrorHandler
            );
        }

        $('#addacct-btn-close').on('click', function(event){
            $('#addacct-form').toggle('fast');
        });
        // ADD ACCOUNT FORM END-------


        // CONFIG PANEL BUTTON HANDLERS -----
        $('#load-btn').on('click', function(event){
            buttonLabel = $(this).html();
            $('#config-form').find('.val-msg').remove();
            $('#metrics-container').find('.val-msg').remove();
            var _configName = $('#configname_txt').val();
            var _accounts = $('#add_accounts_txt').val();
            var _metricschk = $("input[type='checkbox']");

            
                if((_configName !== '') && (_configName.trim().length > 0) && (_accounts.length > 0)){
                    configureSubmit();
                }else{
                    if((_configName == '') || (_configName.trim().length == 0)){
                        $('#configname_txt').after('<span class="val-msg">Configuration Name is required</span>');
                    }
                    if(_accounts == ''){
                        $('#add_accounts_txt').after('<span class="val-msg">Atleast one Account is required</span>');
                    }
                    if(!_metricschk.is(":checked")){
                        $('#metrics-container').append('<span class="val-msg">Atleast one Metric is required</span>');
                    }
                }
            
        })
        
        /* Submit handler */
        function configureSubmit(){
            var _selectedMetrics = [];
            var _regdataObj = $('#config-form').serialize();
            var _dataEvent = '';
            _selectedMetrics = [];
           
            _regdataObj+='&sel_metrics='+_selectedMetrics+'&data_event='+_dataEvent;
            selectedMetricsArr = _selectedMetrics
            $('#load-btn').attr('disabled', 'disabled');
            callAJAXService(
                isUpdate ? configURI + $('#config-sel option:selected').attr('value'): configURI,
                _regdataObj,
                isUpdate ? 'put' : 'post',
                'application/x-www-form-urlencoded; charset=UTF-8',
                'json',
                '',
                regSuccessHandler,
                regErrorHandler
            );
        }

        /* Submit success handler */
        function regSuccessHandler(data){
            if (data.errorText) {
                console.log('Error: ' + data.errorText);
                $('#config-msg').html('ERROR: Error processing request');
                $('#load-btn').html(buttonLabel);
                $('#load-btn').attr('disabled', false);
            } else {
                $('#config-msg').html('SUCCESS: Your configuration has been saved');
                setTimeout(function () {
                    $('#config-msg').html('');
                    $('#load-btn').html(buttonLabel);
                    $('#load-btn').attr('disabled', false);
                }, 3000);
                
            }
        }

        /* Submit error handler */
        function regErrorHandler(jqXHR, textStatus, errorThrown){
            console.log("ERROR: "+textStatus);
            var errorText = '';
            if(jqXHR.responseText){
                errorText = jqXHR.responseText
            }else{
                errorText = "Service is unavailable"
            }
            $('#config-msg').html('ERROR: '+errorText);
            $('#load-btn').html(buttonLabel);
            $('#load-btn').attr('disabled', false);
        }

        function accSuccessHandler(data){
            if (data.errorText) {
                console.log('Error: ' + data.errorText);
                $('#config-msg').html('ERROR: Error processing request');
            } else {
                $('#config-msg').html('SUCCESS: Account added successfully');
            }
            $('#addacct-form').toggle('fast');
            $.each($('#addacct-form input'), function(){
                this.value = '';
            })
        }

        function accErrorHandler(jqXHR, textStatus, errorThrown){
            var errorText = '';
            if(jqXHR.responseText){
                errorText = jqXHR.responseText
            }else{
                errorText = "Service is unavailable"
            }
            $('#config-msg').html('ERROR: '+errorText);
            $('#addacct-form').toggle('fast');
        }

        // CONFIG PANEL BUTTON HANDLERS END -----
    }

    function confSuccessHandler(data) {
        $.each(data, function(){
            $('#config-sel').append('<option value=' + this['id'] + '>' + this['name'] +'</option>');
        });
        if(pageMode == '1') fetchConfig();
    }

    function errorHandler(jqXHR, textStatus, errorThrown){
        console.log("ERROR: "+textStatus);
    }

    function fetchConfig() {
        configId = $('#config-sel option:selected').attr('value');
        if (!configId) {
            return;
        }
        callAJAXService(
            configURI + configId,
            '',
            'get',
            'application/x-www-form-urlencoded; charset=UTF-8',
            'json',
            '',
            setConfig,
            errorHandler
        );
    }

    function setConfig(data) {
        clearConfig();
        $('#configname_txt').val(data['name']);
        $.each(data['accounts'], function(){
            $("#add_accounts_txt").tokenInput('add', this);
        });
        $('.configchk').each(function() {
            if ($.inArray($(this).val(), data['graphs']) !== -1) {
                $(this).prop('checked', true);
            }
        });
        if ($('.configchk:checked').length === 9) {
            $('#chkSelectall').prop('checked', true);
        }
        if(pageMode == '1'){
            $('#token-input-add_accounts_txt').off();
            $('.token-input-list-facebook').find('li').find('span').empty();
            $('.token-input-list-facebook').off();
        } 
    }

    $("#add_accounts_txt").tokenInput(
        accountsURI,
        {
            hintText            : "Start typing an account name..",
            preventDuplicates   : true,
            theme               : "facebook"
        }
    );
    
    function clearConfig() {
        $('#configname_txt').val('');
        $("#add_accounts_txt").tokenInput('clear');
        $('.configchk').prop('checked', false);
        $('#chkSelectall').prop('checked', false);
    }
    
    $('#home-container .btn-home').on('click', function(event){
        pageMode = $(this).attr('data-set');
        initConfigure();
    })
    
    function callAJAXService(_uri, _reqdata, _method, _reqtype, _resptype, _context, _successHandler, _errorHandler){
        var _req = $.ajax({
            type: _method,
            url: _uri,
            data: _reqdata,
            contentType: _reqtype,
            dataType: _resptype,
            processData: true,
            context: _context
        });
        _req.done( _successHandler );
        _req.fail( _errorHandler );
        
    }

    initConfigure();

});
