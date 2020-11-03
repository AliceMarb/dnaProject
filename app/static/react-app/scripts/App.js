import React from "react";
import EncodeDecodeContainer from "./EncodeDecodeContainer";
import OutputElement from "./OutputElement";
// import './kern-dna-synth.css';
// order of imports matters - style should override components
import './normalize.css';
import './components.css';
import './style.css';
// import image from '../public/images/Kern_logo.png';
import $ from 'jquery'; 
// import './kern-dna-synth.js';
import OutputElementTemplate from './OutputElementTemplate';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  NavLink
} from "react-router-dom";
import { Redirect } from 'react-router';

import { Nav } from "react-bootstrap";

const App = () => {
  return (
    <Router>
    <Redirect to="/master" />
      <div>
        <div data-collapse="small" data-animation="default" data-duration="400" role="banner" className="navigation w-nav">
          <div className="navigation-wrap">
            <div className="menu">
              <a href="/" aria-current="page" className="link-block w-inline-block w--current"></a>
              {/* <a href="#" class="nav-link w-nav-link">1.3</a> */}
              <nav role="navigation" className="nav-menu w-nav-menu">
                <div className="text-block-4">Version:</div>
                <NavLink to="/master" aria-current="page" activeClassName="active-route" className="nav-link w-nav-link nav-bar-master-link">Master</NavLink>
                <NavLink to="/dev" aria-current="page" activeClassName="active-route" className="nav-link w-nav-link nav-bar-master-link-2">Development</NavLink>
                <div className="text-block-4 nav-bar-link-3">1.3</div>
              </nav>
            </div>
          </div>
        </div>
        <Switch>
          <Route path="/dev">
            <OutputElement />
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