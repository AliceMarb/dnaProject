import React, { useState, useRef, useEffect, useMemo } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import arrow from '../public/images/arrow-mid-blue-down-96x96.png';
import Switch from "react-switch";
import OutputBox from './OutputBox';
import DNABox from './DNABox';
import GCGraph from './GCGraph';
import NucleotideGraph from './NucleotideGraph';
import OutsideAlerter from './OutsideAlerter';
import bunny from '../public/images/bunny.gif';
import TransitionsTable from './TransitionsTable';
import { type } from 'jquery';


var areEqual = (prevProps, nextProps) => {
    for (var pair of Object.entries(prevProps.dependencies)) {
        if (typeof(pair[1]) == "object") {
            for (var i = 0; i < pair[1].length; i++) {
                if (pair[1][i] != nextProps.dependencies[pair[0]][i]){ return false;}
            }
        } else {
            if (pair[1] != nextProps.dependencies[pair[0]]) return false;
        }
    }
    return true;
}

const ReturnVal = React.memo((props) => {
    if (props.currHeader) {
        return props.displays[props.currHeader];
    }
    return <></>;
}, areEqual);

const OutputElementTemplate = (props) => {
    const listOpen = props.openDict[props.openName];
    var currHeader = props.selectedDisplays[props.openName][1];
    var currType = props.selectedDisplays[props.openName][0];

    const changeSelection = (event, option) => {
        props.setSelectedDisplay({ ...props.selectedDisplays, [props.openName]: [event.target.getAttribute("typename"), option] });
    }
    const currProcessJob = props.processJobDisplays[props.openName];
    // TO DO: INLCUDE THIS IN THE DEPENDENCIES FOR RETURNVAL SO IT CHANGES ON A DIFFERENT
    // ENCODING 
    const encode = currProcessJob["encode"];
    var listItems = [];

    var content = <ReturnVal currHeader={currHeader} dependencies={props.dependencies} displays={props.displays} currHeader={currHeader} />;

    const handleJobClick = (e, pair) => {
        const processJob = pair[0];
        const encode = pair[1];
        // if encoded -> decoded or decoded -> encoded, change the output element displayed
        props.setProcessJobDisplay({ ...props.processJobDisplays, [props.openName]: processJob });
        if (processJob["encode"] != encode) {
            if (processJob["encode"]) {
                // changing to encode, set to basic data
                props.setSelectedDisplay({ ...props.selectedDisplays, [props.openName]: ["Analytics", "Basic Data"] });
            } else {
                // changing to decode
                props.setSelectedDisplay({ ...props.selectedDisplays, [props.openName]: ["Analytics", "Decode Output"] });
            }
        }
    }
    var listofTypes = encode ? props.encodeTypes : props.decodeTypes;
    for (var selectionType of listofTypes) {
        var typeName = selectionType[0];
        var options = selectionType[1];

        var innerList = (
            <li key={typeName} className="dd-list-item">
                <h3 className="accordion-label">{typeName}</h3>
                <Dropdown>
                    <DropdownButton variant="dropdown" title={currType === typeName ? currHeader : ""}>
                        {options.map((option) => {
                            if (option == currHeader) return;
                            return (
                                <Dropdown.Item key={option} typename={typeName} onClick={(e) => changeSelection(e, option)}>
                                    {option}
                                </Dropdown.Item>
                            );
                        })}
                    </DropdownButton>
                </Dropdown>
            </li>
        );
        listItems.push(innerList);
    }

    return (
        <div className="relative">
            <div className="dd-wrapper">
                <div>
                    <div className="dd-header output-element-window-bar">
                        <div className="output-element-dropdown-container output-element-dropdown-trigger" onClick={() => { console.log("OPEN IT " + listOpen); props.setOpenDict({ ...props.openDict, [props.openName]: !listOpen }); }}>
                            <div className="header-arrow-container">
                                <div className="dd-header-title">{currHeader}</div>
                                <img className="arrow-dropdown" src={arrow} width="16" height="16"></img>
                            </div>
                            <div className="dd-header-title-job">{genProcessJobTitle(currProcessJob["name"], null, encode)}</div>
                        </div>
                    </div>
                    <div className={"my-output-dropdown-menu" + (listOpen ? " " : "-closed")}>
                        {listOpen &&
                            <OutsideAlerter
                                setOpenDict={props.setOpenDict} openDict={props.openDict}
                                openName={props.openName}
                            >
                                <ul className="dd-list">
                                    <li key="output-selection" className="dd-list-item">
                                        <h3 className="accordion-label">Processing Job</h3>
                                        <Dropdown>
                                            <DropdownButton variant="dropdown" title={genProcessJobTitle(currProcessJob["name"], currProcessJob["date"], encode)}>
                                                {props.history.map((processJob) => {
                                                    if (processJob["basicFileName"] == currProcessJob["basicFileName"]) return;
                                                    return (
                                                        <Dropdown.Item key={processJob["basicFileName"]} onClick={(e) => handleJobClick(e, [processJob, encode])}>
                                                            {genProcessJobTitle(processJob["name"], processJob["date"], processJob["encode"])}
                                                        </Dropdown.Item>
                                                    );
                                                })}
                                            </DropdownButton>
                                        </Dropdown>
                                    </li>
                                    {listItems}
                                </ul>
                            </OutsideAlerter>
                        }
                    </div>

                    <div className="output-element-content">
                        {props.loading && <img src={bunny} width="auto" height="auto" />}
                        {encode && !props.loading && content}
                        {!encode && !props.loading && content}
                    </div>
                </div>
                {/* </OutsideAlerter> */}
            </div>
        </div>

    );
}

const genProcessJobTitle = (currProcessJobName, date, encode) => {
    var returnString;
    if (date) {
        var currTime = new Date();
        var days = currTime.getDay() - date.getDay();
        var hours = currTime.getHours() - date.getHours();
        var currMins = currTime.getMinutes()
        var dateMins = date.getMinutes()
        var minutes =  currMins - dateMins;
        var time;
        if (days > 0) {
            time = days + " day" + (days == 1 ? "" : "s") + " ago";
        }
        else if (hours > 0) {
            // check if the hour has changed but fewer less than hours
            if (minutes < 0) {
                var difference = (60 - dateMins) + currMins;
                time = difference + " minute" + (difference == 1 ? "" : "s") + " ago";
            } else {
                time = hours + " hour" + (hours == 1 ? "" : "s") + " ago";
            }
        } else {
            time = minutes + " minute" + (minutes == 1 ? "" : "s") + " ago";
        }
        returnString = time + " "
    } else {
        returnString = ""
    }

    // var time = date.getHours() + ":" + date.getMinutes();
    return (encode ? "ENCODED: " : "DECODED: ") + returnString + currProcessJobName.slice(0, 50) + (currProcessJobName.length > 50 ? "..." : "");
    
}
// genProcessJobTitle("hello", new Date(2020, 10, 3, 17, 55))
export default OutputElementTemplate;
