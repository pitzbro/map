function randomGeo(currCenter, radius) {
    console.log('currCenter:',currCenter)
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
    
    for (i = 0; i < count; i++) {

        var randGeo = randomGeo(center, radius);

        geoPoints.push({
            lat: randGeo.lat,
            lon: randGeo.lng,
            id: i,
            originalId: i,
            name: makeName(),
            filtered: true,
            marker: true,
            productType: "SBC",
            adminState: "UNLOCKED",
            operState: "AVAILABLE"
        })
    }
    console.log('geoPoints', geoPoints);
    return geoPoints;
}

function getRandomLinks(geoPoints, percent) {
    //add percentAggregated
    var geoLinks = [];
    var count = Math.floor(geoPoints.length * percent);
    function getPoint() {
        return geoPoints[Math.floor(Math.random() * geoPoints.length)];
    }
    for (var i = 0; i < count; i++) {

        var firstPoint = getPoint();
        var secondPoint = getPoint();
        while (secondPoint.id === firstPoint.id) {
            secondPoint = getPoint()
        }

        var newLink = {
            id: i,
            originalId: i,
            name: firstPoint.name + '-' + secondPoint.name,
            adminState: 'UNLOCKED',
            filtered: true,
            marker: false,
            connectionType: 'connection',
            from: firstPoint,
            to: secondPoint
        }
        geoLinks.push(newLink);

        // get 2 random points from geoPoints

        // console.log('creating the ', i, ' link');
    }
    return geoLinks;
}







// var geoPoints = [
//     {
//         x: 100,
//         y: 100,
//         lat: 31.046051,
//         lon: 34.851612,
//         id: 1,
//         originalId: 1,
//         name: 'A',
//         filtered: true,
//         marker: true,
//         productType: "SBC",
//         adminState: "UNLOCKED",
//         operState: "AVAILABLE"
//     },
//     {
//         x: 500,
//         y: 100,
//         lat: 40.712784,
//         lon: -74.005941,
//         id: 2,
//         name: 'B',
//         filtered: true,
//         marker: true,
//         originalId: 2,
//         productType: "GW",
//         adminState: "LOCKED",
//         operState: "AVAILABLE"
//     },
//     {
//         x: 300,
//         y: 300,
//         id: 3,
//         lat: 52.355518,
//         lon: -1.174320,
//         originalId: 3,
//         name: 'C',
//         filtered: false,
//         marker: false,
//         productType: "SBC",
//         adminState: "UNLOCKED",
//         operState: "AVAILABLE"
//     },
//     {
//         x: 200,
//         y: 500,
//         lat: 35.126413,
//         lon: 33.429859,
//         id: 4,
//         originalId: 4,
//         name: 'D',
//         filtered: false,
//         marker: false,
//         productType: "UNKNOWN",
//         adminState: "LOCKED",
//         operState: "AVAILABLE"
//     }   
// ]

// var geoLinks = [
//     {
//         id: 1,
//         name: 'A-B',
//         adminState: 'LOCKED',
//         filtered: true,
//         marker: true,
//         connectionType: 'connection',
//         originalId: 1,
//         from: 1,
//         to: 2
//     },
//     {
//         id: 2,
//         name: 'A-D',
//         adminState: 'UNLOCKED',
//         filtered: true,
//         marker: true,
//         connectionType: 'connection',
//         originalId: 2,
//         direction: 'IN',
//         from: 1,
//         to: 3
//     },
//     {
//         id: 3,
//         name: 'B-E',
//         adminState: 'LOCKED',
//         filtered: false,
//         marker: false,
//         connectionType: 'connection',
//         originalId: 3,
//         direction: 'OUT',
//         from: 1,
//         to: 4
//     },
//     {
//         id: 4,
//         name: 'D-E',
//         adminState: 'UNLOCKED',
//         filtered: false,
//         marker: false,
//         connectionType: 'connection',
//         originalId: 4,
//         direction: 'BOTH',
//         from: 4,
//         to: 2
//     },
//     {
//         id: 5,
//         name: 'C-A',
//         adminState: 'LOCKED',
//         filtered: true,
//         marker: true,
//         connectionType: 'connection',
//         direction: 'OUT',
//         originalId: 5,
//         from: 2,
//         to: 1
//     },
// ]


