'use strict'

// Global Map
var map;

var DISTANCE = 10000;

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
        var marker = new L.Marker( pointll, { icon: icon } );
        marker.bindPopup('<img src="images/popupDevice.jpg">');
        marker.geoPointId = point.id;

        cluster.addLayer(marker);

    });

    map.addLayer(cluster);

}


function getLines(visibleLinks, visiblePoints) {

    // console.log('visibleLinks:', visibleLinks);

    var lineOptions1 = { color: '#52ab00', weight: 3, opacity: 0.4, smoothFactor: 10, lineJoin: 'round' }
    var lineOptions2 = { color: '#52ab00', weight: 1, opacity: 0.4, smoothFactor: 10, lineJoin: 'round'/*, dashArray:'5, 5'*/ }
    
    // adding lines of links

    function reduceToLines (links, points, options) {
        // console.log('points:', points);
        // console.log('links:', links);

        if (links.length === 0) return [];

        return links.reduce( function(acc, link) {

            var fromPoint = points[link.from]._latlng;
            var toPoint = points[link.to]._latlng;
            
            //creating the line between the points
            var linkLine = new L.polyline([fromPoint, toPoint], options);
            //adding the link data
            linkLine.data = link;
            
            acc.push(linkLine);
            return acc;
        }, [])    
    }

    var realLines = reduceToLines(visibleLinks.realLinks, visiblePoints, lineOptions1);
    var semiLines = reduceToLines(visibleLinks.semiLinks, visiblePoints, lineOptions2);
    // here NOA will insert aggregation markers and assign popups only for realLines

    return [...realLines, ...semiLines];


    // adding link Agg

    // console.log('center of link:', line.getBounds().getCenter());
    // var linkCenter = line.getBounds().getCenter();

    // var linkAggIcon = L.divIcon({
    //     className: 'link-agg-el',
    //     html: '10/13'
    // });

    // var linkAgg = new L.Marker(linkCenter, { icon: linkAggIcon });
    // linkAgg.data = 'data';
    // map.addLayer(linkAgg);
    // linkAgg.bindPopup('<img src="images/popupDevice.jpg">');
    // mapLinks.push(linkAgg);

}

function getPointsAndLinks() {
    // we are going to combine points and links so
    // that each point will "know" its connections
    var cluster = L.markerClusterGroup({removeOutsideVisibleBounds: false, maxClusterRadius: 80});
    // points data IRL will be fetched from server
    // here we create a random array
    var markersCount = document.getElementById('numPoints').value;
    var currCenter = map.getCenter();
    var geoPoints = getRandomGeoPointsNear(currCenter, DISTANCE, markersCount);
    // for each point, add an empty array of linked points ids
    // (where link direction is A -> B, we will add B to A.linkedGeoPointIds)
    // another important action is creating a map object of {id: point}
    var geoPointsMap = {};

    geoPoints.forEach(function(point){
        point.linkedGeoPointIds = [];
        geoPointsMap[point.id] = point;
    });

    // links data IRL will be fetched from server
    // here we create a random array 
    var geoLinks = getGeoLinks(geoPoints);

    // now we fill the 'linkedGeoPointIds' array for each geoPoint
    createGeoPointsGraph(geoLinks, geoPointsMap);

    createIcons(geoPoints, cluster);

    drawLines(geoLinks, cluster);

    cluster.on('animationend', function () {drawLines(geoLinks, cluster)});

}

function getGeoLinks(geoPoints) {

    var LINKS_MULTIPLE = 2;

    var geoLinks = getRandomLinks(geoPoints, LINKS_MULTIPLE);

    return geoLinks;
}

function createGeoPointsGraph (links, pointsMap) {

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

function drawLines(links, cluster) {
    
    // first, we create the lines we need to clear the old ones
    var oldLinesLayer = cluster._nonPointGroup;
    oldLinesLayer.clearLayers();
    
    // second, get the current visible markers and/or clusters
    var semiPoints = cluster._featureGroup._layers;

    // third, create a map object
    var visiblePointsMap = getVisiblePointsMap(semiPoints);

    // fourth, make a copy of the links but replace the 'from' and 'to':
    // instead of geoPointId we save the element`s _leaflet_id, so
    // the latlngs will be drawn from the elements` position on the map
    var visibleLinks = links.reduce(function (acc, link) {
        var newLink = Object.assign({},link) // TODO: replace es6 or bring polyfill
        newLink.from = visiblePointsMap[link.from];
        newLink.to = visiblePointsMap[link.to];

        // filtering out the inner-cluster links
        if (newLink.from === newLink.to) return acc;

        // semiPoints is already a map object returned by leaflet!
        // given a leaflet_id (key) it returns an element (value).
        // if both to & from elements have a geoPointId
        // (meaning they are markers and not clusters) then it's a real link
        if (    isNaN( semiPoints[newLink.from].geoPointId ) ||
                isNaN( semiPoints[newLink.to].geoPointId )    ) {
                    acc.semiLinks.push(newLink)
        }
        else acc.realLinks.push(newLink);

        return acc;
    },{realLinks: [], semiLinks: []} );

    // console.log('semiLinks:', visibleLinks);

    // fifth, create polylines
    var lines = getLines(visibleLinks, semiPoints);
    // console.log('visibleLinks:', visibleLinks);

    // sixth, group the lines
    var linesLayer = new L.layerGroup(lines);

    // seventh, add this group to the cluster
    // they will be saved into _nonPointGroup
    linesLayer.addTo(cluster);
    
}

function getVisiblePointsMap (points) {
    // for every geoPoint (id as the key) we want to get the representing visible marker / cluster (id as the value)
    var visiblePointsMap = {};

    // points IS AN OBJECT with leaflet ids as keys and DOM elements as values
    for (var llId in points) {

        var element = points[llId];

        // if it's a marker (and not a cluster) - set it's id as the value and the geoPointId as the key
        if ( !isNaN (element.geoPointId) /* id could be zero */ ) {
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
