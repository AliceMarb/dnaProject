import React from 'react';

const OutputBox = (props) => {
    var card;
    if (props.mode === "default") {
        // return  <h1>Empty!</h1>;
        return (
            <div className="output-sub-block basic-data-block">
                <div className="label basic-data-block-label">DATA</div>
            </div>
        );
    } else if (props.mode === "encode") {
        card = (
            <div className="div-block-3">
                <div className="text-block-6 payload-length-label">Payload Data</div>
                <div className="payload-output-value">{props.payloadTrits}</div>
            </div>
        );
    } else {
        card = (
            <div className="div-block-3">
                <div className="text-block-6 payload-length-label">Synthesis Length</div>
                <div className="payload-output-value">{props.synthesisLength}</div>
            </div>
        );
    }
    return (
        <div className="output-sub-block basic-data-block">
            <div className="label basic-data-block-label">DATA</div>
            <div className="basic-data-value">
                {card}
                <div className="div-block-3">
                    <div className="text-block-6 address-length-label">Address Length</div>
                    <div className="address-length-output-value">{props.addressLength}</div>
                </div>
            </div>
        </div>
    );
}
export default OutputBox;