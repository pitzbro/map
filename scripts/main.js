'use strict'

// Global Map
var map;
var gCluster = L.markerClusterGroup({ removeOutsideVisibleBounds: false, maxClusterRadius: 80 });

var DISTANCE = 1000000;

function initMap() {
    console.log('initMap');

    // start the map in Israel
    var START_CENTER = { lng: 34.791462, lat: 31.252973 };

    // set up the map
    map = new L.Map('map');

    // create the tile layer with correct attribution
    var osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmAttrib = 'Map data © <a href="https://openstcontaineetmap.org">OpenStreetMap</a> contributors';
    //Mixed Content http vs https
    var cartoUrl = 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';
    var cartoAttrib = 'Map data &copy; OpenStreetMap contributors';

    var baseLayers = {
        OSM: L.tileLayer(osmUrl, { minZoom: 5, maxZoom: 18, attribution: osmAttrib }),
        DarkMap: L.tileLayer(cartoUrl, { minZoom: 5, maxZoom: 18, attribution: cartoAttrib })
    };
    var baseLayersCopy = {
        OSM: L.tileLayer(osmUrl, { minZoom: 0, maxZoom: 13, attribution: osmAttrib }),
        DarkMap: L.tileLayer(cartoUrl, { minZoom: 0, maxZoom: 13, attribution: cartoAttrib })
    };

    var osm = new L.TileLayer(osmUrl, { minZoom: 3, maxZoom: 19, attribution: osmAttrib });


    map.setView(new L.LatLng(START_CENTER.lat, START_CENTER.lng), 6);
    // map.addLayer(osm);
    map.addLayer(baseLayers.OSM);
    L.control.layers(baseLayers).addTo(map);

    //Plugin magic goes here! Note that you cannot use the same layer object again, as that will confuse the two map controls
    var miniMap = new L.Control.MiniMap(baseLayersCopy.OSM, { toggleDisplay: true }).addTo(map);

    map.on('baselayerchange', function (e) {
        miniMap.changeLayer(baseLayersCopy[e.name]);
    })

    var defaultLayer = L.tileLayer.provider('OpenStreetMap.Mapnik').addTo(map);

    var extraLayers = {
        'OpenStreetMap Default': defaultLayer,
        'OpenStreetMap German Style': L.tileLayer.provider('OpenStreetMap.DE'),
        'OpenStreetMap Black and White': L.tileLayer.provider('OpenStreetMap.BlackAndWhite'),
        'OpenStreetMap H.O.T.': L.tileLayer.provider('OpenStreetMap.HOT'),
        'Thunderforest OpenCycleMap': L.tileLayer.provider('Thunderforest.OpenCycleMap'),
        'Thunderforest Transport': L.tileLayer.provider('Thunderforest.Transport'),
        'Thunderforest Landscape': L.tileLayer.provider('Thunderforest.Landscape'),
        'Hydda Full': L.tileLayer.provider('Hydda.Full'),
        'Stamen Toner': L.tileLayer.provider('Stamen.Toner'),
        'Stamen Terrain': L.tileLayer.provider('Stamen.Terrain'),
        'Stamen Watercolor': L.tileLayer.provider('Stamen.Watercolor'),
        'Esri WorldStreetMap': L.tileLayer.provider('Esri.WorldStreetMap'),
        'Esri WorldTopoMap': L.tileLayer.provider('Esri.WorldTopoMap'),
        'Esri WorldImagery': L.tileLayer.provider('Esri.WorldImagery'),
        'Esri WorldTerrain': L.tileLayer.provider('Esri.WorldTerrain'),
        'Esri WorldShadedRelief': L.tileLayer.provider('Esri.WorldShadedRelief'),
        'Esri OceanBasemap': L.tileLayer.provider('Esri.OceanBasemap'),
        'Esri NatGeoWorldMap': L.tileLayer.provider('Esri.NatGeoWorldMap'),
        'Esri WorldGrayCanvas': L.tileLayer.provider('Esri.WorldGrayCanvas')
    };

    var overlayLayers = {};

    L.control.layers(extraLayers, overlayLayers, { collapsed: false }).addTo(map);

    // resize layers control to fit into view.
    function resizeLayerControl() {
        var layerControlHeight = document.body.clientHeight - (10 + 50);
        var layerControl = document.getElementsByClassName('leaflet-control-layers-expanded')[0];

        layerControl.style.overflowY = 'auto';
        layerControl.style.maxHeight = layerControlHeight + 'px';
    }
    map.on('resize', resizeLayerControl);
    resizeLayerControl();


    // map.on('zoom', arrangeCluster);

    // Set the zoom level to fit all markers
    // var group = new L.featureGroup(mapMarkers);
    // map.fitBounds(group.getBounds());

}

//sets icon visual preferences 
function createIcons(geoPoints) {

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
        marker.bindPopup('<img src="images/popupDevice.jpg">');
        marker.geoPointId = point.id;

        gCluster.addLayer(marker);

    });

    map.addLayer(gCluster);

}


