import React from "react";
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from "@react-oauth/google";
import fetch from "node-fetch";

import "../../utilities.css";
import "./Skeleton.css";

//TODO: REPLACE WITH YOUR OWN CLIENT_ID
const GOOGLE_CLIENT_ID = "204415935913-be7cesbef5i942rtjct5j2fs71rvd7d0.apps.googleusercontent.com";

const Skeleton = ({ userName }) => {
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
          <button className="button-53" onClick={() => {}}>
            Generate Heat Map
          </button>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default Skeleton;
