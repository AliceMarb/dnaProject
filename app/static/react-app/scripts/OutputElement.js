import React, { useState, useRef, useEffect, useMemo } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import arrow from '../public/images/arrow-mid-blue-down-96x96.png';
import Switch from "react-switch";
import pic from '../public/images/webclip.png';
import OutputBox from './OutputBox';
import DNABox from './DNABox';
import GCGraph from './GCGraph';
import NucleotideGraph from './NucleotideGraph';
// import enhanceWithClickOutside from 'react-click-outside';

const OutputElement = (props) => {
    const listOpen = props.openDict[props.openName];
    const thisAnalytics = props.analytics[props.openName];
    const plot = props.plots[props.openName];
    const switches = [
        { name: "Some check" },
        { name: "Some other check" },
        { name: "Third check" },
        { name: "Fourth check" },
    ]
    // console.log(props.openName, thisAnalytics, plot);
    // console.log('outputelt mode' + props.mode);
    const analyticsOptions = ["Basic Data", "DNA Sequence"];
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
    const num = useMemo(() => Math.random() * 100, [thisAnalytics, plot]);
    const otherNum = Math.random() * 100;

    const getAnalyticsContent = () => {
        if (thisAnalytics === "Basic Data") {
            // analytics chosen
            // var num = Math.random() * 100;
            // const renderOutput = () => {
            return (<>
                <OutputBox
                    addressLength={props.addressLength}
                    synthesisLength={props.synthesisLength}
                    payloadTrits={props.payloadTrits}
                    mode={props.mode}
                    nucleotideContent={props.nucleotideContent}
                />
                {/* <div>{num}</div> */}
            </>);
            // };
            // var basicData = useMemo(() => renderOutput(), [thisAnalytics, props.mode]);
            // return (
            // {basicData}
            // );
        } else if (thisAnalytics === "DNA Sequence") {
            return (
                <>
                    <DNABox
                        loading={props.loading}
                        encodeHistory={props.encodeHistory}
                        putOutputInInput={props.putOutputInInput}
                    />
                    {/* <div>{num}</div> */}
                </>

            );
        }
    }
    const getPlotContent = () => {
        // var num = Math.random() * 100;
        if (plot == "GC Content Plot") {
            return (
                <>
                    {/* <div>{num}</div> */}
                    <GCGraph gcContent={props.gcContent} gcContentPath={props.gcContentPath} inputWidth={props.inputWidth} inputHeight={props.inputHeight} />  
                </>
            );
        }
        else {
            return (
                <>
                    {/* <div>{num}</div> */}
                    <NucleotideGraph
                        nucleotideContent={props.nucleotideContent}
                        inputWidth={500}
                        inputHeight={500}
                    />

                </>);
        }
    }
    var content;
    if (thisAnalytics) {
        content = useMemo(() => getAnalyticsContent(), [thisAnalytics, props.mode, props.loading]);
    } else {
        // content = useMemo(() => getPlotContent(), [plot, props.mode, props.nucleotideContent]);
        content = useMemo(() => getPlotContent(), [plot, props.loading]);
    }

    // const content = getContent();
    return (
        <div className="relative">
            <div className="dd-wrapper">
                <div className="dd-header output-element-window-bar">
                    <div className="output-element-dropdown-container output-element-dropdown-trigger" onClick={() => props.setOpenDict({ ...props.openDict, [props.openName]: !listOpen })}>
                        <div className="dd-header-title">Output Element</div>
                        <img src={arrow} width="16" height="16"></img>
                    </div>
                </div>
                <div className={"my-output-dropdown-menu" + (listOpen ? " " : "-closed")}>
                    {listOpen &&
                        <ul className="dd-list">
                            <li key="analytics" className="dd-list-item">
                                <h3 className="accordion-label">Analytics</h3>
                                <Dropdown>
                                    <DropdownButton variant="dropdown" title={thisAnalytics ? thisAnalytics : "    "}>
                                        {analyticsOptions.map((analyticsOption) => {
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
                    }
                </div>
            </div>
            {/* <img src={pic} /> */}
            <div className="output-element-content">
                {props.mode === "encode" && content}
            </div>
        </div>
    );
}

// export default enhanceWithClickOutside(OutputElement);
export default OutputElement;
