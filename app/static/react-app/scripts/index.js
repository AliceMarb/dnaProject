import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import './style.css';
import 'd3';
import 'react-router-dom';
import logo from '../public/images/Kern_logo.png';
// import './kern-dna-synth.js';
import arrow from '../public/images/arrow-mid-blue-down-96x96.png';
import bunny from '../public/images/bunny.gif';

import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Collapsible from 'react-collapsible';
import "./app.scss";

ReactDOM.render(
    <div>
    <App/>
    </div>,

    document.getElementById("react-root")
);