function getLines(semiLinks, visiblePointsMap, semiPoints) {

    var lineOptions1 = { color: '#52ab00', weight: 1.5, opacity: 0.4, smoothFactor: 10, lineJoin: 'round' }
    var lineOptions2 = { color: '#52ab00', weight: 1.5, opacity: 0.4, smoothFactor: 10, lineJoin: 'round', dashArray: '5, 5' }

    //

    // adding lines of links
    var mapLines = semiLinks.reduce(function (acc, semiLink) {

        var fromPoint = semiPoints[semiLink.from]._latlng;
        var toPoint = semiPoints[semiLink.to]._latlng;

        //creating the line between the points
        var linkLine = new L.polyline([fromPoint, toPoint], lineOptions1);

        //find center link
        // var linkCenter = linkLine.getBounds().getCenter();
        // console.log('center of link:', linkCenter);

        //adding the link data
        linkLine.data = semiLink;
        // linkLine.center = linkCenter;
        acc.push(linkLine);
        return acc;
    }, []);


    // var linkAggIcon = L.divIcon({
    //     className: 'link-agg-el',
    //     html: '10/13'
    // });

    // mapLines.forEach(function (link) {
    //      var middleMarker = L.marker({ lat: link.center.lat, lng: link.center.lng }, { icon: linkAggIcon }).addTo(map);
    //      console.log('middle marker:',middleMarker )
         
    // });

    
    // adding link Agg

    // var linkCenter = line.getBounds().getCenter();
    // console.log('center of link:', linkLine.getBounds().getCenter());
    // var linkAggIcon = L.divIcon({
    //     className: 'link-agg-el',
    //     html: '10/13'
    // });

    // var linkAgg = new L.Marker(linkCenter, { icon: linkAggIcon });
    // linkAgg.data = 'data';
    // map.addLayer(linkAgg);
    // linkAgg.bindPopup('<img src="images/popupDevice.jpg">');
    // mapLinks.push(linkAgg);

    return mapLines;
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

function getPointsAndLinks() {
    // we are going to combine points and links so
    // that each point will "know" its connections

    // points data IRL will be fetched from server
    // here we create a random array
    var markersCount = document.getElementById('numPoints').value;
    var currCenter = map.getCenter();
    var geoPoints = getRandomGeoPointsNear(currCenter, DISTANCE, markersCount);
    // for each point, add an empty array of linked points ids
    // (where link direction is A -> B, we will add B to A.linkedGeoPointIds)
    // another important action is creating a map object of {id: point}
    var geoPointsMap = {};

    geoPoints.forEach(function (point) {
        point.linkedGeoPointIds = [];
        geoPointsMap[point.id] = point;
    });

    // links data IRL will be fetched from server
    // here we create a random array 
    var geoLinks = getGeoLinks(geoPoints);

    // now we fill the 'linkedGeoPointIds' array for each geoPoint
    createGeoPointsGraph(geoLinks, geoPointsMap);

    createIcons(geoPoints);

    drawLines(geoLinks);

    gCluster.on('animationend', function () { drawLines(geoLinks) });

}

function getGeoLinks(geoPoints) {

    var LINKS_MULTIPLE = 2;

    var geoLinks = getRandomLinks(geoPoints, LINKS_MULTIPLE);

    return geoLinks;
}

function createGeoPointsGraph(links, pointsMap) {

    links.forEach(function (link) {
        var fromId = link.from;
        var toId = link.to;
        var direction = link.direction;

        // default is bi-directional (as specified by client)
        switch (direction) {
            case 'OUT':
                pointsMap[fromId].linkedGeoPointIds.push(toId);
                break;
            case 'IN':
                pointsMap[toId].linkedGeoPointIds.push(fromId);
                break;
            case 'BOTH' || undefined:
                pointsMap[fromId].linkedGeoPointIds.push(toId);
                pointsMap[toId].linkedGeoPointIds.push(fromId);
                break;
            default:
                pointsMap[fromId].linkedGeoPointIds.push(toId);
                pointsMap[toId].linkedGeoPointIds.push(fromId);
                break;
        }
    })

}

function drawLines(links) {
console.log('gCluster:',gCluster);
    // before we create the lines we need to clear the old ones
    var oldLinesLayer = gCluster._nonPointGroup;
    oldLinesLayer.clearLayers();

    // first, get the current visible markers and/or clusters
    var semiPoints = gCluster._featureGroup._layers;

    // second, create a map object
    var visiblePointsMap = getVisiblePointsMap(semiPoints);

    // third, make a copy of the links but replace the 'from' and 'to':
    // instead of geoPointId we save the element`s _leaflet_id, so
    // the latlngs will be drawn from the elements` position on the map
    // console.log('links:', links);
    var semiLinks = links.map(function (link) {
        var semiLink = Object.assign({}, link) // TODO: replace es6 or bring polyfill
        semiLink.from = visiblePointsMap[link.from];
        semiLink.to = visiblePointsMap[link.to];
        return semiLink;
    })
        // fourth, we filter out the inner-cluster links
        .filter(function (link) {
            return link.to !== link.from
        })
    // console.log('semiLinks:', semiLinks);

    // fifth, create polylines
    var visibleLinks = getLines(semiLinks, visiblePointsMap, semiPoints);
    console.log('visibleLinks:', visibleLinks);

    // sixth, group the lines
    var linesLayer = new L.layerGroup(visibleLinks);

    // seventh, add this group to the cluster
    // they will be saved into _nonPointGroup
    linesLayer.addTo(gCluster);

}

function getVisiblePointsMap(semiPoints) {
    // for every geoPoint (id as the key) we want to get the representing visible marker / cluster (id as the value)
    var visiblePointsMap = {};

    // semiPoints IS AN OBJECT with leaflet ids as keys and DOM elements as values
    for (var llId in semiPoints) {

        var element = semiPoints[llId];

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

// console.log();