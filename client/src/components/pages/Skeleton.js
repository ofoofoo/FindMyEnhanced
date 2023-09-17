import React, { useState, useEffect, createRef } from "react";

import "../../index.js";
import "../../utilities.css";
import "./Skeleton.css";

import {
  displayUserInteractionstimestamp,
  clearMarkers,
  clearHeatmap,
  clearallHeatmap,
} from "../../index.js";

//TODO: REPLACE WITH YOUR OWN CLIENT_ID
const GOOGLE_CLIENT_ID = "204415935913-be7cesbef5i942rtjct5j2fs71rvd7d0.apps.googleusercontent.com";

const Skeleton = ({ userName }) => {
  const [markShow, showMarkers] = useState(0);
  const [heatShow, showHeaters] = useState(0);
  const [heatallShow, showallHeaters] = useState(0);

  return (
    <div className="Skeleton-Container">
      <div className="Hi-text">
        <span>
          <span>
            Hi there
            {userName ? (
              <span>
                ,{" "}
                <span className="gradient-text">
                  {" "}
                  <span>{userName}</span>
                </span>
              </span>
            ) : (
              ""
            )}
          </span>
          !
        </span>
        
      </div>
      
      <div className="Info-text">
        {userName
          ? "Click on the map to log your current location!"
          : "Log in to log your location."}
      </div>
      <div className="Explanation">
  <div className="centered-content">
  <span className="mulish-font">
  As you walk around MIT's campus, login to <span style={{ color: 'red' }}>MIT Heat Map</span> and click on your location on the map.
  Whenever you go to another building, <span style={{ color: 'red' }}>click the new location</span> on the map.
  We track the time spent at each location and use it to display a heat map of where you spend most of your time on campus.
  We also display the path of where you've visited throughout the day.
</span>

  </div>
</div>


      <div className="Button-holder">
        {heatallShow ? (
          <button
            className="button-53"
            onClick={() => {
              clearallHeatmap();
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
              clearHeatmap();
              showHeaters(0);
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
                  clearallHeatmap();
                  showallHeaters(0);
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
