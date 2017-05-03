'use strict'

function randomGeo(currCenter, radius) {

    var y0 = currCenter.lat;
    var x0 = currCenter.lng;
    var rd = radius / 111300;

    var u = Math.random();
    var v = Math.random();

    var w = rd * Math.sqrt(u);
    var t = 2 * Math.PI * v;
    var x = w * Math.cos(t);
    var y = w * Math.sin(t);

    return {
        lat: y + y0,
        lng: x + x0
    };
}

function makeName() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function getRandomGeoPointsNear(center, radius, count) {
    var geoPoints = [];
    
    for (var i = 0; i < count; i++) {

        var randGeo = randomGeo(center, radius);

        geoPoints.push({
            lat: randGeo.lat,
            lon: randGeo.lng,
            id: i,
            name: makeName(),
            filtered: true,
            marker: true,
            productType: "SBC",
            adminState: "UNLOCKED",
            operState: "AVAILABLE"
        })
    }
    // console.log('geoPoints', geoPoints);
    return geoPoints;
}

function getRandomValFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomLinks(geoPoints, percent) {
    //add percentAggregated
    var geoLinks = [];
    var count = Math.floor(geoPoints.length * percent);

    for (var i = 0; i < count; i++) {

        var firstPoint = getRandomValFrom(geoPoints);
        var secondPoint = getRandomValFrom(geoPoints);
        while (secondPoint.id === firstPoint.id) { // since we need 2 different points
            secondPoint = getRandomValFrom(geoPoints)
        }

        var newLink = {
            id: i,
            name: firstPoint.name + '-' + secondPoint.name,
            adminState: 'UNLOCKED',
            filtered: true,
            marker: false,
            connectionType: 'connection',
            from: firstPoint.id,
            to: secondPoint.id
        }
        geoLinks.push(newLink);

    }
    return geoLinks;
}