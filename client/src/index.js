import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { getClosestBuilding } from "./utils";
import "leaflet.heat";

import App from "./components/App.js";

// renders React Component "Root" into the DOM element with ID "root"
const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// allows for live updating
module.hot.accept();

var map = L.map("map").setView([42.360001, -71.092003], 15);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

map.on("click", function (event) {
  var lat = event.latlng.lat;
  var lng = event.latlng.lng;
  var popup = L.popup();
  popup
    .setLatLng(event.latlng)
    .setContent("You've logged a visit at " + event.latlng.toString())
    .openOn(map);
  //alert("You clicked the map at " + lat + ", " + lng);

  fetch("/buildings.json")
    .then((response) => response.json())
    .then((data) => {
      const building = getClosestBuilding(lat, lng, 10, data);
      if (building === "None") {
        console.log("No building found");
        return;
      }

      console.log("Lat:", lat, "Lng:", lng, "Building:", building);

      fetch("/api/add-interaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lat, lng, building }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Interaction saved:", data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    });
});

function getHeatMap() {
  fetch("/api/fetch-interactions")
    .then((response) => response.json())
    .then((data) => {
      createHeatMap(data);
    })
    .catch((err) => {
      console.error("Error fetching interactions:", err);
    });
}

function createHeatMap(interactions) {
  const heatData = interactions.map((interaction) => {
    return [interaction.lat, interaction.lng];
  });

  const heat = L.heatLayer(heatData, {
    radius: 25,
    blur: 15,
  }).addTo(map);
}

window.getHeatMap = getHeatMap;