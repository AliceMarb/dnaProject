import React from "react";
import EncodeDecodeContainer from "./EncodeDecodeContainer";
import './style.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

const App = () => {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/dev">Development Branch</Link>
            </li>
            <li>
              <Link to="/master">Master Branch</Link>
            </li>
          </ul>
        </nav>
      <Switch>
        <Route path="/dev">
          <EncodeDecodeContainer />
        </Route>
        <Route path="/master">
          <EncodeDecodeContainer />
        </Route> 
      </Switch>
      </div>
    </Router>
  );
}

export default App;