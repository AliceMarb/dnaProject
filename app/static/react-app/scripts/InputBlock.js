import React from 'react';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';

const TextInputBox = (props) => {
        const open = props.openDict["textStringOpen"]
        const handle = (e) => {
            props.setToEncode(e.target.value);
            props.setEditing(props.encodeInput);
        }
        return (
            <>
                <Button
                    onClick={() => props.setOpenDict({ ...props.openDict, "textStringOpen": !open})}
                    aria-controls="example-collapse-text"
                    aria-expanded={open}
                    variant="customized-accordion-closed"
                    className={"accordion-closed-item-trigger"}
                    key="bitton"
                >
                    <h3 className={"accordion-label "}>Text String</h3>
                </Button>
                <Collapse in={open}>
                    <form onSubmit={(e) => props.callCodecHandler(e, props.toEncode)}>
                        <textarea
                            value={props.toEncode}
                            onChange={(e) => handle(e)}
                            placeholder="Text string, e.g. &quot;Hello&quot;"
                            // maxLength={5000}
                            className="textarea w-input"
                            type="text"
                            required="required"
                            ref={props.encodeInput}
                        />
                        <input
                            type="submit"
                            name="submit_button_str"
                            value="Encode"
                            className="submit-button w-button input-encode-submit-buttion"
                        />
                    </form>
                </Collapse>
            </>
        );
}
const DecodeInputBox = (props) => {
    // console.log('rerendering decode box')
    const open = props.openDict["decodeOpen"]
    const handle = (e) => {
        if (e.target.value.match(/^[agctAGCT,]*$/)) {
            props.setToDecode(e.target.value);
        }
        props.setEditing(props.decodeInput);
    }
    return (
        <>
            <Button
                onClick={() => props.setOpenDict({...props.openDict, "decodeOpen": !open})}
                aria-controls="example-collapse-text"
                aria-expanded={open}
                variant="customized-accordion-closed"
                className={"accordion-closed-item-trigger " + "input-dna-seq-decode-block-button"}
                key="bitton"
            >
                <h3 className={"accordion-label "}>DNA&nbsp;Sequence Decode</h3>
            </Button>
            <Collapse in={open}>
                <form onSubmit={(e) => props.callCodecTyped(e, "decode", props.toDecode)} className="form">
                    <div className="accordion-item-content">
                        <textarea value={props.toDecode} onChange={(e) => handle(e)}
                            placeholder="DNA sequence, e.g. AGATGAG, ACGATCA, ATACTCT, TCGTCTC, TACGACT,"
                            // maxLength={5000}
                            className="textarea w-input input-dna-sequence-textarea"
                            id="DNA-Input2" name="DNA-Input"
                            ref={props.decodeInput}
                        />
                        <input type="submit" value="Decode" className="submit-button w-button input-dna-seq-decode-submit-button" />
                    </div>
                </form>
            </Collapse>
        </>
    );
}

export  {TextInputBox, DecodeInputBox};