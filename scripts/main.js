'use strict'

// Global Map
var map;

var DISTANCE = 5000000;

function initMap() {

    // start the map in USA
    var START_CENTER = { lat: 38.86316, lng: -95.673907 };

    // set up the map
    map = new L.Map('map');

    // create the tile layer with correct attribution
    var osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmAttrib = 'Map data © <a href="https://openstcontaineetmap.org">OpenStreetMap</a> contributors';
    //Mixed Content http vs https
    var cartoUrl = 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';
    var cartoAttrib = 'Map data &copy; OpenStreetMap contributors';

    // creating the base layers for the map and minimap
    var baseLayer = new L.tileLayer(cartoUrl, { minZoom: 2, maxZoom: 18, attribution: cartoAttrib });
    var miniMapBaseLayer = new L.tileLayer(cartoUrl, { minZoom: 0, maxZoom: 13, attribution: cartoAttrib });

    var osm = new L.TileLayer(osmUrl, { minZoom: 3, maxZoom: 19, attribution: osmAttrib });

    map.setView(new L.LatLng(START_CENTER.lat, START_CENTER.lng), 4);
    // map.addLayer(osm);
    map.addLayer(baseLayer);
    // L.control.layers(baseLayer).addTo(map);

    //Plugin magic goes here! Note that you cannot use the same layer object again, as that will confuse the two map controls
    var miniMap = new L.Control.MiniMap(miniMapBaseLayer).addTo(map);

    map.on('baselayerchange', function (e) {
        miniMap.changeLayer(miniMapBaseLayer);
    })

    // var defaultLayer = L.tileLayer.provider('OpenStreetMap.Mapnik').addTo(map);

    // var extraLayers = {
    //     'OpenStreetMap Default': defaultLayer,
    //     'OpenStreetMap German Style': L.tileLayer.provider('OpenStreetMap.DE'),
    //     'OpenStreetMap Black and White': L.tileLayer.provider('OpenStreetMap.BlackAndWhite'),
    //     'OpenStreetMap H.O.T.': L.tileLayer.provider('OpenStreetMap.HOT'),
    //     'Thunderforest OpenCycleMap': L.tileLayer.provider('Thunderforest.OpenCycleMap'),
    //     'Thunderforest Transport': L.tileLayer.provider('Thunderforest.Transport'),
    //     'Thunderforest Landscape': L.tileLayer.provider('Thunderforest.Landscape'),
    //     'Hydda Full': L.tileLayer.provider('Hydda.Full'),
    //     'Stamen Toner': L.tileLayer.provider('Stamen.Toner'),
    //     'Stamen Terrain': L.tileLayer.provider('Stamen.Terrain'),
    //     'Stamen Watercolor': L.tileLayer.provider('Stamen.Watercolor'),
    //     'Esri WorldStreetMap': L.tileLayer.provider('Esri.WorldStreetMap'),
    //     'Esri WorldTopoMap': L.tileLayer.provider('Esri.WorldTopoMap'),
    //     'Esri WorldImagery': L.tileLayer.provider('Esri.WorldImagery'),
    //     'Esri WorldTerrain': L.tileLayer.provider('Esri.WorldTerrain'),
    //     'Esri WorldShadedRelief': L.tileLayer.provider('Esri.WorldShadedRelief'),
    //     'Esri OceanBasemap': L.tileLayer.provider('Esri.OceanBasemap'),
    //     'Esri NatGeoWorldMap': L.tileLayer.provider('Esri.NatGeoWorldMap'),
    //     'Esri WorldGrayCanvas': L.tileLayer.provider('Esri.WorldGrayCanvas')
    // };

    // var overlayLayers = {};
    // L.control.layers(extraLayers, overlayLayers, { collapsed: false }).addTo(map);

    // resize layers control to fit into view.
    // function resizeLayerControl() {
    //     var layerControlHeight = document.body.clientHeight - (10 + 50);
    //     var layerControl = document.getElementsByClassName('leaflet-control-layers-expanded')[0];

    //     layerControl.style.overflowY = 'auto';
    //     layerControl.style.maxHeight = layerControlHeight + 'px';
    // }
    // map.on('resize', resizeLayerControl);
    // resizeLayerControl();

    // adding the demo devices and links
    // setTimeout(function() {
    // }, 0);

    if (map) map.on('load', getPointsAndLinks());
}

