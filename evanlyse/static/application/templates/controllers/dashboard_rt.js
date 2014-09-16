/* JS for Real-time Dashboard */
$(document).ready(function() {

    $engine.makeAJAXRequest(
                    '/top_accounts/',
                    'get',
                    {},
                    'application/x-www-form-urlencoded; charset=UTF-8',
                    'json',
                    {},
                    true,
                    function(data) {
                        debugger;
                    },
                    function(data) {
                        debugger;
                    }
                );

    $('#first-chart').highcharts({
        chart: {
            plotBackgroundColor: null,
            plotShadow: false
        },
        title: null,
        
        exporting: {
            enabled: false
        },

        credits: {
              enabled: false
        },
        
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        series: [{
            type: 'pie',
            name: 'Events share',
            data: [
                ['1-DR4E2',   45.0],
                ['1-HPEAP',       26.8],
                {
                    name: '1-6F34I6',
                    y: 12.8,
                    sliced: true,
                    selected: true
                },
                ['1-4ZQ835',    8.5],
                ['AANA-1ZG45D',     6.2],
                ['AANA-2AQ43C',   0.7]
            ]
        }]
    });

    $('#second-chart').highcharts({
        chart: {
            plotBackgroundColor: null,
            plotShadow: false
        },
        title: null,
        
        exporting: {
            enabled: false
        },

        credits: {
              enabled: false
        },
        
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        series: [{
            type: 'pie',
            name: 'Events share',
            data: [
                ['ams5.cmb',   45.0],
                ['p3-tomapp1.',       26.8],
                {
                    name: 'p3-tomapp3',
                    y: 12.8,
                    sliced: true,
                    selected: true
                },
                ['p3-tomapp5',    8.5],
                ['p3-tomapp2',     6.2],
                ['p3-tomapp4',   0.7]
            ]
        }]
    });

    $('#fourth-chart').highcharts('StockChart', {
        chart : {
            events : {
                load : function () {

                    // set up the updating of the chart each second
                    var series = this.series[0];
                    setInterval(function () {
                        var x = (new Date()).getTime(), // current time
                            y = Math.round(Math.random() * 100);
                        series.addPoint([x, y], true, true);
                    }, 1000);
                }
            }
        },

        rangeSelector: {
            buttons: [{
                count: 1,
                type: 'minute',
                text: '1M'
            }, {
                count: 5,
                type: 'minute',
                text: '5M'
            }, {
                type: 'all',
                text: 'All'
            }],
            inputEnabled: false,
            selected: 0
        },

        title : null,

        exporting: {
            enabled: false
        },

        series : [{
            name : 'No Of Events',
            data : (function () {
                // generate an array of random data
                var data = [], time = (new Date()).getTime(), i;

                for (i = -999; i <= 0; i += 1) {
                    data.push([
                        time + i * 1000,
                        Math.round(Math.random() * 100)
                    ]);
                }
                return data;
            }())
        }]
    });

    $('#config-sel').change(function() {
        sessionStorage['account'] = $(this).val();
        $engine.setContent('ACCOUNT');
    });
});
