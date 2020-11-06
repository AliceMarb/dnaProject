import React from 'react';
import moveInArrow from './icon_collapse_menu_black.png'
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';

const Panel = (props) => {
    const lowerCaseTitle = (props.activeToggle.charAt(0).toLowerCase() + props.activeToggle.slice(1));
    const classAdditionalName = lowerCaseTitle + "-panel";
    const panelTitleClass = classAdditionalName + "-title-text";
    const openTracker = props.panelBlockOpenTracker[props.activeToggle];
    var inputSourceDropdown = <InputSourceDropdown panelTitle={props.activeToggle} panelBlockOpenTracker={props.panelBlockOpenTracker} openTracker={openTracker} setPanelBlockOpenTracker={props.setPanelBlockOpenTracker} />;
    var basicParamsDropdown = <BasicParamsDropdown panelTitle={props.activeToggle} panelBlockOpenTracker={props.panelBlockOpenTracker} openTracker={openTracker} setPanelBlockOpenTracker={props.setPanelBlockOpenTracker} />;
    var advancedParamsDropdown = <AdvancedParamsDropdown panelTitle={props.activeToggle} panelBlockOpenTracker={props.panelBlockOpenTracker} openTracker={openTracker} setPanelBlockOpenTracker={props.setPanelBlockOpenTracker} />;
    return (
        <div className={"side-panel " + classAdditionalName}>
            <div className="side-panel-header">
                <div className={"panel-title-text " + panelTitleClass}>
                    <div>{props.activeToggle}</div>
                    <div className="panel-collapse-button">
                        <img src={moveInArrow} className="move-in-arrow" alt="Collapse right arrow" onClick={() => props.setShowPanel(false)} />
                    </div>
                </div>
                <div className="side-panel-top-buttons">
                    <Button variant="top-panel-button w-button">
                        Review
                    </Button>
                    <Button variant="action-submit-button w-button">
                        {props.activeToggle === "Encoder" ? "Encode Input into DNA" :
                            (props.activeToggle === "Decoder" ? "Decode DNA Sequence" : "Analyze DNA data")}
                    </Button>
                    <Button variant="top-panel-button w-button">
                        Reset
                    </Button>
                    <Button variant="cancel-submit-button w-button">
                        Cancel
                    </Button>
                </div>
            </div>
            <div className="side-panel-content">
                <div className="panel-block">
                    {inputSourceDropdown}
                </div>
                <div className="panel-block">
                    {basicParamsDropdown}
                </div>
                <div className="panel-block">
                    {advancedParamsDropdown}
                </div>
            </div>
            <div className="side-panel-footer-bar">
            </div>
        </div>
    );
}

// Individual Dropdown components
const InputSourceDropdown = (props) => {
    return (
        <PanelBlockDropdown formattedTitle="inputSource" title="1. Input Source" panelBlockOpenTracker={props.panelBlockOpenTracker} panelTitle={props.panelTitle} openTracker={props.openTracker} open={props.openTracker["inputSource"]} setOpen={props.setPanelBlockOpenTracker}>
            <div>
                <h3>Input!</h3>
            </div>
        </PanelBlockDropdown>
    );
}

const BasicParamsDropdown = (props) => {
    return (
        <PanelBlockDropdown formattedTitle="basicParams" title="2. Basic Params" panelBlockOpenTracker={props.panelBlockOpenTracker} panelTitle={props.panelTitle} openTracker={props.openTracker} open={props.openTracker["basicParams"]} setOpen={props.setPanelBlockOpenTracker}>
            <h3>Basic!</h3>
        </PanelBlockDropdown>
    );
}

const AdvancedParamsDropdown = (props) => {
    return (
        <PanelBlockDropdown formattedTitle="advancedParams" title="3. Advanced Params" panelBlockOpenTracker={props.panelBlockOpenTracker} panelTitle={props.panelTitle} openTracker={props.openTracker} open={props.openTracker["advancedParams"]} setOpen={props.setPanelBlockOpenTracker}>
            <h3>Advanced!</h3>
        </PanelBlockDropdown>
    );
}


// defines the outside of the dropdown
const PanelBlockDropdown = (props) => {
    // var collapse;
    // collapse = (
    //     <Collapse in={props.open}>
    //         {props.children}
    //     </Collapse>
    // );
    const activeToggleTracker = props.panelBlockOpenTracker[props.panelTitle];
    const panelBlockToggleOpen = { ...activeToggleTracker, [props.formattedTitle]: !props.open };
    return (
        <>
            <Button
                onClick={() => props.setOpen({ ...props.panelBlockOpenTracker, [props.panelTitle]: panelBlockToggleOpen })}
                aria-expanded={props.open}
                variant="panel-block-title"
            >
                    <div className="panel-block-title-text">{props.title}</div>
            </Button>
            <Collapse in={props.open}>
                {props.children}
            </Collapse>
        </>
    );
}


export default Panel;

