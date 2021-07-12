import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
  Redirect,
  useLocation,
} from "react-router-dom";
import "./404.css";

const NoMatch = () => {
  let location = useLocation();
  return (
    <div>
      <h3 className="locations">
        No match for <code>{location.pathname}</code>
        <br />
        Please Go to{" "}
        <button>
          <a href="/">Home</a>
        </button>
      </h3>
    </div>
  );
};

export default NoMatch;
