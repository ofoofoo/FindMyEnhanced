import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

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

  console.log("Lat, Lon : " + lat + ", " + lng);

  fetch("/api/addInteraction", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // building is hardcoded to Stud for now
    body: JSON.stringify({ lat, lng, building: "Stud" }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Interaction saved:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});
