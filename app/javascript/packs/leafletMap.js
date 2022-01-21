import * as polylabel from "polylabel";
import { PIN_1_MAGIC_STRING, PIN_2_MAGIC_STRING } from "./constants";

let targetMarkerLayer;

let pinIcons = [
  L.divIcon({
    iconSize: null,
    html: "<div style='' class='pin-icon1'></div>",
  }),
  L.divIcon({
    iconSize: null,
    html: "<div style='' class='pin-icon2'></div>",
  }),
];

export let pins = [];

let layerControl;
/**
 * defines the floor that is currently displayed
 */
let currentFloor = 0;
/**
 * object that contains for each existing floor two layer groups, one for rooms and one for labels
 */
const floors = {};

export async function setupMap() {
  global.map = L.map("map");
  layerControl = L.control.layers({}, {}, { position: "topleft" }).addTo(map);
  // add a title to the leaflet layer control
  $("<h6>Floors</h6>").insertBefore("div.leaflet-control-layers-base");

  L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 22,
    maxNativeZoom: 19,
  }).addTo(map);

  const [view, buildingPolygons, buildingMarkers] = await Promise.all([
    getView(),
    getBuildings(),
    getBuildingMarkers(),
  ]);

  setView(view);
  addPolygons(buildingPolygons);
  addMarkers(buildingMarkers);

  // display indoor information eg. rooms, labels
  await loadGeoJsonFile("/assets/ABC-Building-0.geojson");
  await loadGeoJsonFile("/assets/ABC-Building-1.geojson");
  map.on("zoomend", recalculateTooltipVisibility);
  map.on("baselayerchange", (event) => {
    currentFloor = parseInt(event.name);
    recalculateTooltipVisibility();
  });

  // Add pins on click
  map.on("click", onClick);
}

function addPin(e, pinNumber) {
  pins[pinNumber] = L.marker(e.latlng, { icon: pinIcons[pinNumber] });
  pins[pinNumber].addTo(map);
  pins[pinNumber].on("click", function (e) {
    removePin(pinNumber);
  });
}

function removePin(pinNumber) {
  pins[pinNumber].remove();
  pins[pinNumber] = null;
}

function removeAllPins() {
  for (let i = 0; i < pins.length; i++) {
    removePin(i);
  }
}

function onClick(e) {
  if (!pins[0] || pins[0] === null) {
    addPin(e, 0);
  } else if (!pins[1] || pins[1] === null) {
    addPin(e, 1);
    $("#_overlay").addClass("open");
    $("#toggle-overlay").addClass("visible");
    $("#toggle-overlay").addClass("open");
    ajaxCall(
      null,
      "/route",
      `start=${PIN_1_MAGIC_STRING}&dest=${PIN_2_MAGIC_STRING}`
    );
  } else {
    removeAllPins();
  }
}

export function resetTargetMarkers() {
  if (targetMarkerLayer) targetMarkerLayer.clearLayers();
}

export function getUIPadding() {
  if (window.innerWidth > 750) {
    const width = $(".app-overlay-bottom").width();
    return [width, 0];
  } else {
    const height = $(".app-overlay-bottom").height();
    return [0, height];
  }
}

export function showTargetMarker(coordinates) {
  if (targetMarkerLayer) targetMarkerLayer.clearLayers();
  else targetMarkerLayer = L.layerGroup();
  const marker = {
    latlng: coordinates,
    divIcon: {
      html: "<img src='/assets/pin.png'>",
      className: "target-pin",
    },
  };
  const uiPadding = getUIPadding();
  addMarker(marker, targetMarkerLayer);
  targetMarkerLayer.addTo(map);
  map.fitBounds([coordinates], {
    paddingTopLeft: [uiPadding[0], 0],
    paddingBottomRight: [0, uiPadding[1]],
    duration: 0.5,
    animate: true,
  });
}

export function setView(view) {
  map.setView(view["latlng"], view["zoom"]);
}

export function addPolygons(polygons) {
  polygons.forEach((polygon) => {
    L.polygon(polygon["latlngs"], polygon["options"]).addTo(map);
  });
}

export function addMarkers(markers, layer = map) {
  markers.forEach((marker) => {
    addMarker(marker, layer);
  });
}

