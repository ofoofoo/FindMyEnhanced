import React, { useState, useEffect } from "react";
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from "@react-oauth/google";
import fetch from "node-fetch";

import "../../index.js";
import "../../utilities.css";
import "./Skeleton.css";

import { displayUserInteractionstimestamp, clearMarkers, clearHeatmap } from "../../index.js";

//TODO: REPLACE WITH YOUR OWN CLIENT_ID
const GOOGLE_CLIENT_ID = "204415935913-be7cesbef5i942rtjct5j2fs71rvd7d0.apps.googleusercontent.com";

const Skeleton = ({ userName }) => {
  const [markShow, showMarkers] = useState(0);
  const [heatShow, showHeaters] = useState(0);

  return (
    <div className="Skeleton-Container">
      <div className="Hi-text">Hi there{userName ? ", " + userName : ""}!</div>
      <div className="Info-text">
        {userName
          ? "Click on the map to log your location! Make sure to click closer to the center of the building you are in."
          : "Log in to Log your location."}
      </div>
      <div className="Button-holder">
        {userName ? (
          <>
            {markShow ? (
              <button
                className="button-53"
                onClick={() => {
                  clearHeatmap();
                  showMarkers(0);
                }}
              >
                Hide Heat Map
              </button>
            ) : (
              <button
                className="button-53"
                onClick={() => {
                  getUserHeatMap();
                  showMarkers(1);
                }}
              >
                Generate Heat Map
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
