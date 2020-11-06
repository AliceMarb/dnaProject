import logo from './logo.svg';
import './App.css';
import encoderImg from './icon_synth_768x768.png';
function App() {
  return (
    <div className="side-bar">
      <div className="side-bar-nav-2">
        <div className="side-bar-toggle encoder-toggle">
          <div className="top-bar-toggle-image-block">
            <div className="panel-toggle-tooltip-3 side-bar-tooltip">
              <div className="panel-toggle-tooltip-text">Encoder</div>
            </div>
            <img className="img" src={encoderImg} sizes="(max-width: 479px) 20px, (max-width: 767px) 22px, 30px"/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