function getPointsAndLinks() {
    // we are going to combine points and links so
    // that each point will "know" its connections
    var cluster = L.markerClusterGroup({ removeOutsideVisibleBounds: false, maxClusterRadius: 80 });
    // points data IRL will be fetched from server
    // here we create a random array
    var markersCount = document.getElementById('numPoints').value;
    var currCenter = map.getCenter();
    // var geoPoints = getRandomGeoPointsNear(currCenter, DISTANCE, markersCount);
    var geoPoints = myDevices;
    // for each point, add an empty array of linked points ids
    // (where link direction is A -> B, we will add B to A.linkedGeoPointIds)
    // another important action is creating a map object of {id: point}
    var geoPointsMap = {};

    geoPoints.forEach(function (point) {
        point.linkedGeoPointIds = [];
        geoPointsMap[point.id] = point;
    });

    // links data IRL will be fetched from server
    var geoLinks = myLinks;


    createIcons(geoPoints, cluster);

    drawLines(geoLinks, cluster);

    cluster.on('animationend', function () { drawLines(geoLinks, cluster) });

}

//sets icon visual preferences 
function createIcons(geoPoints, cluster) {

    var LeafIcon = L.Icon.extend({
        options: {
            shadowUrl: 'images/shadow.png',
            iconSize: [45, 45], // size of the icon
            shadowSize: [50, 50], // size of the shadow
            iconAnchor: [22.5, 22.5], // point of the icon which will correspond to marker's location
            shadowAnchor: [23, 30],  // the same for the shadow
            popupAnchor: [-7, -56] // point from which the popup should open relative to the iconAnchor
        }
    });

    // icons
    var iconSBC = new LeafIcon({ iconUrl: 'images/sbc.png' });
    var iconGW = new LeafIcon({ iconUrl: 'images/gw.png' });
    var iconUnknown = new LeafIcon({ iconUrl: 'images/unknown.png' });

    geoPoints.forEach(function (point) {
        var pointll = new L.LatLng(point.lat, point.lon, true);
        var icon = null;
        switch (point.productType) {
            case 'SBC':
                icon = iconSBC;
                break;
            case 'GW':
                icon = iconGW;
                break;
            case 'UNKNOWN':
                icon = iconUnknown;
                break;
            default:
                icon = iconUnknown;
        }
        var marker = new L.Marker(pointll, { icon: icon });
        marker.bindPopup(`<img src="images/popupDevice.jpg"><div>Device ID ${point.id}</div>`);
        marker.geoPointId = point.id;

        cluster.addLayer(marker);
    });
    map.addLayer(cluster);
    console.log('cluster is ', cluster);

}

function getLines(visibleLinks, visiblePoints) {

    var lineStatus = '';
    var lines = [];

    // fromto is a key
    for (var fromto in visibleLinks) {
        var line = visibleLinks[fromto];

        lineStatus = 'status' + line.statusSeverityLevel;

        // getting coordinates
        var fromPoint = visiblePoints[line.from]._latlng;
        var toPoint = visiblePoints[line.to]._latlng;

        //creating the line between the points
        if (line.type === 'semi') var linkLine = new L.polyline([fromPoint, toPoint],
            { color: '#52ab00', weight: 3, opacity: 0.5, smoothFactor: 10, lineJoin: 'round', dashArray: '0.01,4', className: lineStatus }
        );
        else {
            var linkLine = new L.polyline([fromPoint, toPoint],
                { color: '#52ab00', weight: 3, opacity: 0.55, smoothFactor: 10, lineJoin: 'round', className: lineStatus }
            );
            // show agg for real links only!!!
            linkLine.bindTooltip(
                `<span onclick="console.log('hello ${line.innerLinks.length}')">${line.innerLinks.length}</span>`,
                { permanent: true, interactive: true, className: lineStatus }
            );
            // console.log('line =', line)
            var popupHtml = '';
            line.innerLinks.forEach(link => popupHtml += `<div>Line ${link.id}</div>`)
            linkLine.bindPopup(`${popupHtml}`);
        }

        lines.push(linkLine);
    }

    return lines;
}

