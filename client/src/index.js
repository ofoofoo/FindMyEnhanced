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
      var popup = L.popup();
      popup
        .setLatLng(event.latlng)
        .setContent(
          "You've logged a visit at " +
            building +
            " (" +
            lat.toFixed(7) +
            ", " +
            lng.toFixed(7) +
            ")"
        )
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
          getPath();
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    });
});

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

// Function to fetch and display user interactions on the map
async function displayUserInteractionstimestamp() {
  try {
    // Fetch user interactions using your API endpoint
    const response = await fetch("/api/fetch-interactions-timestamp"); // Update the URL to your API endpoint
    const interactions = await response.json();

    // Iterate through interactions and add markers to the map
    interactions.forEach((interaction) => {
      const { lat, lng } = interaction;

      // Create a marker with a popup (you can customize the popup content)
      const marker = L.marker([lat, lng]).addTo(map);

      // You can add a popup with custom content if needed
      // marker.bindPopup(`Building: ${interaction.building}`).openPopup();
    });
  } catch (error) {
    console.error("Failed to fetch interactions: ", error);
  }
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

// Call the function to display user interactions on the map

// function getAllHeatMap() {
//   fetch("/api/fetch-all-interactions")
//     .then((response) => response.json())
//     .then((data) => {
//       createHeatMap(data);
//     })
//     .catch((err) => {
//       console.error("Error fetching interactions:", err);
//     })
// }

function createHeatMap(heatMapData) {
  L.heatLayer(heatMapData, {
    radius: 25,
    blur: 15,
  }).addTo(map);
}

window.getPath = displayUserInteractionstimestamp;
