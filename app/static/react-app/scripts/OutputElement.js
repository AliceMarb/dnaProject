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

const OutputElement = (props) => {
    const listOpen = props.openDict[props.openName];
    const thisAnalytics = props.analytics[props.openName];
    const plot = props.plots[props.openName];
    const currProcessJob = props.processJobDisplays[props.openName];

    const switches = [
        { name: "Some check" },
        { name: "Some other check" },
        { name: "Third check" },
        { name: "Fourth check" },
    ]
    // console.log(props.openName, thisAnalytics, plot);
    // console.log('outputelt mode' + props.mode);
    const analyticsOptions = ["Basic Data", "DNA Sequence", "Transitions Table"];
    const plotOptions = ["GC Content Plot", "Nucleotide Content Plot"]
    const [checked, setChecked] = useState(
        switches.reduce((map, obj) => (map[obj.name] = false, map), {}));

    // const handleClickOutside = () => {
    //     console.log('click outside');
    //     props.setOpenDict({ ...props.openDict, [props.openName]: !listOpen });
    // }

    const handleCheck = (item) => {
        var namey = item.name;
        setChecked({ ...checked, [namey]: !checked[item.name] });
    }
    const handleAnalyticsClick = (analyticsOption) => {
        console.log(analyticsOption);
        props.setAnalytics({ ...props.analytics, [props.openName]: analyticsOption });
        props.setPlots({ ...props.plots, [props.openName]: "" });
    }
    const handlePlotsClick = (plotOption) => {
        console.log(plotOption);
        props.setPlots({ ...props.plots, [props.openName]: plotOption });
        props.setAnalytics({ ...props.analytics, [props.openName]: "" });
    }
    const handleJobClick = (processJob) => {
        console.log(processJob, thisAnalytics, plot);
        if (plot === "GC Content Plot") {
            if (!processJob["gcContent"]) {
                // we need to fetch the gc content
                return;
            }
        }
        props.setProcessJobDisplay({ ...props.processJobDisplays, [props.openName]: processJob });
    }

    const getAnalyticsContent = () => {
        var output;
        if (thisAnalytics === "Basic Data") {
            // analytics chosen
            // var num = Math.random() * 100;
            // const renderOutput = () => {
            output = (
                <OutputBox
                    addressLength={currProcessJob["metadataDict"]["addressLength"]}
                    payloadTrits={currProcessJob["metadataDict"]["payloadData"]}
                    mode={props.mode}
                    numSequences={currProcessJob["metadataDict"]["numSequences"]}
                    nucleotideContent={currProcessJob["metadataDict"]["nucleotideContent"]} />);
        } else if (thisAnalytics === "DNA Sequence") {
            output = (<DNABox
                loading={props.loading}
                preview={currProcessJob["preview"]}
                canDisplayFull={currProcessJob["canDisplayFull"]}
                putOutputInInput={props.putOutputInInput}
                getFasta={props.getFasta}
            />);
        } else if (thisAnalytics === "Transitions Table") {
            output = (<TransitionsTable transitions={currProcessJob["metadataDict"]["transitions"]} />);
        }
        return (<>{output}</>);
    }
    const getPlotContent = () => {
        if (plot === "GC Content Plot") {
            return (
                <GCGraph gcContent={currProcessJob["gcContent"]} gcContentPath={currProcessJob["metadataDict"]["gcContentPath"]}
                    inputWidth={props.inputWidth} inputHeight={props.inputHeight} />
            );
        }
        else {
            return (
                <NucleotideGraph
                    nucleotideContent={currProcessJob["metadataDict"]["nucleotideContent"]}
                    inputWidth={500}
                    inputHeight={500}
                />
            );
        }
    }
    var content;
    // console.log('mode! ' + props.mode);
    if (thisAnalytics) {
        content = useMemo(() => getAnalyticsContent(), [thisAnalytics, props.mode, props.loading, currProcessJob["name"]]);
    } else {
        // content = useMemo(() => getPlotContent(), [plot, props.mode, props.nucleotideContent]);
        content = useMemo(() => getPlotContent(), [plot, props.loading, currProcessJob["name"]]);
    }

    // const content = getContent();
    return (
        <div className="relative">
            <div className="dd-wrapper">
                <div className="dd-header output-element-window-bar">
                    <div className="output-element-dropdown-container output-element-dropdown-trigger" onClick={() => props.setOpenDict({ ...props.openDict, [props.openName]: !listOpen })}>
                        <div className="dd-header-title">{thisAnalytics ? thisAnalytics : plot}</div>
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
                                            {props.encodeHistory.map((processJob) => {
                                                return (
                                                    <Dropdown.Item key={processJob["basicFileName"]} onClick={() => handleJobClick(processJob)}>
                                                        {genProcessJobTitle(processJob["name"], processJob["date"])}
                                                    </Dropdown.Item>
                                                );
                                            })}
                                        </DropdownButton>
                                    </Dropdown>
                                </li>
                                <li key="analytics" className="dd-list-item">
                                    <h3 className="accordion-label">Analytics</h3>
                                    <Dropdown>
                                        <DropdownButton variant="dropdown" title={thisAnalytics ? thisAnalytics : "    "}>
                                            {analyticsOptions.map((analyticsOption) => {
                                                if (analyticsOption == thisAnalytics) return;
                                                return (
                                                    <Dropdown.Item key={analyticsOption} onClick={() => handleAnalyticsClick(analyticsOption)}>
                                                        {analyticsOption}
                                                    </Dropdown.Item>
                                                );
                                            })}
                                        </DropdownButton>
                                    </Dropdown>
                                </li>
                                <li key="charts" className="dd-list-item">
                                    <h3 className="accordion-label">Charts and Graphs</h3>
                                    <Dropdown>
                                        <DropdownButton variant="dropdown" title={plot ? plot : "    "}>
                                            {plotOptions.map((plotOption) => {
                                                if (plotOption == plot) return;
                                                return (
                                                    <Dropdown.Item key={plotOption} onClick={() => handlePlotsClick(plotOption)}>
                                                        {plotOption}
                                                    </Dropdown.Item>
                                                );
                                            })}
                                        </DropdownButton>
                                    </Dropdown>
                                </li>
                                {/* <li key="other" className="dd-list-item">
                                <h3 className="accordion-label">Output Element Settings</h3>
                                <div className='w-layout-grid output-settings-grid'>
                                    {switches.map((item) => {
                                        name = item.name;
                                        return (
                                            <div key={name + "container"} className="my-individual-parameter">
                                                <div className="togglebutton w-inline-block">
                                                    <Switch
                                                        key={name}
                                                        className="toggle-button-bg"
                                                        onChange={() => handleCheck(item)}
                                                        checked={checked[item.name]} />

                                                    <h3 className="toggle-setting-text output-toggle-text">{name}</h3>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </li> */}
                            </ul>
                        </OutsideAlerter>
                    }
                </div>


            </div>
            {/* <img src={pic} /> */}
            <div className="output-element-content">
                {props.loading && <img src={bunny} width="auto" height="auto" />}
                {props.mode === "encode" && !props.loading && content}
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
export default OutputElement;
