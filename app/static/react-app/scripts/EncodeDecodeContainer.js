import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
// import './jquery.js';
// import $ from './jquery.js'; 
import $ from 'jquery';
// console.log('Hello:!' + $);
// import plugin from 'jquery-plugin';
window.jQuery = $;
import arrow from '../public/images/arrow-mid-blue-down-96x96.png';
import bunny from '../public/images/bunny.gif';
// import bunny2 from './bunny.gif';
// import otherArrow from '../dist/arrow-mid-blue-down-96x96.png';
import Collapsible from 'react-collapsible';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';
import { TextInputBox, DecodeInputBox } from './InputBlock.js';
import OutputBox from './OutputBox';
import OutputElement from './OutputElement';
import GCGraph from './GCGraph';
// import hi from '../public/frontend_textfiles/hi.txt';
// import file from '../../../../app/codec_files/gc_content_rawBpa.txt';

const EncodeDecodeContainer = () => {

    const [mode, setMode] = useState("default");
    const [toEncode, setToEncode] = useState("");
    const [toDecode, setToDecode] = useState("");
    const [payloadTrits, setPayloadTrits] = useState("");
    const [addressLength, setAddressLength] = useState("");
    const [synthesisLength, setSynthesisLength] = useState("");
    const [gcContentPath, setGCContentPath] = useState("");
    const [gcContent, setGCContent] = useState("");
    const [encodeHistory, setEncHistory] = useState([]);
    const [decodeHistory, setDecHistory] = useState([]);
    const [nucleotideContent, setNucleotideContent] = useState({});
    const [loading, setLoading] = useState(false);
    const [editingRef, setEditing] = useState(null);
    const [fileToEncode, setFileToEncode] = useState(null);
    // const [decodeOpen, setDecodeOpen] = useState(false);
    // const [textStringOpen, setTextStringOpen] = useState(false);
    // const [expandableOpen, setExpandableOpen] = useState(true);
    const startOpenDict = {
        decodeOpen: true, textStringOpen: true,
        expandableOpen: true,
        outputOpen1: false,
        outputOpen2: false,
        outputOpen3: false,
        outputOpen4: false,
    };
    const [openDict, setOpenDict] = useState(startOpenDict);
    const [analytics, setAnalytics] = useState(
        {
            outputOpen1: "Basic Data",
            outputOpen2: "DNA Sequence",
            outputOpen3: "",
            outputOpen4: "",
        }
    );
    const [plots, setPlots] = useState(
        {
            outputOpen1: "",
            outputOpen2: "",
            outputOpen3: "GC Content Plot",
            outputOpen4: "Nucleotide Content Plot"
        }
    );
    // const [sendFileType, setSendFileType] = useState("json");
    // acts like a class member, e.g. props or state, but without
    // a class. So it is retained between renders.
    // is set with its .current property
    const location = useLocation();

    const d3Container = useRef();
    const gcContainer = useRef();
    const encodeInput = useRef();
    const decodeInput = useRef();
    // useMountEffect( setInputFocus )
    useEffect(() => {
        // console.log('rerendering' + editingRef);
        if (editingRef) {
            // console.log(editingRef);
            editingRef.current.focus();
            editingRef.current.selectionStart = editingRef.current.value.length;
            editingRef.current.selectionEnd = editingRef.current.value.length;
        }

    }, [toEncode, toDecode]);

    const ExpandableBox = (props) => {
        // console.log('rerendering edxpandable box');
        // const [open, setOpen] = useState(true);
        var collapse;
        var open = props.openDict["expandableOpen"];
        if (props.renderWaitingScreen && loading) {
            collapse = (
                <Collapse in={open}>
                    <img src={bunny} width="600px" height="450px" />
                </Collapse>);

        } else {
            collapse = (<Collapse in={open}>
                {props.children}
            </Collapse>);
        }
        return (
            <div key={props.divKey}>
                <Button
                    onClick={() => props.setOpenDict({ ...props.openDict, "expandableOpen": !open })}
                    aria-controls="example-collapse-text"
                    aria-expanded={open}
                    variant="customized-accordion-closed"
                    className={"accordion-closed-item-trigger " + props.buttonClass}
                    key="bitton"
                >
                    <h3 className={"accordion-label " + props.labelClass}>{props.buttonLabel}</h3>
                </Button>
                {collapse}
            </div>
        );
    }

    const GraphBox = () => {
        const width = 600;
        const height = 500;
        const pixelWidth = width + "px"
        const pixelHeight = height + "px"
        // console.log('rendering graph box, gccontent ' + gcContentPath)
        const child = <GCGraph key="gcgraph" gcContent={gcContent} gcContentPath={gcContentPath} inputWidth={width} inputHeight={height} />;

        return (
            <div>
                <div className="output-sub-block gc-content-plot-block">
                    <div className="accordion-closed-item">
                        <ExpandableBox
                            labelClass="gc-content-plot-block-label"
                            buttonLabel="GC Content Plot"
                            buttonClass="gc-content-plot-button"
                            renderWaitingScreen={true}
                            key="graph-outbox"
                            divKey="akey"
                            openDict={openDict}
                            setOpenDict={setOpenDict}
                        >
                            <div>
                                <div
                                    width={pixelWidth}
                                    height={pixelHeight}
                                    className="accordion-item-content gc-content-plot-value"
                                >
                                    <div
                                        ref={gcContainer}
                                        className="graphContainer"
                                        id="graph2"
                                        svg-container="true"
                                        preserveAspectRatio="xMinYMin"
                                        width={pixelWidth}
                                        height={pixelHeight}
                                    // svg-content-responsive="true"
                                    >
                                        {mode != "decode" && gcContentPath && gcContent ? child : null}
                                        {/* <GCGraph gcContentPath={gcContentPath} inputWidth={width} inputHeight={height} /> */}
                                    </div>
                                </div>
                            </div>
                        </ExpandableBox>
                    </div>
                </div>
            </div>
        );
    }
    const callCodecTyped = (e, buttonType, stringToDecode) => {
        e.preventDefault();
        console.log('this is string to decode' + stringToDecode);
        setToDecode(stringToDecode);
        if (buttonType === "encode") {
            var url = "encode_string/json";
        } else {
            var url = "decode_string";
            var cleanDNA = errorCheckDNA(stringToDecode);
            if (!cleanDNA) {
                return;
            }
        }
        const options = {
            method: "POST",
            body: JSON.stringify({ "input": (buttonType === "encode" ? toEncode : cleanDNA) }),
            headers: new Headers({
                'content-type': 'application/json',
                dataType: "json",
            }),
        };

        if (location.pathname.includes('dev')) {
            url = "/dev/" + url;
        } else if (location.pathname.includes('master')) {
            url = "/master/" + url;
        }
        fetch(url, options)
            .then((data) => {
                if (data.ok) {
                    return data.json();
                } else {
                    alert('An error has occurred returning the data. Check console listOpendata log.');
                    console.log("Error!");
                    console.log(data);
                }
            })
            .then((data) => {
                if (buttonType === "encode") {
                    var encoded = data['encoded'];
                    setEncHistory((encodeHistory) => [[toEncode, encoded], ...encodeHistory]);
                    setMode("encode");
                    setPayloadTrits(data['payload_trits']);
                    setGCContentPath(data['gc_content_fname']);
                    setNucleotideContent(data['letter_dict']);
                } else {
                    var decoded = data['word'];
                    setDecHistory((decodeHistory) => [[cleanDNA, decoded], ...decodeHistory]);
                    setMode("decode");
                    setSynthesisLength(data['synthesis_length']);
                    setAddressLength(data['address_length']);
                }
            })
            .catch((error) => {
                alert('Catch: An error has occurred returning the data. Check console for data log.');
                console.log(error);
            });
    }

    const ResultBox = () => {
        if (mode === "decode") {
            return (
                <>
                    <div className="label dna-seq-output-block-label">DNA Sequence</div>
                    <textarea value={loading ? "Loading results!" : (mode === "encode" ? encodeHistory[0][1] : (mode === "decode" ? decodeHistory[0][1] : ""))} readOnly
                        disabled="disabled" placeholder={loading ? "Loading results!" : "DNA Sequence Output"} maxLength={5000} id="DNA-Sequence-Output" name="DNA-Sequence-Output" className="dna-seq-output-text-area w-input" />
                </>);

        }
        return (<></>);
    }

    const putOutputInInput = (e) => {
        if (mode === "encode") {
            if (encodeHistory.length == 0) {
                alert('Please encode something first');
            } else {
                setToDecode(encodeHistory[0][1]);
                setOpenDict({ ...openDict, "decodeOpen": true });
            }
        } else {
            if (decodeHistory.length == 0) {
                alert('Please encode something first');
            } else {
                setToEncode(decodeHistory[0][1]);
                setOpenDict({ ...openDict, "textStringOpen": true });
            }
        }
    }
    const codecGetFile = (input, buttonType, inputType) => {
        setLoading(true);
        var options;

        if (inputType === "file") {
            if (!fileToEncode) {
                alert('Choose a file first!');
                setLoading(false);
                return;
            }
            // else {
            //     var fileType = fileToEncode.type;
            // }
            var formData = new FormData();
            formData.append("file", fileToEncode);
            // // no headers or this doesn't work
            options = {
                method: "POST",
                body: formData,
                mode: 'no-cors',
            };
        } else if (inputType === "json") {
            setToEncode(input);
            options = {
                method: "POST",
                body: JSON.stringify({ "input": (buttonType === "encode" ? input : cleanDNA) }),
                headers: new Headers({
                    'content-type': 'application/json',
                    dataType: "json",
                }),
            };
        }

        if (buttonType === "encode") {
            var url = "encode/" + inputType;
        }

        if (location.pathname.includes('dev')) {
            url = "/dev/" + url;
        } else if (location.pathname.includes('master')) {
            url = "/master/" + url;
        }
        fetch(url, options)
            .then((data) => {
                if (data.ok) {
                    // var encStringFound = false;
                    for (var pair of data.headers.entries()) {
                        // console.log(pair[0] + ': ' + pair[1]);
                        switch (pair[0]) {
                            case "payload_trits":
                                setPayloadTrits(pair[1]);
                                break;
                            case "letter_dict":
                                setNucleotideContent(
                                    JSON.parse(pair[1].replaceAll(' ', '').replaceAll("'", '"'))
                                );
                                break;
                            case "address_length":
                                setAddressLength(pair[1]);
                                break;
                            case "synthesis_length":
                                // only encode available for now
                                setSynthesisLength(pair[1]);
                                break;
                            case "gc_content_fname":
                                setGCContentPath(pair[1]);
                                break;
                            case "enc_string":
                                // encStringFound = true;
                                var encoded = pair[1];
                                setEncHistory((encodeHistory) => [[input, encoded], ...encodeHistory]);
                                break;
                        }
                    }
                    return data.text();
                } else {
                    alert('An error has occurred returning the data. Check console for data log.');
                    console.log("Error!");
                    console.log(data);
                }
            })
            .then((data) => {
                setGCContent(data);
                if (buttonType === "encode") {
                    setMode("encode");
                } else {
                    setDecHistory((decodeHistory) => [[toDecode, decoded], ...decodeHistory]);
                    setMode("decode");
                }
                setLoading(false);
            })
            .catch((error) => {
                alert('Catch: An error has occurred returning the data. Check console for data log.');
                console.log(error);
            });
    }
    const callCodecHandler = (e, stringToEncode) => {
        e.preventDefault()
        codecGetFile(stringToEncode, "encode", "json");
    }
    const readFile = (e) => {
        e.preventDefault();
        let files = e.target.files;
        const reader = new FileReader();
        reader.onload = async (event) => {
            // in case I want to show before passing back
            const text = (event.target.result);
            setFileToEncode(files[0]);
            // console.log(text);
            console.log(fileToEncode);
            // codecGetFile(files, "encode", "textFile");
        };
        reader.readAsText(files[0]);
    }

    const DecodeDisplay = () => {
        if (mode === "decode") {
            return (
                <div>
                    <OutputBox payloadTrits={payloadTrits}
                        synthesisLength={synthesisLength}
                        addressLength={addressLength}
                        mode={mode}
                        nucleotideContent={nucleotideContent}
                    />
                </div>

            );
        } else {
            return <></>;
        }

    }

    return (
        <div>
            <div className="body-4">
                <div>
                    <div className="section-heading-wrap">
                        <h2 className="heading-2 dna-synthesizer-title">DNA Synthesizer<br /></h2>
                        <div className="label cc-light dna-synthesizer-short-title">Encode your data into our synthetic dna<br /></div>
                    </div>
                    <div className="main-body-section">
                        <div className="panel-block">
                            <div className="input-block">
                                <div className="panel-title">
                                    <h4 className="heading-6">Input</h4>
                                </div>
                                <div className="accordion-wrapper">
                                    <div className="w-form">
                                        <TextInputBox openDict={openDict} setToEncode={setToEncode} setEditing={setEditing} setOpenDict={setOpenDict} callCodecHandler={callCodecHandler} toEncode={toEncode} encodeInput={encodeInput} />
                                        <DecodeInputBox openDict={openDict} setToDecode={setToDecode} setEditing={setEditing} callCodecTyped={callCodecTyped} setOpenDict={setOpenDict} toDecode={toDecode}
                                            decodeInput={decodeInput} />
                                        <div className="accordion-closed-item input-file-upload-block">
                                            <ExpandableBox
                                                labelClass="input-file-upload-block-label"
                                                buttonLabel="Upload file"
                                                buttonClass="input-file-upload-block-button"
                                                renderWaitingScreen={false}
                                                key="upload-box"
                                                divKey="anotherkey"
                                                openDict={openDict}
                                                setOpenDict={setOpenDict}
                                            >
                                                <div className="accordion-item-content">
                                                    <input style={{ width: "120px" }} type="file" onChange={(e) => readFile(e)} className="submit-button w-button input-file-upload-submit-button" />
                                                    <div className="text-block-6 payload-length-label">File Chosen: {fileToEncode ? fileToEncode.name : null}</div>
                                                    <input
                                                        onClick={() => codecGetFile(null, "encode", "file")}
                                                        type="submit"
                                                        name="submit_button_str"
                                                        value="Encode File"
                                                        className="submit-button w-button input-encode-submit-button"
                                                    />
                                                </div>
                                            </ExpandableBox>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="output-block">
                                <div className="w-form">
                                    <div className="panel-title">
                                        <h4 className="heading-6">Output</h4>
                                    </div>
                                    <div className="form-2">
                                        <div className="w-row">
                                            <div className="w-col w-col-4">
                                                <DecodeDisplay />
                                            </div>
                                            <div className="w-col w-col-8">
                                                <div className="output-sub-block dna-seq-output-block">
                                                    <ResultBox />
                                                    {mode === "decode" ? <button onClick={putOutputInInput} value="Copy DNA Sequence to Input" className="submit-button copy-dna-seq-to-input-submit-button w-button">Copy DNA Sequence to Input</button> : null}
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                    <OutputElements openDict={openDict} setOpenDict={setOpenDict} analytics={analytics} setAnalytics={setAnalytics} plots={plots} setPlots={setPlots} addressLength={addressLength}
                                        synthesisLength={synthesisLength}
                                        payloadTrits={payloadTrits}
                                        mode={mode}
                                        loading={loading}
                                        encodeHistory={encodeHistory}
                                        nucleotideContent={nucleotideContent}
                                        gcContent={gcContent} gcContentPath={gcContentPath} width={500} height={500}
                                        putOutputInInput={putOutputInInput}
                                    />
                                    {/* <GraphBox key="graphbox" /> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const OutputElements = (props) => {
    const outputElements = [];
    for (var i = 1; i < 5; i++) {
        outputElements.push(
            <OutputElement
                key={"outputOpen" + String(i)}
                openDict={props.openDict}
                openName={"outputOpen" + String(i)}
                setOpenDict={props.setOpenDict}
                analytics={props.analytics} setAnalytics={props.setAnalytics} plots={props.plots} setPlots={props.setPlots}
                addressLength={props.addressLength}
                synthesisLength={props.synthesisLength}
                payloadTrits={props.payloadTrits}
                mode={props.mode}
                loading={props.loading}
                encodeHistory={props.encodeHistory}
                nucleotideContent={props.nucleotideContent}
                putOutputInInput={props.putOutputInInput}
                gcContent={props.gcContent} gcContentPath={props.gcContentPath} inputWidth={props.width} inputHeight={props.height}
            />
        );
    }
    return (
        <div className="w-layout-grid output-block-grid">
            {outputElements}
        </div>);
}

const errorCheckDNA = (input) => {
    // error check input
    var strandLength = -1;
    var seen = 0;
    var letters = 0;
    var testInput = ""
    input = input.trim();
    if (input.slice(-1) != ",") {
        testInput = input + ",";
    } else {
        testInput = input;
    }
    var cleanInput = "";
    // var letters = true;
    for (var i = 0; i < testInput.length; i++) {
        var c = testInput.charAt(i);
        if (c == ',' && strandLength == -1) {
            if (seen == 0) {
                alert("Can't start with comma");
                return null;
            }
            cleanInput += c;
            strandLength = seen;
            seen = 0;
        } else if (seen != strandLength && c == ",") {
            alert('Strands must be the same length');
            return null;
        } else if (c == ",") {
            cleanInput += c;
            seen = 0;
        } else if ("agctAGCT".includes(c)) {
            seen++;
            letters++;
            cleanInput += c;
        } else if (/\s/.test(c)) {
            continue;
        } else {
            alert('Invalid characters. Must be AGCT');
            return null;
        }
    }
    return cleanInput.slice(0, -1);
}

export default EncodeDecodeContainer;