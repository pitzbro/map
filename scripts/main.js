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

    map.on('baselayerchange', function(e) {
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


//Default functionality
// _defaultIconCreateFunction: function (cluster) {
// 	var childCount = cluster.getChildCount();

// 	var c = ' marker-cluster-';
// 	if (childCount < 10) {
// 		c += 'small';
// 	} else if (childCount < 100) {
// 		c += 'medium';
// 	} else {
// 		c += 'large';
// 	}

// 	return new L.DivIcon({ html: '<div><span>' + childCount + '</span></div>', className: 'marker-cluster' + c, iconSize: new L.Point(40, 40) });
// },

// function test(cluster) {
//             var childCount = cluster.getChildCount();
// 		    var c = ' marker-cluster-';
//             if (childCount < 10) {
//                 c += 'small';
//             } else if (childCount < 100) {
//                 c += 'medium'; 
//             } else {
//                 c += 'large';
//             }
//             return new L.DivIcon({ html: '<div><span>' + childCount + '</span></div>', className: 'marker-cluster' + c, iconSize: new L.Point(40, 40) });
// }

function getPointsAndLinks() {
    // we are going to combine points and links so
    // that each point will "know" its connections
    var cluster = L.markerClusterGroup({
        removeOutsideVisibleBounds: false,
        maxClusterRadius: 80,
        iconCreateFunction: function(cluster) {
            var devices = cluster.getAllChildMarkers();
            var childCount = cluster.getChildCount();
            var maxSeverityLevels = getMaxSeverityLevel(devices);
            var c = ' marker-cluster-';


            if (childCount < 10) {
                c += 'small';
            } else if (childCount < 100) {
                c += 'medium';
            } else {
                c += 'large';
            }
            return new L.DivIcon({ html: '<div><span>' + childCount + '</span></div>', className: `marker-cluster status${maxSeverityLevels}`, iconSize: new L.Point(40, 40) });
        }
    });

    // marker-cluster ${c} 

    // points data IRL will be fetched from server 
    var geoPoints = myDevices;

    var currCenter = map.getCenter();

    var geoPointsMap = {};

    geoPoints.forEach(function(point) {
        point.linkedGeoPointIds = [];
        geoPointsMap[point.id] = point;
    });

    // links data IRL will be fetched from server
    var geoLinks = myLinks;


    createIcons(geoPoints, cluster);

    drawLines(geoLinks, cluster);

    cluster.on('animationend', function() { drawLines(geoLinks, cluster) });

}

//sets icon visual preferences 
function createIcons(geoPoints, cluster) {

    var LeafIcon = L.Icon.extend({
        options: {
            shadowUrl: 'images/shadow.png',
            iconSize: [45, 45], // size of the icon
            shadowSize: [50, 50], // size of the shadow
            iconAnchor: [22.5, 22.5], // point of the icon which will correspond to marker's location
            shadowAnchor: [23, 30], // the same for the shadow
            popupAnchor: [-7, -56] // point from which the popup should open relative to the iconAnchor
        }
    });

    geoPoints.forEach(function(point) {
        var pointll = new L.LatLng(point.lat, point.lon, true);
        var icon = getIcon(point.productType);
        var severityLevel = getstatusSeverityLevel(point.status);
        // var marker = new L.Marker(pointll, { icon: icon });
        var divIcon = new L.divIcon({ className: `myDivIcon status${severityLevel}`, html: icon });
        var marker = new L.Marker(pointll, { icon: divIcon });
        // marker.bindPopup(`<img src="images/popupDevice.jpg"><div>Device ID ${point.id}</div>`);
        console.log('point : ', point);
        marker.bindPopup(`<div class="popup-marker">
                            <ul style="list-style-type: none;>
                                <li class="title"><b>${point.name}</b></li>
                                <li><span class="key">IP address</span> : <span class="value">${point.id}</span></li>
                                <li><span class="key">Device type</span> : <span class="value">${point.id}</li>
                                <li><span class="key">Product type</span> : <span class="value">${point.productType}</li>
                                <li><span class="key">Administrative state</span> : <span class="value">${point.adminState}</li>
                                <li><span class="key">Operative state</span> : <span class="value">${point.operState}</li>
                            </ul>
                            <hr>
                            <div class="icon-container">
                             <div class="icon">${svgActionsIcons.add}</div>
                             <div class="icon">${svgActionsIcons.delete}</div>
                             <div class="icon">${svgActionsIcons.edit}</div>
                             <div class="icon">${svgActionsIcons.locked}</div>
                            </div>


                         </div>`);
        marker.geoPointId = point.id;
        marker.statusSeverityLevel = severityLevel;

        cluster.addLayer(marker);
    });
    map.addLayer(cluster);
}

function getstatusSeverityLevel(state) {
    let number;
    switch (state) {
        case 'OK':
            number = 0;
            break;
        case 'WARNING':
            number = 10;
            break;
        case 'ERROR':
            number = 20;
            break;
        default:
            number = 0;
    }
    return number;

}

function getIcon(productType) {
    let icon;
    switch (productType) {
        case 'SBC':
            icon = svgIcons.sbc;
            break;
        case 'GW':
            icon = svgIcons.gw;
            break;
        case 'UNKNOWN':
            icon = svgIcons.unknown;
            break;
        default:
            icon = svgIcons.unknown;
    }
    return icon;
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
        if (line.type === 'semi') {
            var linkLine = new L.polyline([fromPoint, toPoint], { color: '#52ab00', weight: 3, opacity: 0.5, smoothFactor: 10, lineJoin: 'round', dashArray: '0.01,4', className: lineStatus });
        } else {
            var linkLine = new L.polyline([fromPoint, toPoint], { color: '#52ab00', weight: 3, opacity: 0.55, smoothFactor: 10, lineJoin: 'round', className: lineStatus });
            // show agg for real links only!!!
            linkLine.bindTooltip(
                `<span>${line.innerLinks.length}</span>`, { permanent: true, interactive: true, className: lineStatus }
            );
        }

        // sorting inner links by status  severity
        line.innerLinks.sort((a, b) => {
            return b.statusSeverityLevel - a.statusSeverityLevel;
        });

        //adding the links popup
        var popupHtml = '';
        line.innerLinks.forEach(link => {
            popupHtml += `<div class="agg-link status${link.statusSeverityLevel}">Line ${link.id}</div>`
        })
        linkLine.bindPopup(`${popupHtml}`);

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
    var visibleLinks = links.reduce(function(acc, link) {

        var newLink = Object.assign({}, link); // TODO: replace es6 or bring polyfill

        newLink.from = visiblePointsMap[link.from];
        newLink.to = visiblePointsMap[link.to];

        // filtering out the inner-cluster links
        if (newLink.from === newLink.to) return acc;

        var min = Math.min(newLink.from, newLink.to);
        var max = Math.max(newLink.from, newLink.to);

        newLink.fromto = '' + min + '-' + max;

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

        if (!line) {
            line = { type: null, from: newLink.from, to: newLink.to, status: newLink.status, statusSeverityLevel: newLink.statusSeverityLevel, innerLinks: [newLink] };

            // visiblePoints is already a map object returned by leaflet!
            // given a leaflet_id (key) it returns an element (value).
            // if both to & from elements have a geoPointId
            // (meaning they are markers and not clusters) then it's a real link
            if (isNaN(visiblePoints[line.from].geoPointId) ||
                isNaN(visiblePoints[line.to].geoPointId)) {
                line.type = 'semi';
            } else line.type = 'real';
            acc[newLink.fromto] = line;
        } else {
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

function getMaxSeverityLevel(arr) {
    var maxSever;
    arr.forEach((item, index) => {
        if (index === 0) maxSever = item.statusSeverityLevel;
        if (item.statusSeverityLevel > maxSever) maxSever = item.statusSeverityLevel;
    })
    return maxSever;
}

function getVisiblePointsMap(points) {

    // for every geoPoint (id as the key) we want to get the representing visible marker / cluster (id as the value)
    var visiblePointsMap = {};

    // points IS AN OBJECT with leaflet ids as keys and DOM elements as values
    for (var llId in points) {

        var element = points[llId];

        // if it's a marker (and not a cluster) - set it's id as the value and the geoPointId as the key
        if (!isNaN(element.geoPointId) /* id could be zero */ ) {
            visiblePointsMap[element.geoPointId] = +llId;
        }
        // if it's a cluster - set it's id as the value for all it's geoPoints Ids (set them as keys)
        else {
            element.getAllChildMarkers().forEach(function(marker) {
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