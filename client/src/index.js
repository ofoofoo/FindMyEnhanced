import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import {
  getClosestBuilding,
  calculateTimeSpent,
  calculateHeatData,
  createCompleteHeatMap,
} from "./utils";
import "leaflet.heat";
import App from "./components/App.js";

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

// popup/undo shit
let loggedInteractions = [];

map.on("click", function (event) {
  var lat = event.latlng.lat;
  var lng = event.latlng.lng;
  fetch("/buildings.json")
    .then((response) => response.json())
    .then((data) => {
      const building = getClosestBuilding(lat, lng, 0.2, data);
      if (building === "None") {
        console.log("No building found");
        var popup1 = L.popup();
        popup1.setLatLng(event.latlng).setContent("No MIT buildings nearby!").openOn(map);
        return;
      }

      // undo button shit
      const popupContent = document.createElement("div");
      popupContent.innerHTML = `You've logged a visit at ${building} `;
      const undoButton = document.createElement("button");
      undoButton.innerHTML = "Undo";
      undoButton.id = "undoBtn";
      undoButton.addEventListener("click", undoLastInteraction);
      popupContent.appendChild(undoButton);

      var popup = L.popup();
      popup.setLatLng(event.latlng).setContent(popupContent).openOn(map);

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
          loggedInteractions.push(data._id);
          // getPath();
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    });
});

function undoLastInteraction() {
  const lastInteractionId = loggedInteractions.pop();

  if (!lastInteractionId) {
    console.log("No interactions to undo.");
    return;
  }

  fetch(`/api/remove-interaction/${lastInteractionId}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Interaction removed:", data);
      map.closePopup();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function getUserHeatMap() {
  fetch("/api/fetch-user-interactions")
    .then((response) => response.json())
    .then((interactions) => {
      fetch("/buildings.json")
        .then((response) => response.json())
        .then((buildings) => {
          const heatMapData = calculateHeatData(interactions, buildings);
          createHeatMap(heatMapData);
        });
    })
    .catch((err) => {
      console.error("Error fetching interactions:", err);
    });
}

function getAllHeatMap() {
  fetch("/api/fetch-users")
    .then((response) => response.json())
    .then((users) => {
      fetch("/api/fetch-all-interactions")
        .then((response) => response.json())
        .then((interactions) => {
          fetch("/buildings.json")
            .then((response) => response.json())
            .then((buildings) => {
              const heatMapData = createCompleteHeatMap(interactions, users, buildings);
              createallHeatMap(heatMapData);
            });
        });
    });
}

const markerGroup = L.layerGroup().addTo(map);
const heatmapGroup = L.layerGroup().addTo(map);
const heatallmapGroup = L.layerGroup().addTo(map);

export async function displayUserInteractionstimestamp() {
  try {
    const response = await fetch("/api/fetch-interactions-timestamp");
    const interactions = await response.json();
    interactions.sort((a, b) => a.timestamp - b.timestamp);

    let markerNumber = 1;
    let initialOpacity = 1.0;
    const opacityReductionRate = (1.0 - 0.1) / interactions.length;

    interactions.forEach((interaction) => {
      const { lat, lng } = interaction;

      const marker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: "numbered-marker", 
          html: `<span style="font-weight: bold; margin-left: -5px; margin-top: 5px;">${markerNumber}</span>`, 
        }),
      }).addTo(markerGroup);

      const lineCoordinates = [];
      lineCoordinates.push([lat, lng]);

      const opacity = initialOpacity;

      if (markerNumber > 1) {
        const previousInteraction = interactions[markerNumber - 2];
        const polyline = L.polyline(
          [
            [previousInteraction.lat, previousInteraction.lng],
            [lat, lng],
          ],
          { color: "blue", opacity: opacity }
        ).addTo(markerGroup);
      }

      marker._icon.querySelector("span").style.color = "red";
      markerNumber++;

      initialOpacity -= opacityReductionRate;
    });
  } catch (error) {
    console.error("Failed to fetch interactions: ", error);
  }
}

export function clearMarkers() {
  markerGroup.clearLayers();
}

async function displayUserInteractions() {
  try {
    const response = await fetch("/api/fetch-interactions-timestamp");
    const interactions = await response.json();
    const lineCoordinates = [];
    const dotIcon = L.divIcon({ className: "dot-icon" });

    interactions.forEach((interaction, index) => {
      const { lat, lng } = interaction;

      let markerText = ""; 

      if (index === 0) {
        markerText = "Start";
      } else if (index === interactions.length - 1) {
        markerText = "End";
      } else {
        markerText = (index + 1).toString(); // Use (index + 1) for intermediate interactions
      }

      // Create a marker with the markerText as HTML content
      const marker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: "numbered-marker", // Apply the custom CSS class
          html: `<span style="font-weight: bold;">${markerText}</span>`, // Bold the marker text directly in HTML
        }),
      }).addTo(map);

      lineCoordinates.push([lat, lng]);

      if (index > 0) {
        const previousInteraction = interactions[index - 1];
        const polyline = L.polyline(
          [
            [previousInteraction.lat, previousInteraction.lng],
            [lat, lng],
          ],
          { color: "blue" }
        ).addTo(map);
      }
    });

    if (lineCoordinates.length > 1) {
      const fullPolyline = L.polyline(lineCoordinates, { color: "red" }).addTo(map);
    }
  } catch (error) {
    console.error("Failed to fetch interactions: ", error);
  }
}

function createHeatMap(heatMapData) {
  L.heatLayer(heatMapData, {
    radius: 30,
    blur: 40,
    maxZoom: 15,
    useLocalExtrema: true,
  }).addTo(heatmapGroup);
}

function createallHeatMap(heatMapData) {
  L.heatLayer(heatMapData, {
    radius: 30,
    blur: 40,
    maxZoom: 15,
    useLocalExtrema: true,
  }).addTo(heatallmapGroup);
}

export function clearHeatmap() {
  heatmapGroup.clearLayers();
}

export function clearallHeatmap() {
  heatallmapGroup.clearLayers();
}

window.getUserHeatMap = getUserHeatMap;
window.getPath = displayUserInteractionstimestamp;
window.getAllHeatMap = getAllHeatMap;
