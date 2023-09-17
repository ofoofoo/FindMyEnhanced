import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { getClosestBuilding, calculateTimeSpent, calculateHeatData } from "./utils";
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

// popup/undo shit
let loggedInteractions = [];

map.on("click", function (event) {
  var lat = event.latlng.lat;
  var lng = event.latlng.lng;
  fetch("/buildings.json")
    .then((response) => response.json())
    .then((data) => {
      const building = getClosestBuilding(lat, lng, 10, data);
      if (building === "None") {
        console.log("No building found");
        var popup1 = L.popup();
        popup1.setLatLng(event.latlng).setContent("No MIT buildings nearby!").openOn(map);
        return;
      }

      // undo button shit
      const popupContent = document.createElement('div');
      popupContent.innerHTML = `You've logged a visit at ${building} `;
      const undoButton = document.createElement('button');
      undoButton.innerHTML = 'Undo';
      undoButton.id = 'undoBtn';
      undoButton.addEventListener('click', undoLastInteraction);
      popupContent.appendChild(undoButton);

      var popup = L.popup();
      popup
        .setLatLng(event.latlng)
        .setContent(popupContent)
        .openOn(map);

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
    method: 'DELETE',
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Interaction removed:", data);
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

//const map = L.map('map').setView([0, 0], 2); // Set your initial map view
//L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
// Create a LayerGroup to hold your markers
const markerGroup = L.layerGroup().addTo(map);
const heatmapGroup = L.layerGroup().addTo(map);
// Call the clearMarkers function when you want to remove all markers
// For example, you can call it when a "Clear Markers" button is clicked.
// clearMarkers();

// Function to fetch and display user interactions on the map
export async function displayUserInteractionstimestamp() {
  try {
    // Fetch user interactions using your API endpoint
    const response = await fetch("/api/fetch-interactions-timestamp"); // Update the URL to your API endpoint
    const interactions = await response.json();
    interactions.sort((a, b) => a.timestamp - b.timestamp);

    // Iterate through interactions and add markers to the map
    interactions.forEach((interaction, index) => {
      const { lat, lng } = interaction;

      // Create a marker with a popup (you can customize the popup content)
      const marker = L.marker([lat, lng]).addTo(markerGroup);

      // You can add a popup with custom content if needed
      // marker.bindPopup(`Building: ${interaction.building}`).openPopup();

      const lineCoordinates = [];
      // Add the coordinates to the lineCoordinates array
      // marker.bindPopup(`Building: ${interaction.building}`).openPopup();
      lineCoordinates.push([lat, lng]);
      // Connect consecutive markers with lines (starting from the second marker)
      console.log(interactions);
      if (index > 0) {
        const previousInteraction = interactions[index - 1];
        const polyline = L.polyline(
          [
            [previousInteraction.lat, previousInteraction.lng],
            [lat, lng],
          ],
          { color: "blue", opacity: 0.5 } // Customize the line color
        ).addTo(markerGroup);
      }
    });
  } catch (error) {
    console.error("Failed to fetch interactions: ", error);
  }
}

export function clearMarkers() {
  markerGroup.clearLayers();
}

// Function to fetch and display user interactions on the map
async function displayUserInteractions() {
  try {
    // Fetch user interactions using your API endpoint
    const response = await fetch("/api/fetch-interactions-timestamp"); // Update the URL to your API endpoint
    const interactions = await response.json();

    // Create an array to store coordinates for drawing lines
    const lineCoordinates = [];

    // Iterate through interactions and add markers to the map
    interactions.forEach((interaction, index) => {
      const { lat, lng } = interaction;

      // Create a marker with a popup (you can customize the popup content)
      const marker = L.marker([lat, lng]).addTo(map);

      // Add the coordinates to the lineCoordinates array
      lineCoordinates.push([lat, lng]);

      // Connect consecutive markers with lines (starting from the second marker)
      console.log(interactions);
      if (index > 0) {
        const previousInteraction = interactions[index - 1];
        const polyline = L.polyline(
          [
            [previousInteraction.lat, previousInteraction.lng],
            [lat, lng],
          ],
          { color: "blue" } // Customize the line color
        ).addTo(map);
      }
    });

    // Create a polyline connecting all interactions
    if (lineCoordinates.length > 1) {
      const fullPolyline = L.polyline(lineCoordinates, { color: "red" }).addTo(map);
    }
  } catch (error) {
    console.error("Failed to fetch interactions: ", error);
  }
}

function createHeatMap(heatMapData) {
  L.heatLayer(heatMapData, {
    radius: 25,
    blur: 15,
  }).addTo(heatmapGroup);
}

export function clearHeatmap() {
  heatmapGroup.clearLayers();
}

window.getUserHeatMap = getUserHeatMap;
window.getPath = displayUserInteractionstimestamp;
