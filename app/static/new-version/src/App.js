import encoderImg from './icon_synth_768x768.png';
import decoderImg from './icon_decoder_768x768.png';
import analyzerImg from './icon_analyzer_768x768.png';
import React, { useState } from 'react';
import Button from 'react-bootstrap/Button'
import { OverlayTrigger } from 'react-bootstrap';
import Panel from './Panel';

const App = () => {
  // states 
  // start with encoder open
  const [activeToggle, setactiveToggle] = useState("Encoder");
  // start by showing the enc/dec/analyzer panel
  const [showPanel, setShowPanel] = useState(true);
  // controls which panel-blocks are open in the panels
  const initTracker = {"inputSource": false, "basicParams":false, "advancedParams": false};
  const [panelBlockOpenTracker, setPanelBlockOpenTracker] = useState({
    "Encoder": initTracker,
    "Decoder": initTracker,
    "Analyzer": initTracker,
  });

  const toggleTypes = [
    ["Encoder", encoderImg],
    ["Decoder", decoderImg],
    ["Analyzer", analyzerImg]
  ]

  // generates toggle buttons from toggleTypes
  var toggles = toggleTypes.map((item, i) => {
    var title = item[0];
    var icon = item[1];
    var classAdditionalName;

    // Shows tooltip
    const renderTooltip = (props) => (
      <div className="panel-toggle-tooltip-3 side-bar-tooltip">
        <div className="panel-toggle-tooltip-text">{title}</div>
      </div>
    );

    // shows different color only when selected
    if (title === activeToggle) {
      // e.g. Encoder => encoder-panel-toggle
      classAdditionalName = (title.charAt(0).toLowerCase() + title.slice(1)) + "-panel-toggle";
    } else {
      classAdditionalName = "my-toggle-not-selected";
    }
    return (
      <OverlayTrigger key={i} placement="right"
        delay={{ show: 250, hide: 400 }}
        overlay={renderTooltip}>
        <Button variant={"side-bar-toggle " + classAdditionalName} onClick={() => {setactiveToggle(title); setShowPanel(true);}}>
          <div className="top-bar-toggle-image-block">
            <img className="icon" src={icon} alt={title + " icon"} sizes="(max-width: 479px) 20px, (max-width: 767px) 22px, 30px" />
          </div>
        </Button>
      </OverlayTrigger>
    )
  });
  
  // dynamically show a different panel depending on activeToggle
  var panel = <Panel activeToggle={activeToggle} setShowPanel={setShowPanel}
    panelBlockOpenTracker={panelBlockOpenTracker} setPanelBlockOpenTracker={setPanelBlockOpenTracker}
  />

  return (
    <div className="dna-synth-body">
      <div className="side-bar">
        <div className="side-bar-nav-2">
          {toggles}
        </div>
      </div>
      <div className="body-block">
        <div className="main-content">
          <div className="left-panels-column">
          {showPanel? panel: null}
          </div>
        </div>
      </div>
    </div>
  );
}


export default App;
