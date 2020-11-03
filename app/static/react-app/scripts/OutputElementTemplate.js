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


var areEqual = (prevProps, newProps) => {
    for (var pair of Object.entries(prevProps.dependencies)) {
        if (pair[1] != newProps.dependencies[pair[0]]) return false;
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
    console.log('rerender template');
    const listOpen = props.openDict[props.openName];
    var currHeader = props.selectedDisplays[props.openName][1];
    var currType = props.selectedDisplays[props.openName][0];

    const changeSelection = (event, option) => {
        props.setSelectedDisplay({ ...props.selectedDisplays, [props.openName]: [event.target.getAttribute("typename"), option] });
    }
    const currProcessJob = props.processJobDisplays[props.openName];
    // boolean
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
    if (props.openName === "outputOpen1") {
        console.log('before? ' + listOpen);
    }
    // console.log(props.openDict);
    // console.log(props.openDict[props.openName]);
    // console.log(props.openName);
    return (
        <div className="relative">
            <div className="dd-wrapper">

                <div>
                    <div className="dd-header output-element-window-bar">
                        <div className="output-element-dropdown-container output-element-dropdown-trigger" onClick={() => { console.log("is list open? " + listOpen); props.setOpenDict({ ...props.openDict, [props.openName]: !listOpen }); }}>
                            <div className="header-arrow-container">
                                <div className="dd-header-title">{currHeader}</div>
                                <img src={arrow} width="16" height="16"></img>
                            </div>
                            <div className="dd-header-title-job">{genProcessJobTitle(currProcessJob["name"], null)}</div>
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
                                            <DropdownButton variant="dropdown" title={genProcessJobTitle(currProcessJob["name"], currProcessJob["date"])}>
                                                {props.history.map((processJob) => {
                                                    return (
                                                        <Dropdown.Item key={processJob["basicFileName"]} onClick={(e) => handleJobClick(e, [processJob, encode])}>
                                                            {genProcessJobTitle(processJob["name"], processJob["date"])}
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

const genProcessJobTitle = (currProcessJobName, date) => {
    var returnString;
    if (date) {
        var currTime = new Date();
        var hours = currTime.getHours() - date.getHours();
        var minutes = currTime.getMinutes() - date.getMinutes();
        var time;
        if (hours > 0) {
            if (hours == 1) time = hours + " hour ago";
            else time = hours + " hours ago";
        } else {
            if (minutes == 1) time = minutes + " minute ago";
            else time = minutes + " minutes ago";
        }
        returnString = time + " "
    } else {
        returnString = ""
    }

    // var time = date.getHours() + ":" + date.getMinutes();
    if (currProcessJobName.length > 50) {
        return returnString + currProcessJobName.slice(0, 50) + "...";
    } else {
        return returnString + currProcessJobName;
    }
}

export default OutputElementTemplate;