export function addMarker(marker, layer = map) {
  marker["divIcon"]["iconSize"] = [];
  marker["divIcon"]["iconAnchor"] = [0, 0];
  marker["divIcon"]["popupAnchor"] = [0, 0];
  const icon = L.divIcon(marker["divIcon"]);
  L.marker(marker["latlng"], { icon: icon }).addTo(layer);
}

export function addPolylines(polylines, layer = map) {
  polylines.forEach((polyline) => {
    addPolyline(polyline, layer);
  });
}

export function addPolyline(polyline, layer = map) {
  return L.polyline(polyline["latlngs"], polyline["options"]).addTo(layer);
}

export async function displayRoute(start, dest) {
  const route = await $.ajax({
    type: "GET",
    url: "/building_map/route",
    data: `start=${start}&dest=${dest}`,
    dataType: "json",
  });
  if (global.routeLayer) routeLayer.clearLayers();
  else global.routeLayer = L.layerGroup();
  const polyline = addPolyline(route["polyline"], routeLayer);
  addMarkers([route["marker"]], routeLayer);
  routeLayer.addTo(map);
  const uiPadding = getUIPadding();
  map.fitBounds(polyline.getBounds(), {
    paddingTopLeft: [uiPadding[0], 0],
    paddingBottomRight: [0, uiPadding[1]],
    animate: true,
    duration: 1,
  });
}

async function getBuildings() {
  return $.ajax({
    type: "GET",
    url: "/building_map/buildings",
    dataType: "json",
  });
}

async function getBuildingMarkers() {
  return $.ajax({
    type: "GET",
    url: "/building_map/markers",
    dataType: "json",
  });
}

async function getView() {
  return $.ajax({
    type: "GET",
    url: "/building_map/view",
    dataType: "json",
  });
}

function setupGeoJsonFeature(feature, layer) {
  const level = parseInt(feature.properties.level_name);

  if (isNaN(level)) {
    console.warn(
      "feature has no valid level name and will be skipped: ",
      feature.properties.level_name,
      feature
    );
    return;
  }

  if (!floors[level]) {
    floors[level] = { rooms: L.layerGroup(), labels: L.layerGroup() };
    const newLayer = L.layerGroup([floors[level].rooms, floors[level].labels]);
    layerControl.addBaseLayer(newLayer, feature.properties.level_name);
    // We add the current floor to the map here so that the map and layer control reference the same object
    // now the layer control will select the correct check box automatically
    if (level === currentFloor) {
      newLayer.addTo(map);
    }
  }

  floors[level].rooms.addLayer(layer);

  // find a position, create an invisible marker and bind a tooltip to it
  // we do not bind the tooltip to the room because you can only change the position of a tooltip by defining an offset
  // to the referenced object (you cannot give it a coordinate), we would need to determine an offset for each room

  // used for polylabel to estimate the visual center of a polygon that is inside of the polygon
  // lower value -> higher precision
  const markerPositionPrecision = 0.000001;
  const markerPosition = polylabel(
    feature.geometry.coordinates,
    markerPositionPrecision
  );

  const label = L.circleMarker(
    { lat: markerPosition[1], lng: markerPosition[0] },
    { opacity: 0, radius: 0, fill: false }
  ).bindTooltip(feature.properties.name, {
    permanent: true,
    direction: "center",
    className: "indoor-label",
  });

  floors[level].labels.addLayer(label);
  label.closeTooltip();
}

async function loadGeoJsonFile(filename) {
  const file = await fetch(filename);
  const geojsonFeatureCollection = await file.json();
  // the gejson files contain points for certain properties eg. doors, however we have not implemented the visualization of those and filter them here
  L.geoJSON(geojsonFeatureCollection, {
    onEachFeature: setupGeoJsonFeature,
    filter: (feature) => feature.geometry.type != "Point",
  });
}

function recalculateTooltipVisibility() {
  const zoomLevel = map.getZoom();
  if (zoomLevel >= 20) {
    floors[currentFloor].labels.eachLayer((layer) => layer.openTooltip());
  } else {
    floors[currentFloor].labels.eachLayer((layer) => layer.closeTooltip());
  }

  if (zoomLevel <= 17) {
    floors[currentFloor].rooms.removeFrom(map);
  } else {
    floors[currentFloor].rooms.addTo(map);
  }
}