function drawLines(links, cluster) {

    // first, we create the lines we need to clear the old ones
    var oldLinesLayer = cluster._nonPointGroup;
    oldLinesLayer.clearLayers();

    // second, get the current visible markers and/or clusters
    var visiblePoints = cluster._featureGroup._layers;

    // third, create a map object
    var visiblePointsMap = getVisiblePointsMap(visiblePoints);
    // fourth, make a copy of the links but replace the 'from' and 'to':
    // instead of geoPointId we save the element`s _leaflet_id, so
    // the latlngs will be drawn from the elements` position on the map
    var visibleLinks = links.reduce(function (acc, link) {

        var newLink = Object.assign({}, link); // TODO: replace es6 or bring polyfill

        newLink.from = visiblePointsMap[link.from];
        newLink.to = visiblePointsMap[link.to];

        // filtering out the inner-cluster links
        if (newLink.from === newLink.to) return acc;
        // console.log('acc:', acc);
        var min = Math.min(newLink.from, newLink.to);
        var max = Math.max(newLink.from, newLink.to);

        newLink.fromto = '' + min + '-' + max;
        // console.log('newLink.fromto:', newLink.fromto);

        switch (newLink.status) {
            case 'OK':
                newLink.statusSeverityLevel = '0';
                break;
            case 'WARNING':
                newLink.statusSeverityLevel = '10';
                break;
            case 'ERROR':
                newLink.statusSeverityLevel = '20';
                break;
            default:
                newLink.statusSeverityLevel = '0';
                break;
        }

        var line = acc[newLink.fromto];
        // console.log('link', newLink)
        if (!line) {
            line = { type: null, from: newLink.from, to: newLink.to, status: newLink.status, statusSeverityLevel: newLink.statusSeverityLevel, innerLinks: [newLink] };

            // visiblePoints is already a map object returned by leaflet!
            // given a leaflet_id (key) it returns an element (value).
            // if both to & from elements have a geoPointId
            // (meaning they are markers and not clusters) then it's a real link
            if (isNaN(visiblePoints[line.from].geoPointId) ||
                isNaN(visiblePoints[line.to].geoPointId)) {
                line.type = 'semi';
            }
            else line.type = 'real';
            acc[newLink.fromto] = line;
        }
        else {
            line.innerLinks.forEach(link => {
                if (link.statusSeverityLevel > line.statusSeverityLevel) {
                    line.status = link.status;
                    line.statusSeverityLevel = link.statusSeverityLevel
                }
            })
            line.innerLinks.push(newLink);
        }

        return acc;
    }, {});

    // fifth, create polylines
    var lines = getLines(visibleLinks, visiblePoints);

    // sixth, group the lines
    var linesLayer = new L.layerGroup(lines);

    // seventh, add this group to the cluster
    // they will be saved into _nonPointGroup
    linesLayer.addTo(cluster);
}

function getVisiblePointsMap(points) {

    // for every geoPoint (id as the key) we want to get the representing visible marker / cluster (id as the value)
    var visiblePointsMap = {};

    // points IS AN OBJECT with leaflet ids as keys and DOM elements as values
    for (var llId in points) {
        // debugger;
        console.log("LLID :", llId);

        var element = points[llId];

        // if it's a marker (and not a cluster) - set it's id as the value and the geoPointId as the key
        if (!isNaN(element.geoPointId) /* id could be zero */) {
            visiblePointsMap[element.geoPointId] = +llId;
        }
        // if it's a cluster - set it's id as the value for all it's geoPoints Ids (set them as keys)
        else {
            element.getAllChildMarkers().forEach(function (marker) {
                visiblePointsMap[marker.geoPointId] = +llId;
            })
        }
    }

    return visiblePointsMap;
}


// function drawCenterMarker(mapLinks) {
//     var linkAggIcon = L.divIcon({
//         className: 'link-agg-el',
//         html: '10/13'
//     });

//     mapLinks.forEach(function(link) {
//       L.marker({ lat: link.center.lat, lng: link.center.lng }, { icon: linkAggIcon }).addTo(map);
//     });

// }