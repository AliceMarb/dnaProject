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
    return props.displays[props.currHeader];
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
    var listItems = [];

    var content = <ReturnVal dependencies={props.dependencies} displays={props.displays} currHeader={currHeader} />;

    const handleJobClick = (processJob) => {
        if (plot === "GC Content Plot") {
            if (!processJob["gcContent"]) {
                // we need to fetch the gc content
                return;
            }
        }
        props.setProcessJobDisplay({ ...props.processJobDisplays, [props.openName]: processJob });
    }
    for (var selectionType of props.types) {
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
                <div className="dd-header output-element-window-bar">
                    <div className="output-element-dropdown-container output-element-dropdown-trigger" onClick={() => props.setOpenDict({ ...props.openDict, [props.openName]: !listOpen })}>
                        <div className="dd-header-title">{currHeader}</div>
                        <img src={arrow} width="16" height="16"></img>
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
                                                    <Dropdown.Item key={processJob["basicFileName"]} onClick={() => handleJobClick(processJob)}>
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
                    {props.mode === "encode" && !props.loading && content}
                </div>
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
