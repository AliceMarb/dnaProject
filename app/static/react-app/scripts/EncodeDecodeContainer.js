import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import $ from 'jquery';
window.jQuery = $;
import arrow from '../public/images/arrow-mid-blue-down-96x96.png';
import bunny from '../public/images/bunny.gif';
import Collapsible from 'react-collapsible';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';
import { TextInputBox, DecodeInputBox } from './InputBlock.js';
import OutputBox from './OutputBox';
import OutputElement from './OutputElement';
import GCGraph from './GCGraph';

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
    const [fileToDecode, setFileToDecode] = useState(null);

    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadLoading2, setUploadLoading2] = useState(false);
    // const [decodeOpen, setDecodeOpen] = useState(false);
    // const [textStringOpen, setTextStringOpen] = useState(false);
    // const [expandableOpen, setExpandableOpen] = useState(true);
    const startOpenDict = {
        decodeOpen: true, textStringOpen: true,
        outputOpen1: false,
        outputOpen2: false,
        outputOpen3: false,
        outputOpen4: false,
        uploadDecodeBox: false,
        uploadEncodeBox: false,
        graphOutbox: false,
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
    useEffect(() => {
        if (editingRef) {
            editingRef.current.focus();
            editingRef.current.selectionStart = editingRef.current.value.length;
            editingRef.current.selectionEnd = editingRef.current.value.length;
        }

    }, [toEncode, toDecode]);

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
                            key="graphOutbox"
                            divKey="graphOutbox"
                            openDict={openDict}
                            setOpenDict={setOpenDict}
                            loading={loading}
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

    const getUrl = (codecFunction, inputType) => {
        if (location.pathname.includes('dev')) {
            // return "/dev/" + "encode/" + inputType;
            if (codecFunction == "get_fasta") {
                return "/dev/" + codecFunction;
            }
            return "/dev/" + codecFunction + "/" + inputType;
        } else if (location.pathname.includes('master')) {
            if (codecFunction == "get_fasta") {
                return "/master/" + codecFunction;
            }
            return "/master/" + codecFunction + "/" + inputType;
        }
    }
    const getJsonOptions = (encode) => {
        var input;
        if (encode) {
            input = toEncode;
        } else {
            input = errorCheckDNA(toDecode);
            // need this for saving history
            setToEncode(input);
            if (!input) return null;
        }
        const options = {
                method: "POST",
                body: JSON.stringify({ "input": input}),
                headers: new Headers({
                    'content-type': 'application/json',
                    dataType: "json",
                }),
        };
        return options;
    }
    const getFileOptions = (formData) => {
        return {
                method: "POST",
                body: formData,
                mode: 'no-cors',
            };
    }

    const codecDecode = (inputType) => {
        var options;
        if (inputType === "file") {
            if (!fileToDecode) {
                alert('Choose a file first!');
                setLoading(false);
                return;
            } else if (uploadLoading2) {
                alert('Waiting for your file to load!');
                setLoading(false);
                return;
            }
            var formData = new FormData();
            formData.append("file", fileToDecode);
            // // no headers or this doesn't work
            options = getFileOptions(formData);
        } else if (inputType === "json") {
            options = getJsonOptions(true);
            if (!options) return;
        }
        const url = getUrl("decode", inputType);
        // var canFullDisplay;
        
        var fileName;
        var date;
        fetch(url, options)
            .then((data) => {
                if (data.ok) {
                    for (var pair of data.headers.entries()) {
                        switch (pair[0]) {
                            case "payload_trits":
                                setPayloadTrits(pair[1]);
                                break;
                            case "address_length":
                                setAddressLength(pair[1]);
                                break;
                            case "synthesis_length":
                                setSynthesisLength(pair[1]);
                                break;
                            // case "can_full_display":
                            //     canFullDisplay = pair[1];
                            //     break;
                            case "base_file_name": 
                                fileName = pair[1];
                                break;
                            case "date": 
                            date = new Date(parseInt(pair[1]));
                                break;
                            // can't do dec_string because of \n
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
                // decode history:
                // if decoded file is text file, display up to 1000 chars: data.slice(0, 1000)
                // if an image, display it.
                setDecHistory((decodeHistory) => [[inputType, inputType === "file" ? fileToDecode.name : toDecode, fileName, date], ...decodeHistory]);
                setMode("decode");
                setLoading(false);
            })
            .catch((error) => {
                alert('Catch: An error has occurred returning the data. Check console for data log.');
                console.log('heres the error!');
                console.log(error);
            });
    }

    // ENCODE FILES ONLY
    const codecGetFile = (inputType) => {
        setLoading(true);
        var options;
        if (inputType === "file") {
            if (!fileToEncode) {
                alert('Choose a file first!');
                setLoading(false);
                return;
            } else if (uploadLoading) {
                alert('Waiting for your file to load!');
                setLoading(false);
                return;
            }
            var formData = new FormData();
            formData.append("file", fileToEncode);
            // // no headers or this doesn't work
            options = getFileOptions(formData);
        } else if (inputType === "json") {
            options = getJsonOptions(true);
        }
        const url = getUrl("encode", inputType);
        fetch(url, options)
            .then((data) => {
                if (data.ok) {
                    var encoded;
                    var canFullDisplay;
                    for (var pair of data.headers.entries()) {
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
                                encoded = pair[1];
                                break;
                            case "can_full_display":
                                canFullDisplay = pair[1];
                                break;
                        }
                    }
                    setEncHistory((encodeHistory) => [[toEncode, encoded, canFullDisplay], ...encodeHistory]);
                    return data.text();
                } else {
                    alert('An error has occurred returning the data. Check console for data log.');
                    console.log("Error!");
                    console.log(data);
                }
            })
            .then((data) => {
                setGCContent(data);
                setMode("encode");
                setLoading(false);
            })
            .catch((error) => {
                alert('Catch: An error has occurred returning the data. Check console for data log.');
                console.log(error);
            });
    }
    const callCodecHandler = (e, encode) => {
        e.preventDefault()
        if (encode) {
            codecGetFile("json");
        } else {
            codecDecode("json");
        }
        
    }

    const readFileToEncode = (e) => {
        console.log('started reading file...');
        e.preventDefault();
        let files = e.target.files;
        // const reader = new FileReader();
        // would use if we want to read the file before
        // encoding for some reason
        // reader.onload = async (event) => {
        //     const text = (event.target.result);
        //     setFileToEncode(files[0]);
        //     console.log(fileToEncode);
        // };
        // reader.readAsText(files[0]);
        setFileToEncode(files[0]);
        console.log('finished reading file.');
        setUploadLoading(false);
    }

    const readFileToDecode = (e) => {
        console.log('started reading file...');
        e.preventDefault();
        let files = e.target.files;
        setFileToDecode(files[0]);
        console.log('finished reading file.');
        setUploadLoading2(false);
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
    const getFasta = () => {
        // gets the most recently encoded file
        var fileName = "";
        const url = getUrl("get_fasta", "");
        fetch(url, {
            method: 'GET',
        })
            .then(response => {
                for (var pair of response.headers.entries()) {
                    if (pair[0] == "content-disposition") {
                        var contentDispositionHeader = pair[1];
                        var result = contentDispositionHeader.split(';')[1].trim().split('=')[1];
                        fileName = result.replace(/"/g, '');
                        break;
                    }
                }
                return response.blob()
            })
            .then(blob => {
                var url = window.URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
                a.click();
                a.remove();  //afterwards we remove the element again         
            });
    }

    console.log('rerender...');
    console.log(openDict);
    var inputChild = (
        <FileInputWrapper
            codecGetFile={codecGetFile}
            fileToProcess={fileToEncode}
            uploadLoading={uploadLoading}
            readFile={readFileToEncode}
            setUploadLoading={setUploadLoading}
            buttonName={"Encode File"}
        />);
    var inputChild2 = (
        <FileInputWrapper
            codecGetFile={codecDecode}
            fileToProcess={fileToDecode}
            uploadLoading={uploadLoading2}
            readFile={readFileToDecode}
            setUploadLoading={setUploadLoading2}
            buttonName={"Decode File"}
        />);

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
                                        <DecodeInputBox openDict={openDict} setToDecode={setToDecode} setEditing={setEditing} callCodecHandler={callCodecHandler} setOpenDict={setOpenDict} toDecode={toDecode}
                                            decodeInput={decodeInput} />
                                        <ExpandableBox
                                            labelClass="input-file-upload-block-label"
                                            buttonLabel="Upload Encode file"
                                            buttonClass="input-file-upload-block-button"
                                            renderWaitingScreen={false}
                                            key="uploadEncodeBox"
                                            divKey="uploadEncodeBox"
                                            openDict={openDict}
                                            setOpenDict={setOpenDict}
                                            loading={loading}
                                        >
                                            {inputChild}
                                        </ExpandableBox>
                                        <ExpandableBox
                                            labelClass="input-file-upload-block-label"
                                            buttonLabel="Upload Decode file"
                                            buttonClass="input-file-upload-block-button"
                                            renderWaitingScreen={false}
                                            key="uploadDecodeBox"
                                            divKey="uploadDecodeBox"
                                            openDict={openDict}
                                            setOpenDict={setOpenDict}
                                            loading={loading}
                                        >
                                            {inputChild2}
                                        </ExpandableBox>
                                        {/* <div className="accordion-closed-item input-file-upload-block">
                                            <ExpandableBox
                                                labelClass="input-file-upload-block-label"
                                                buttonLabel="Upload Decode file"
                                                buttonClass="input-file-upload-block-button"
                                                renderWaitingScreen={false}
                                                key="uploadDecodeBox"
                                                divKey="uploadDecodeBox"
                                                openDict={openDict}
                                                setOpenDict={setOpenDict}
                                                loading={loading}
                                            >
                                                <div className="accordion-item-content">
                                                    <FileInput
                                                        fileToEncode={fileToEncode}
                                                        readFile={readFileToEncode}
                                                        setUploadLoading={setUploadLoading}
                                                        toEncode={toEncode} />
                                                    <div className="text-block-6 payload-length-label">
                                                        {fileToEncode && !uploadLoading ? <p>{"File successfully uploaded: "}<br />{fileToEncode.name}</p> : "No file chosen"}
                                                        {fileToEncode && !uploadLoading ? <p>{"File successfully uploaded: "}<br />{fileToEncode.name}</p> : uploadLoading ? <img src={bunny} /> : "No file chosen"}
                                                    </div>
                                                    <input
                                                        onClick={() => codecGetFile("file")}
                                                        type="submit"
                                                        name="submit_button_str"
                                                        value="Decode File"
                                                        className="submit-button w-button input-decode-submit-button"
                                                    />
                                                </div>
                                            </ExpandableBox>
                                        </div> */}
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
                                        putOutputInInput={putOutputInInput} getFasta={getFasta}
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


const FileInput = React.memo((props) => {
    console.log('rerendering the file input');
    const wrapperRef = useRef(null);
    useChangeAlerter(wrapperRef, props.setUploadLoading, props.readFile);
    return (
        <>
            <input
                ref={wrapperRef}
                style={{ width: "120px" }} type="file"
                className="submit-button w-button input-file-upload-submit-button" />
            {/* <div>{Math.random() * 100}</div> */}
        </>
    );
});


const FileInputWrapper = React.memo((props) => {
    const fileinput = <FileInput
        readFile={props.readFile}
        setUploadLoading={props.setUploadLoading}
    />;
    return (
        <div className="accordion-item-content">
            {fileinput}
            <div className="text-block-6 payload-length-label">
                {props.fileToProcess && !props.uploadLoading ? <p>{"File successfully uploaded: "}<br />{props.fileToProcess.name}</p> : props.uploadLoading ? <img src={bunny} /> : "No file chosen"}
            </div>
            <input
                onClick={() => props.codecGetFile("file")}
                type="submit"
                name="submit_button_str"
                value={props.buttonName}
                className="submit-button w-button input-encode-submit-button"
            />

        </div>);
});


const ExpandableBox = (props) => {
    var collapse;
    var open = props.openDict[props.divKey];
    if (props.renderWaitingScreen && props.loading) {
        collapse = (
            <Collapse in={open}>
                <img src={bunny} width="600px" height="450px" />
            </Collapse>);

    } else {
        collapse = (
            <Collapse in={open}>
                <div>
                    {/* {open ? <h3>open!!!</h3> : <h3>closed!!!</h3>} */}
                    {props.children}
                </div>
            </Collapse>);
    }
    return (
        <div key={props.divKey}>
            <Button
                onClick={() => props.setOpenDict({ ...props.openDict, [props.divKey]: !open })}
                aria-controls="example-collapse-text"
                aria-expanded={open}
                variant="customized-accordion-closed"
                className={"accordion-closed-item-trigger " + props.buttonClass}
            >
                <h3 className={"accordion-label " + props.labelClass}>{props.buttonLabel}</h3>
            </Button>
            {collapse}
        </div>
    );
}

const useChangeAlerter = (ref, setUploadLoading, readFile) => {
    useEffect(() => {
        /**
         * Necessary because onChange actions happen after the file
         * gets uploaded, so the loading screen won't be shown.
         * Instead, 
         */
        function handleClickOutside(e) {
            // e.preventDefault();
            console.log("Button has been clicked!!");
            setUploadLoading(true);
            // div.removeEventListener("click", handleClickOutside);
            // div.click();
        }
        function handleChange(e) {
            console.log("Value changed!!");
            readFile(e);
        }
        const div = ref.current;
        // Bind the event listener
        div.addEventListener("click", handleClickOutside);
        div.addEventListener("change", handleChange);
        // this is the cleanup function i.e. componentWillUnmount
        // unmounting meaning that React is no longer rendering this element
        // (i.e. when the dropdown is closed)
        return () => {
            // Unbind the event listener on clean up
            console.log('cleaning up!!');
            console.log(div.value);
            div.removeEventListener("click", handleClickOutside);
            div.removeEventListener("change", handleChange);
        };
    }, [ref]);
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
                getFasta={props.getFasta}
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