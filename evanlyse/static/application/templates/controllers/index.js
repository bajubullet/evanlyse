
$(document).ready(function(){
  $engine = '';
  $navigation = '';

  $('#page-wrapper').rhythmux({
            strConfigurationPath                : 'application/config/config.json',
            strDefaultSkin                      : 'light',
            objSkins                            : {'dark':'application/styles/skin_dark.css', 'light':'application/styles/skin_white.css'},
            strSkinKey                          : 'mode',
            strConfigKey                        : 'config',
            strViewsPath                        : 'application/templates/views/',
            strControllersPath                  : 'application/templates/controllers/',
            strPageTitle                        : 'Evanalyse',
            objAppServerURL                     : {'SELF': '', 'LOCAL':'http://localhost:8001', 'DEV':'http://dev.cst.akamai.com:81', 'STAG':'https://stag.cst.akamai.com', 'PROD':'https://cfl.cst.akamai.com'},
            boolShowBackButton                  : true
        });


  $engine = $('#page-wrapper').data('rhythmux');
  $engine.setApplicationEnvironment('SELF');

});
