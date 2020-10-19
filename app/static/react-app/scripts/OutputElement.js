import React, { useState, useRef, useEffect, useMemo } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import arrow from '../public/images/arrow-mid-blue-down-96x96.png';
import Switch from "react-switch";
import pic from '../public/images/webclip.png';



const OutputElement = () => {
    const [listOpen, setOpen] = useState(true);
    const [analytics, setAnalytics] = useState("------");
    const [plot, setPlot] = useState("------");
    const switches = [
        { name: "Some check" },
        { name: "Some other check" },
        { name: "Third check" },
        { name: "Fourth check" },
    ]
    const [checked, setChecked] = useState(
        switches.reduce((map, obj) => (map[obj.name] = false, map), {}));
    // console.log(checked);

    const handleCheck = (item) => {
        var namey = item.name;
        // console.log('heres checked');
        // console.log(checked);
        setChecked({ ...checked, [namey]: !checked[item.name] });
    }
    return (
        <div className="relative">
            <div className="dd-wrapper">
                <div className="dd-header output-element-window-bar">
                    <div className="output-element-dropdown-container output-element-dropdown-trigger" onClick={() => setOpen(!listOpen)}>
                        <div className="dd-header-title">Output Element</div>
                        <img src={arrow} width="16" height="16"></img>
                    </div>
                </div>
                <div className={"my-output-dropdown-menu" + (listOpen ? " ": "-closed")}>
                    {listOpen &&
                        <ul className="dd-list">
                            <li key="analytics" className="dd-list-item">
                                <h3 className="accordion-label">Analytics</h3>
                                <Dropdown>
                                    <DropdownButton variant="dropdown" title={analytics}>
                                        <Dropdown.Item onClick={() => setAnalytics("Basic Data")}>Basic Data</Dropdown.Item>
                                        <Dropdown.Item onClick={() => setAnalytics("DNA Sequence")}>DNA Sequence</Dropdown.Item>
                                    </DropdownButton>

                                </Dropdown>
                            </li>
                            <li key="charts" className="dd-list-item">
                                <h3 className="accordion-label">Charts and Graphs</h3>
                                <Dropdown>
                                    <DropdownButton variant="dropdown" title={plot}>

                                        <Dropdown.Item onClick={() => setPlot("GC Content Plot")}>GC Content Plot</Dropdown.Item>
                                        <Dropdown.Item onClick={() => setPlot("Nucleotide Content Plot")}>Nucleotide Content Plot</Dropdown.Item>
                                    </DropdownButton>
                                </Dropdown>
                            </li>
                            <li key="other" className="dd-list-item">
                                <h3 className="accordion-label">Output Element Settings</h3>
                                <div className='w-layout-grid output-settings-grid'>
                                    {switches.map((item) => {
                                        name = item.name;
                                        {/* console.log(item); */ }
                                        {/* console.log(name, item.name); */ }
                                        return (
                                            <div key={name + "container"} className="my-individual-parameter">
                                                <h3 className="accordion-label toggle-setting-text output-toggle-text">{name}</h3>
                                                <Switch
                                                    key={name}
                                                    onChange={() => handleCheck(item)}
                                                    checked={checked[item.name]} />
                                            </div>);
                                    })}
                                </div>

                            </li>
                        </ul>
                    }
                </div>

            </div>
            <img src={pic} />
        </div>
    );
}

export default OutputElement;
