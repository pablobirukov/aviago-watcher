/**
 * Created by r00ger on 2/8/14.
 */

var pageURL = 'http://aviago.by',
    jQ = require('./jquery-2.1.0');

exports.create = function(departure, destination, date){
    var dfd = jQ.Deferred(),
        page = require('webpage').create(),
        logName = departure + '-' + destination;
    page.onLoadFinished = (function(status){
        var msg = logName + ' Success';
        if (status !== 'success') {
            console.log(logName + ' onLoad: status is not success');
            dfd.reject();
        }
        if (page.evaluate(function isSearchResult(){
            return location.href.indexOf('search_results') !== -1;
        })) {
            console.log(msg + '; Search_result');
        } else {
//            console.log(msg + '; Not search_result');
            return;
        }
        var checkerData = {timeout: 80000, interval: 2000};
        checkerData.intervalId = setInterval(function(){
            if (checkerData.timeout <= 0 ) {
                clearInterval(checkerData.intervalId);
                console.log(logName + ' Overtime. Not done!');
                dfd.reject();
                return;
            }
            checkerData.timeout -= checkerData.interval;
            var isPageReady = page.evaluate(function isSearchDone(){
                return window.$ && $('#nooffersFound').length && ($('#nooffersFound').is(':visible') || $('#searchResults').html());
            });
            if (isPageReady) {
                page.render( departure + '-' + destination + '-' + date + '.png');
                dfd.resolve();
                console.log(logName + ' Done!');
                clearInterval(checkerData.intervalId);
            }
        }, checkerData.interval);
    });
//    console.log('Trying to open: ' + pageURL);
    page.open(pageURL, function(status){
        console.log(logName + ' Start page loaded ' + status);

        var pageLoaderCheckerData = {
            interval: 2000,
            timeout: 20000
        }
        pageLoaderCheckerData.intervalId = setInterval(function(){
            if (pageLoaderCheckerData.timeout <= 0) {
                dfd.reject();
                console.log(logName + ' jQuery still not initialized ');
                clearInterval(pageLoaderCheckerData.intervalId);
                return;
            }
            pageLoaderCheckerData.timeout -= pageLoaderCheckerData.interval;
            if (page.evaluate(function(){return window.$ && window.$.toString();}) !== null) {
                page.evaluate(function(dept, dest, d) {
                    $('#journey-ow').click();
                    $('#iata\\[1\\]').val(' (' + dept + ')');
                    $('#iata\\[2\\]').val(' (' + dest + ')');
                    $('#depDate').val(d);
                    if (!$('#flexible').is(':checked')) {
                        $('#flexible').click();
                    }
                    $('#adults').val(2);
                    doFlightSearch('flightSearchForm');
                }, departure, destination, date);
                console.log(logName + ' Searching started');
                clearInterval(pageLoaderCheckerData.intervalId);
            };
        }, pageLoaderCheckerData.interval);

    });
    return dfd.promise();
}
