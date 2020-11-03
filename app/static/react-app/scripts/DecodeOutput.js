import React, { useState, useRef, useEffect, useMemo } from 'react';
import bunny from '../public/images/bunny.gif';

const DecodeOutput = React.memo((props) => {
    console.log('decode output');
    var image = null;
    var textbox = null;
    var extension;
    if (props.loading) {
        return <img src={bunny} />;
    }
    if (props.currProcessJob["decodedFileType"].includes("image")) {
        image = <img src={props.currProcessJob["decodedDisplayUrl"]} />
        extension = props.currProcessJob["decodedFileType"].split("/")[1]
    } else if (props.currProcessJob["decodedFileType"].includes("text")) {
        extension = "txt";
        // console.log("here's decoded value " + props.decodeHistory[0][5]);
        textbox = (<>
            <div className="label dna-seq-output-block-label">Decoded Output</div>
            <textarea value={props.loading ? "Loading results!" : props.currProcessJob["preview"]} readOnly
                disabled="disabled" placeholder={props.loading ? "Loading results!" : "Decoded Output"} maxLength={5000} className="dna-seq-output-text-area w-input" />
            <button onClick={() => props.putOutputInInput(props.currProcessJob["preview"], props.currProcessJob["canDisplayFull"], false)} value="Copy DNA Sequence to Input" className="submit-button copy-dna-seq-to-input-submit-button w-button">Copy DNA Sequence to Input</button>
        </>);
    }
    var downloadButton = (
        <a
            href={props.currProcessJob["decodedDisplayUrl"]}
            download={props.currProcessJob["basicFileName"] + "." + extension}
            className="submit-button w-button">Download Output</a>
    );
    return (
        <div>
            {image}
            {textbox}
            <div>{props.currProcessJob["canDisplayFull"] ? "" : "Couldn't display full file."}</div>
            {downloadButton}
        </div>

    );
});

export default DecodeOutput;
