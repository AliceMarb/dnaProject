import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import './style.css';
import 'd3';
import 'react-router-dom';
import logo from '../public/images/Kern_logo.png';
import './kern-dna-synth.js';
import arrow from './arrow-mid-blue-down-96x96.png';




ReactDOM.render(
    <div>
    <div data-wf-page="5f75930fc0d90beb56126d0b" data-wf-site="5f73d7a77b558b1ab4efa2d9"/>
    {/* <img src={arrow}></img> */}
    {/* <img src={logo}></img> */}
    
    <App/>
    </div>,

    document.getElementById("react-root")
);

