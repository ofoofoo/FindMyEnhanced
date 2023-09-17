import React, { useState, useEffect } from "react";

import "../../index.js";
import "../../utilities.css";
import "./Skeleton.css";

import { displayUserInteractionstimestamp, clearMarkers, clearHeatmap } from "../../index.js";

//TODO: REPLACE WITH YOUR OWN CLIENT_ID
const GOOGLE_CLIENT_ID = "204415935913-be7cesbef5i942rtjct5j2fs71rvd7d0.apps.googleusercontent.com";

const Skeleton = ({ userName }) => {
  const [markShow, showMarkers] = useState(0);
  const [heatShow, showHeaters] = useState(0);
  const [heatallShow, showallHeaters] = useState(0);

  return (
    <div className="Skeleton-Container">
      <div className="Hi-text">
        Hi there<span className="gradient-text">{userName ? ", " + userName : ""}</span>!
      </div>
      <div className="Info-text">
        {userName
          ? "Click on the map to log your current location!"
          : "Log in to log your location."}
      </div>
      <div className="Button-holder">
        {heatallShow ? (
          <button
            className="button-53"
            onClick={() => {
              clearHeatmap();
              showallHeaters(0);
            }}
          >
            Hide Combined Heat Map
          </button>
        ) : (
          <button
            className="button-53"
            onClick={() => {
              getAllHeatMap();
              showallHeaters(1);
            }}
          >
            Show Combined Heat Map
          </button>
        )}
        {userName ? (
          <>
            {heatShow ? (
              <button
                className="button-53"
                onClick={() => {
                  clearHeatmap();
                  showHeaters(0);
                }}
              >
                Hide my Heat Map
              </button>
            ) : (
              <button
                className="button-53"
                onClick={() => {
                  getUserHeatMap();
                  showHeaters(1);
                }}
              >
                Show my Heat Map
              </button>
            )}
            {markShow ? (
              <button
                className="button-53"
                onClick={() => {
                  clearMarkers();
                  showMarkers(0);
                }}
              >
                Hide my Markers
              </button>
            ) : (
              <button
                className="button-53"
                onClick={() => {
                  displayUserInteractionstimestamp();
                  showMarkers(1);
                }}
              >
                Show my Markers
              </button>
            )}
          </>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default Skeleton;
