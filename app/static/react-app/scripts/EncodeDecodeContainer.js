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
import OutputElementTemplate from './OutputElementTemplate';
import { curveBasis } from 'd3';
import TransitionsTable from './TransitionsTable';
import GCGraph from './GCGraph';
import NucleotideGraph from './NucleotideGraph';
import DNABox from './DNABox';
import DecodeOutput from './DecodeOutput';


const EncodeDecodeContainer = () => {

    const [mode, setMode] = useState("default");
    const [toEncode, setToEncode] = useState("");
    const [toDecode, setToDecode] = useState("");
    const [gcContentPath, setGCContentPath] = useState("");
    const [gcContent, setGCContent] = useState("");
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingRef, setEditing] = useState(null);
    const [fileToEncode, setFileToEncode] = useState(null);
    const [fileToDecode, setFileToDecode] = useState(null);

    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadLoading2, setUploadLoading2] = useState(false);

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
    const encodeInitialDisplay = {
        // job, encode/decode, type, plot
        outputOpen1: ["Analytics", "Basic Data"],
        outputOpen2: ["Analytics", "DNA Sequence"],
        outputOpen3: ["Plots", "GC Content Plot"],
        outputOpen4: ["Plots", "Nucleotide Content Plot"],
    };

    const [openDict, setOpenDict] = useState(startOpenDict);
    const [selectedDisplays, setSelectedDisplay] = useState(encodeInitialDisplay);
    const [processJobDisplays, setProcessJobDisplay] = useState({});
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
        if (editingRef && !document.activeElement === editingRef.current) {
            editingRef.current.focus();
            editingRef.current.selectionStart = editingRef.current.value.length;
            editingRef.current.selectionEnd = editingRef.current.value.length;
        }
    }, [toEncode, toDecode]);


    if (location.pathname.includes("history")) {
        var fileName = "", date = "", canDisplayFull = "", preview = "", configuration = "", encode = "", inputName = "", inputType = "", synthesisLength = "", decodedFileType = "";
        var metadataDict = {};
        fetch(location.pathname.replace("history", "show-history")).then((data) => {
            if (data.ok) {
                [metadataDict, preview, date, fileName, canDisplayFull,
                    configuration, encode, inputType, inputName, synthesisLength,
                    decodedFileType] = parseHeaders(data.headers, true);
                if (encode) {
                    return data.text();
                } else {
                    return data.blob();
                } 
            }
            
        }).then((data) => {
            // TO DO - enc_string will already be up to 5000 chars
            if (encode) {
                var item = constructEncodeItem(inputType, inputName, fileName, date, preview, canDisplayFull, metadataDict, data);
            } else {
                var url = URL.createObjectURL(data);
                var item = constructDecodeItem(inputType, inputName, fileName, date, canDisplayFull, metadataDict, decodedFileType, url);
            }
            // both encode and decode
            var specialSelectedDisplay = getSelectedDisplay(configuration, encode);
            setSelectedDisplay(specialSelectedDisplay);
            updateAllDisplaysWithItem(item);
            if (encode) {
                updateStatesForEncoding(data);
            } else {
                if (decodedFileType.includes("text")) {
                    const reader = new FileReader();
                    reader.onload = async (event) => {
                        const text = (event.target.result);
                        console.log(text.slice(0, 5000));
                        // max file size = 5000, so cut off at 5000 chars.
                        // preview = text.slice(0, 5000);
                        item["preview"] = text.slice(0, 5000)
                        updateStatesForDecoding(item);
                    };
                    reader.readAsText(data);
                } else {
                    item["preview"] = "";
                    updateStatesForDecoding(item);
                }
            }
            if (inputType === "json") {
                setToEncode(inputName);
            }
        })
            .catch((error) => {
                alert('Catch: An error has occurred returning the data. Check console for data log.');
                console.log(error);
            });
    }

    const updateStatesForDecoding = (item) => {
        setHistory((history) => [item, ...history]);
        setMode("decode");
        setLoading(false);
    }
    const updateStatesForEncoding = (data, item) => {
        setHistory((history) => [item, ...history]);
        setGCContent(data);
        setMode("encode");
        setLoading(false);
    }
    const updateAllDisplaysWithItem = (item) => {
        setProcessJobDisplay({
            outputOpen1: item,
            outputOpen2: item,
            outputOpen3: item,
            outputOpen4: item,
        });
    }
    const getSelectedDisplay = (configuration, encode) => {
        var config = {
            // job, encode/decode, type, plot
            outputOpen1: [],
            outputOpen2: [],
            outputOpen3: [],
            outputOpen4: [],
        };
        var output = "";
        var type = "";
        for (var letter of configuration) {
            if (parseInt(letter)) {
                output = "outputOpen" + letter;
                type = "";
            } else if (output && !type) {
                if (letter == "A") {
                    type = "Analytics";
                } else {
                    type = "Plots";
                }
            } else {
                var display;
                if (encode && type === "Analytics") {
                    switch (letter) {
                        case "B":
                            display = "Basic Data";
                            break;
                        case "D":
                            display = "DNA Sequence";
                            break;
                        case "T":
                            display = "Transitions Table";
                            break;
                    }
                } else if (encode && type === "Plots") {
                    switch (letter) {
                        case "G":
                            display = "GC Content Plot";
                            break;
                        case "N":
                            display = "Nucleotide Content Plot";
                            break;
                    }
                } else if (!encode && type === "Analytics") {
                    switch (letter) {
                        case "D":
                            display = "Decode Output";
                            break;
                    }
                } 
                config[output] = [type, display]
            }
        }
        // put empty strings in the ones that aren't filled
        for (var pair of Object.entries(config)) {
            if (pair[1].length == 0) {
                config[pair[0]] = ["", ""]
            }
        }
        return config;
    }
    const putOutputInInput = (valueInOutput, canDisplayFull, putInToDecode) => {
        if (!canDisplayFull) {
            alert("Full sequences too long, sorry!");
            return;
        }

        if (putInToDecode) {
            setToDecode(valueInOutput);
            setOpenDict({ ...openDict, "decodeOpen": true });

        } else {
            setToEncode(valueInOutput);
            setOpenDict({ ...openDict, "textStringOpen": true });

        }
    }

    const constructDecodeItem = (inputType, inputName, fileName, date, canDisplayFull, metadataDict, decodedFileType, url) => {
        var item = {
            "encode": false,
            "inputType": inputType,
            "inputName": inputName,
            "basicFileName": fileName,
            "date": date,
            "canDisplayFull": canDisplayFull,
            "metadataDict": metadataDict,
            "decodedFileType": decodedFileType,
            // has to be converted to blob and available at frontend
            "decodedDisplayUrl": url,
        }
        return item;
    }
    const constructEncodeItem = (inputType, inputName, fileName, date, preview, canDisplayFull, metadataDict, data) => {
        var item = {
            "encode": true,
            "inputType": inputType,
            "inputName": inputName,
            "basicFileName": fileName,
            "date": date,
            "preview": preview,
            "canDisplayFull": canDisplayFull,
            "metadataDict": metadataDict,
            "gcContent": data,
        }
        return item;
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
            if (!input) return null;
            setToDecode(input);
        }
        const options = {
            method: "POST",
            body: JSON.stringify({ "input": input }),
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
        setLoading(true);
        setMode("default");
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
            options = getJsonOptions(false);
            if (!options) return;
        }
        const url = getUrl("decode", inputType);
        // var canDisplayFull;

        var fileName;
        var date;
        var decodedFileType;
        var canDisplayFull;
        var metadataDict = {};
        // setMode("decode");
        // UPDATE THIS
        fetch(url, options)
            .then((data) => {
                if (data.ok) {
                    for (var pair of data.headers.entries()) {
                        switch (pair[0]) {
                            case "address_length":
                                metadataDict["addressLength"] = pair[1];
                                break;
                            case "synthesis_length":
                                metadataDict["synthesisLength"] = pair[1];
                                break;
                            case "can_display_full":
                                canDisplayFull = pair[1] === "True";
                                break;
                            case "base_file_name":
                                fileName = pair[1];
                                break;
                            case "date":
                                date = new Date(parseInt(pair[1]));
                                break;
                            case "mimetype":
                                decodedFileType = pair[1];
                            // can't do dec_string because of \n
                        }
                    }
                    return data.blob()
                } else {
                    alert('An error has occurred returning the data. Check console for data log.');
                    console.log("Error!");
                    console.log(data);
                }
            })
            .then((data) => {
                setSelectedDisplay({
                    outputOpen1: ["Analytics", "Decode Output"],
                    outputOpen2: ["Analytics", ""],
                    outputOpen3: ["Plots", ""],
                    outputOpen4: ["Plots", ""],
                });
                // display the decoded file and make it downloadable
                var url = URL.createObjectURL(data);
                var inputName = inputType === "file" ? fileToDecode.name : toDecode;
                var item = constructDecodeItem(inputType, inputName, fileName, date, canDisplayFull, metadataDict, decodedFileType, url);
                if (decodedFileType.includes("text")) {
                    const reader = new FileReader();
                    reader.onload = async (event) => {
                        const text = (event.target.result);
                        console.log(text.slice(0, 5000));
                        // max file size = 5000, so cut off at 5000 chars.
                        // preview = text.slice(0, 5000);
                        item["preview"] = text.slice(0, 5000)
                        updateStatesForDecoding(item);
                    };
                    reader.readAsText(data);
                } else {
                    item["preview"] = "";
                    updateStatesForDecoding(item);
                }
                updateAllDisplaysWithItem(item);
            })
            .catch((error) => {
                alert('Catch: An error has occurred returning the data. Check console for data log.');
                console.log('heres the error!');
                console.log(error);
            });
    }

    const parseHeaders = (headers, callGetHistory) => {
        var fileName = "", date = "", canDisplayFull = "",
            preview = "", configuration = "", encode = "",
            inputType = "", inputName = "", synthesisLength = "",
            decodedFileType = "";
        var metadataDict = {};
        for (var pair of headers.entries()) {
            switch (pair[0]) {
                case "payload_trits":
                    metadataDict["payloadData"] = pair[1];
                    break;
                case "letter_dict":
                    metadataDict["nucleotideContent"] = JSON.parse(pair[1].replaceAll(' ', '').replaceAll("'", '"'));
                    break;
                case "transitions":
                    metadataDict["transitions"] = JSON.parse(pair[1].replaceAll(' ', '').replaceAll("'", '"'));
                    break;
                case "address_length":
                    metadataDict["addressLength"] = pair[1];
                    break;
                case "gc_content_fname":
                    metadataDict["gcContentPath"] = pair[1];
                    break;
                case "preview":
                    preview = pair[1];
                    break;
                case "date":
                    date = new Date(parseInt(pair[1]));
                    break;
                case "base_file_name":
                    fileName = pair[1];
                    break;
                case "num_sequences":
                    metadataDict["numSequences"] = pair[1];
                    break;
                case "can_display_full":
                    canDisplayFull = pair[1] === "True";
                    break;
                case "configuration":
                    configuration = pair[1];
                    break;
                case "encode":
                    encode = pair[1] === "True";
                    break;
                case "input_type":
                    inputType = pair[1];
                    break;
                case "input_name":
                    inputName = pair[1];
                    break;
                case "synthesis_length":
                    synthesisLength = pair[1];
                    break;
                case "mimetype":
                    decodedFileType = pair[1];
            }
        }
        var arr = [metadataDict, preview, date, fileName, canDisplayFull];
        if (callGetHistory) {
            for (var attribute of [configuration, encode, inputType, inputName, synthesisLength, decodedFileType]) {
                arr.push(attribute);
            }
        }
        return arr;
    }
    // ENCODE FILES ONLY
    const codecGetFile = (inputType) => {
        setLoading(true);
        // prevent it going into OutputElementTemplate unless the current process job
        // is ready.
        setMode("default");
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
        var fileName = "", date = "", canDisplayFull = "", preview = "";
        var metadataDict = {};
        fetch(url, options)
            .then((data) => {
                if (data.ok) {
                    [metadataDict, preview, date, fileName, canDisplayFull] = parseHeaders(data.headers);
                    return data.text();
                } else {
                    alert('An error has occurred returning the data. Check console for data log.');
                    console.log("Error!");
                    console.log(data);
                }
            })
            .then((data) => {
                // TO DO - enc_string will already be up to 5000 chars
                // var preview = encoded.slice(0, 5000);
                var inputName = inputType === "file" ? fileToEncode.name : toEncode;
                var item = constructEncodeItem(inputType, inputName, fileName, date, preview, canDisplayFull, metadataDict, data);
                // if (Object.keys(processJobDisplays).length == 0) {
                // only set the job displays for the very first encoding.
                setSelectedDisplay(encodeInitialDisplay);
                updateAllDisplaysWithItem(item);
                // }
                updateStatesForEncoding(data, item);
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
    const encodeOutputElements = <EncodeOutputElements selectedDisplays={selectedDisplays}
        setSelectedDisplay={setSelectedDisplay}
        processJobDisplays={processJobDisplays}
        setProcessJobDisplay={setProcessJobDisplay}
        history={history}
        loading={loading}
        putOutputInInput={putOutputInInput}
        getFasta={getFasta}
        setOpenDict={setOpenDict}
        openDict={openDict}
        mode={mode}
        putOutputInInput={putOutputInInput}
    />;

    return (
        <div>
            <div>
                <h3>History</h3>
                <table>
                    <tbody>
                        {history.map((item, i) => {
                            return (
                                <tr key={i}>
                                    {Object.entries(item).map(([key, value]) => {
                                        if (key === "gcContent" || key === "metadataDict") return;
                                        return (<td key={i + key}>{value.toString()}</td>);
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
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
                                            </div>
                                            <div className="w-col w-col-8">
                                                {/* <div className="output-sub-block dna-seq-output-block">
                                                    {mode === "decode" ? <button onClick={putOutputInInput} value="Copy to Input" className="submit-button copy-dna-seq-to-input-submit-button w-button">Copy DNA Sequence to Input</button> : null}
                                                </div> */}

                                            </div>
                                        </div>
                                    </div>
                                    {(mode === "encode" || mode === "decode") && encodeOutputElements}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


const EncodeOutputElements = (props) => {
    const outputElements = [];
    var encodeTypes = [
        ["Analytics", ["Basic Data", "DNA Sequence", "Transitions Table"]],
        ["Plots", ["GC Content Plot", "Nucleotide Content Plot"]]
    ];
    var decodeTypes = [
        ["Analytics", ["Decode Output"]]
    ];
    for (var i = 1; i < 5; i++) {
        const currProcessJob = props.processJobDisplays["outputOpen" + String(i)]
        const openName = "outputOpen" + String(i);
        outputElements.push(
            <OutputElementTemplate
                // types must be ordered!!!
                key={i}
                encodeTypes={encodeTypes}
                decodeTypes={decodeTypes}
                selectedDisplays={props.selectedDisplays}
                setSelectedDisplay={props.setSelectedDisplay}
                openName={openName}
                processJobDisplays={props.processJobDisplays}
                setProcessJobDisplay={props.setProcessJobDisplay}
                history={props.history}
                displays={{
                    "Basic Data": (<OutputBox
                        addressLength={currProcessJob["metadataDict"]["addressLength"]}
                        payloadTrits={currProcessJob["metadataDict"]["payloadData"]}
                        mode={props.mode}
                        numSequences={currProcessJob["metadataDict"]["numSequences"]}
                        nucleotideContent={currProcessJob["metadataDict"]["nucleotideContent"]} />),
                    "DNA Sequence": (<DNABox
                        loading={props.loading}
                        preview={currProcessJob["preview"]}
                        canDisplayFull={currProcessJob["canDisplayFull"]}
                        putOutputInInput={props.putOutputInInput}
                        getFasta={props.getFasta}
                    />),
                    "Transitions Table": <TransitionsTable transitions={currProcessJob["metadataDict"]["transitions"]} />,
                    "GC Content Plot": <GCGraph gcContent={currProcessJob["gcContent"]} gcContentPath={currProcessJob["metadataDict"]["gcContentPath"]}
                        inputWidth={500} inputHeight={500} />,
                    "Nucleotide Content Plot": <NucleotideGraph
                        nucleotideContent={currProcessJob["metadataDict"]["nucleotideContent"]}
                        inputWidth={500}
                        inputHeight={500}
                    />,
                    "Decode Output": <DecodeOutput loading={props.loading} putOutputInInput={props.putOutputInInput}
                        currProcessJob={currProcessJob} />,
                }}
                dependencies={{
                    "Analytics": [props.mode, currProcessJob["inputName"], props.selectedDisplays[openName][1]],
                    "Plots": [props.mode, props.loading, currProcessJob["inputName"], props.selectedDisplays[openName][1]],
                }}
                loading={props.loading}
                // Can't use this because if you choose from a dropdown, it won't reset 
                // the mode. Can't have only one mode, each element is different.
                // mode={props.mode}
                setOpenDict={props.setOpenDict}
                openDict={props.openDict}
            />);
    }
    return (
        <div className="w-layout-grid output-block-grid">
            {outputElements}
        </div>);
}

const FileInput = React.memo((props) => {
    console.log('rerendering the file input');
    const wrapperRef = useRef(null);
    useChangeAlerter(wrapperRef, props.setUploadLoading, props.readFile);
    return (
        <input
            ref={wrapperRef}
            style={{ width: "110px" }} type="file"
            className="submit-button w-button input-file-upload-submit-button" />
    );
});

const areEqual = (prevProps, nextProps) => {
    return prevProps.fileToProcess == nextProps.fileToProcess && prevProps.uploadLoading == nextProps.uploadLoading;
}
const FileInputWrapper = React.memo((props) => {
    console.log('here are the props');
    console.log(props);
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
}, areEqual);


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
                analytics={props.analytics} setAnalytics={props.setAnalytics}
                plots={props.plots} setPlots={props.setPlots}
                processJobDisplays={props.processJobDisplays} setProcessJobDisplay={props.setProcessJobDisplay}
                // separate into things can't be changed by child elements (then we can
                // put in a dictionary)
                mode={props.mode}
                loading={props.loading}
                history={props.history}
                putOutputInInput={props.putOutputInInput}
                getFasta={props.getFasta}
                gcContent={props.gcContent} inputWidth={props.width} inputHeight={props.height}

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