import React from 'react';

const OutputBox = (props) => {
    // console.log('outputbox mode' + props.mode);
    // console.log('outputbox trits' + props.payloadTrits);
    var card;
    if (props.mode === "default") {
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
        <> 
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
        <div className="output-sub-block nc-content-plot-block">
            <div className="label nc-content-block-label">Nucleotide content</div>
            <div className="w-layout-grid grid-2 nc-content-value-grid-block">
                {
                    Object.entries(props.nucleotideContent)
                        .map(([key, value]) => <div className="nc-content-value" key={key}><strong>{key}: </strong>{value}</div>)
                }
            </div>
        </div>
        </>
    );
}
export default OutputBox;