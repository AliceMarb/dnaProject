import React from 'react';



const DNABox = (props) => {
    var downloadButton;
    // console.log(props.encodeHistory[0][1]);
    // if (props.encodeHistory[0][1].includes("...")) {
        // if enc_string is too big
        downloadButton = (
            <>
                <button onClick={props.getFasta} className="submit-button w-button">Download DNA Sequences</button>
            </> 
        );
    // }
    return (
        <>
        <textarea
            value={props.loading ? "Loading results!" : props.encodeHistory[0][1]}
            readOnly
            disabled="disabled"
            placeholder={props.loading ? "Loading results!" : "DNA Sequence Output"}
            maxLength={5000} id="DNA-Sequence-Output" name="DNA-Sequence-Output"
            className="dna-seq-output-text-area w-input" 
        />
        <div className="w-col w-col-8">
            <div className="output-sub-block dna-seq-output-block">
                <div className="label dna-seq-output-block-label">DNA Sequence</div>
                <button onClick={props.putOutputInInput} value="Copy DNA Sequence to Input" className="submit-button copy-dna-seq-to-input-submit-button w-button">Copy DNA Sequence to Input</button>
            </div>
            {downloadButton}
        </div>
        </>
    );
}

export default DNABox;