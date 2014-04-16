var config = require('./config'),
    $ = require('./jquery-2.1.0'),
    watcher = require('./watcher');

//var page = require('webpage').create(),
//    system = require('system'),
//    t, address;
//
//if (system.args.length === 1) {
//    console.log('Usage: loadspeed.js <some URL>');
//    phantom.exit();
//}
//
//t = Date.now();
//address = system.args[1];
//page.open(address, function(status) {
//    if (status !== 'success') {
//        console.log('FAIL to load the address');
//    } else {
//        t = Date.now() - t;
//        console.log('Loading time ' + t + ' msec');
//    }
//    phantom.exit();
//});
var watchers = [];
config.sections.forEach(function(section){
    section.departures.forEach(function(departure){
        section.destinations.forEach(function(destination){
            console.log(departure, destination, section.date);
            watchers.push(watcher.create(departure, destination, section.date));
        })
    })
})
$.when.apply($, watchers).done(function(){
    phantom.exit();
})


