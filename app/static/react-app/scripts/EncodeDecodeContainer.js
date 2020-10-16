import React, { useState, useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
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
// import hi from '../public/frontend_textfiles/hi.txt';
// import file from '../../../../app/codec_files/gc_content_rawBpa.txt';

const EncodeDecodeContainer = () => {
    const useFocus = () => {
        const htmlElRef = useRef(null)
        const setFocus = () => { htmlElRef.current && htmlElRef.current.focus() }

        return [htmlElRef, setFocus]
    }


    const [mode, setMode] = useState("default");
    const location = useLocation();
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
    // const [inputRef, setInputFocus] = useFocus();
    const [loading, setLoading] = useState(false);
    // const [forceInputOverride, setForce] = useState(false);
    const [editingRef, setEditing] = useState(null);
    const [fileToEncode, setFileToEncode] = useState(null);
    const [decodeOpen, setDecodeOpen] = useState(false);
    const [textStringOpen, setTextStringOpen] = useState(false);
    const [expandableOpen, setExpandableOpen] = useState(true);
    // acts like a class member, e.g. props or state, but without
    // a class. So it is retained between renders.
    // is set with its .current property
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


    const OutputBox = () => {
        var card;
        if (mode === "default") {
            // return  <h1>Empty!</h1>;
            return (
                <div className="output-sub-block basic-data-block">
                    <div className="label basic-data-block-label">DATA</div>
                </div>
            );
        } else if (mode === "encode") {
            card = (
                <div className="div-block-3">
                    <div className="text-block-6 payload-length-label">Payload Data</div>
                    <div className="payload-output-value">{payloadTrits}</div>
                </div>
            );
        } else {
            card = (
                <div className="div-block-3">
                    <div className="text-block-6 payload-length-label">Synthesis Length</div>
                    <div className="payload-output-value">{synthesisLength}</div>
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
                        <div className="address-length-output-value">{addressLength}</div>
                    </div>
                </div>
            </div>
        );
    }
    const ExpandableBox = (props) => {
        // console.log('rerendering edxpandable box');
        // const [open, setOpen] = useState(true);
        var collapse;
        if (props.renderWaitingScreen && loading) {
            collapse = (
                <Collapse in={expandableOpen}>
                    <img src={bunny} width="600px" height="450px" />
                </Collapse>);

        } else {
            collapse = (<Collapse in={expandableOpen}>
                {props.children}
            </Collapse>);
        }
        return (
            <div key={props.divKey}>
                <Button
                    onClick={() => {
                        setExpandableOpen(!expandableOpen);
                    }
                    }
                    aria-controls="example-collapse-text"
                    aria-expanded={expandableOpen}
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

    const InputBox = (props) => {
        // const [stringToEncode, setStringToEncode] = useState("");
        // const [open, setOpen] = useState(true);
        // console.log('encode:' + toEncode);

        const handle = (e) => {
            setToEncode(e.target.value);
            setEditing(encodeInput);

        }

        return (
            <>
                <Button
                    onClick={() => setTextStringOpen(!textStringOpen)}
                    aria-controls="example-collapse-text"
                    aria-expanded={textStringOpen}
                    variant="customized-accordion-closed"
                    className={"accordion-closed-item-trigger"}
                    key="bitton"
                >
                    <h3 className={"accordion-label "}>Text String</h3>
                </Button>
                <Collapse in={textStringOpen}>
                    <form onSubmit={(e) => callCodecHandler(e, toEncode)}>
                        <textarea
                            value={toEncode}
                            onChange={(e) => handle(e)}
                            placeholder="Text string, e.g. &quot;Hello&quot;"
                            maxLength={5000}
                            className="textarea w-input"
                            type="text"
                            required="required"
                            ref={encodeInput}
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
    const DecodeInputBox = React.memo((props) => {
        // console.log('rerendering decode box')
        const handle = (e) => {
            if (e.target.value.match(/^[agctAGCT,]*$/)) {
                setToDecode(e.target.value);
            }
            setEditing(decodeInput);
        }
        return (
            <>
                <Button
                    onClick={() => setDecodeOpen(!decodeOpen)}
                    aria-controls="example-collapse-text"
                    aria-expanded={decodeOpen}
                    variant="customized-accordion-closed"
                    className={"accordion-closed-item-trigger " + "input-dna-seq-decode-block-button"}
                    key="bitton"
                >
                    <h3 className={"accordion-label "}>DNA&nbsp;Sequence Decode</h3>
                </Button>
                <Collapse in={decodeOpen}>
                    <form onSubmit={(e) => callCodecTyped(e, "decode", toDecode)} className="form">
                        <div className="accordion-item-content">
                            <textarea value={toDecode} onChange={(e) => handle(e)}
                                placeholder="DNA sequence, e.g. AGATGAG, ACGATCA, ATACTCT, TCGTCTC, TACGACT,"
                                maxLength={5000}
                                className="textarea w-input input-dna-sequence-textarea"
                                id="DNA-Input2" name="DNA-Input"
                                ref={decodeInput}
                            />
                            <input type="submit" value="Decode" className="submit-button w-button input-dna-seq-decode-submit-button" />
                        </div>
                    </form>
                </Collapse>
            </>
        );
    });
    
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
                                        {mode != "decode" && gcContentPath && gcContent ?  child : null}
                                        {/* <GCGraph gcContentPath={gcContentPath} inputWidth={width} inputHeight={height} /> */}
                                    </div>
                                </div>
                            </div>
                        </ExpandableBox>
                    </div>
                </div>
                {/* <div className="output-sub-block nc-content-plot-block">
                    <div className="label nc-content-plot-block-label">Nucleotide content plot</div>
                    <div className="nc-content-block-value">
                        <div className="w-embed">GC conten%</div>
                    </div>
                </div> */}
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
                    alert('An error has occurred returning the data. Check console for data log.');
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

    const handlecallCodecTyped = (e) => {
        setToEncode(e.target.value);
    }
    const handleDecodeText = (e) => {
        setToDecode(e.target.value);
    }

    const ResultBox = () => {
        // console.log('encode history');
        // console.log(encodeHistory);
        return <textarea value={loading ? "Loading results!" : (mode === "encode" ? encodeHistory[0][1] : (mode === "decode" ? decodeHistory[0][1] : ""))} readOnly
            disabled="disabled" placeholder={loading ? "Loading results!" : "DNA Sequence Output"} maxLength={5000} id="DNA-Sequence-Output" name="DNA-Sequence-Output" className="dna-seq-output-text-area w-input"></textarea>;
    }

    const putOutputInInput = (e) => {
        if (mode === "encode") {
            if (encodeHistory.length == 0) {
                alert('Please encode something first');
            } else {
                setToDecode(encodeHistory[0][1]);
                setDecodeOpen(true);
            }
        } else {
            if (decodeHistory.length == 0) {
                alert('Please encode something first');
            } else {
                setToEncode(decodeHistory[0][1]);
                setTextStringOpen(true);
            }
        }
    }
    const codecGetFile = (input, buttonType, inputType) => {
        setLoading(true);
        var options;
        
        if (inputType === "textFile") {
            if (!fileToEncode) {
                alert('Choose a file first!');
                setLoading(false);
                return;
            }
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
                    console.log(data.headers);
                    for (var pair of data.headers.entries()) {
                        console.log(pair[0] + ': ' + pair[1]);
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
                    // if (!encStringFound) {
                    //     setEncHistory((encodeHistory) => [["", encoded], ...encodeHistory]);
                    // }
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


    return (
        <div>
            <div className="body-4">
                <div>
                    <div className="section-heading-wrap">
                        <h2 className="heading-2 dna-synthesizer-title">DNA Synthesizer<br /></h2>
                        <div className="label cc-light dna-synthesizer-short-title">Encode your data into our synthetic dna<br /></div>
                    </div>
                    <div className="main-body-section">
                        {/* <div className="panel-nav">
                            <div data-w-id="555ec916-369b-67ad-10b5-ae562a9d19f6" className="panel-trigger">
                                <h3 className="accordion-label">Input</h3>
                                <img src={arrow} loading="lazy" width="10" alt="" className="accordion-arrow" />
                            </div>
                        </div> */}
                        <div className="panel-block">
                            <div className="input-block">
                                <div className="panel-title">
                                    <h4 className="heading-6">Input</h4>
                                </div>
                                <div className="accordion-wrapper">
                                    <div className="w-form">
                                        <InputBox />
                                        <DecodeInputBox toDecode={toDecode}/>
                                        <div className="accordion-closed-item input-file-upload-block">
                                            <ExpandableBox
                                                labelClass="input-file-upload-block-label"
                                                buttonLabel="Upload file"
                                                buttonClass="input-file-upload-block-button"
                                                renderWaitingScreen={false}
                                                key="upload-box"
                                                divKey="anotherkey"
                                            >
                                                <div className="accordion-item-content">
                                                    <input style={{width :"120px"}} type="file" accept=".txt,.md" onChange={(e) => readFile(e)} className="submit-button w-button input-file-upload-submit-button" />
                                                    <div className="text-block-6 payload-length-label">File Chosen: {fileToEncode ? fileToEncode.name : null}</div>
                                                    <input
                                                        onClick={() => codecGetFile(null, "encode", "textFile")}
                                                        type="submit"
                                                        name="submit_button_str"
                                                        value="Encode File"
                                                        className="submit-button w-button input-encode-submit-button"  
                                                    />
                                                </div>

                                            </ExpandableBox>
                                            {/* <div className="accordion-closed-item-trigger input-file-upload-block-button">
                                                    <h3 className="accordion-label input-file-upload-block-label">Upload file</h3>
                                                    <img src={arrow} loading="lazy" width={10} alt="" className="accordion-arrow" />
                                                </div> */}

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
                                                <OutputBox />
                                                <div className="output-sub-block nc-content-plot-block">
                                                    <div className="label nc-content-block-label">Nucleotide content</div>
                                                    <div className="w-layout-grid grid-2 nc-content-value-grid-block">
                                                        {
                                                            Object.entries(nucleotideContent)
                                                                .map(([key, value]) => <div className="nc-content-value" key={key}><strong>{key}: </strong>{value}</div>)
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-col w-col-8">
                                                <div className="output-sub-block dna-seq-output-block">
                                                    <div className="label dna-seq-output-block-label">DNA Sequence</div>
                                                    {/* <textarea placeholder="Sample DNA Sequence Output Box, will hide on page load. Only here for style/layout purposes" maxLength={5000} id="DNA-Sequence-Output" data-name="DNA Sequence Output" name="DNA-Sequence-Output" data-w-id="d6157cf2-1d65-a330-ced7-868e330b1164" style="display:none" className="textarea-2 w-input"></textarea> */}
                                                    <ResultBox />
                                                    <button onClick={putOutputInInput} value="Copy DNA Sequence to Input" className="submit-button copy-dna-seq-to-input-submit-button w-button">Copy DNA Sequence to Input</button>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                    <GraphBox key="graphbox"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
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

const GCHistogram = (props) => {
    // Make a histogram of % GC Content vs frequency
    console.log('start rendering histogram!!!');
    var margin = { top: 10, right: 30, bottom: 30, left: 60 },
        width = props.inputWidth - margin.left - margin.right,
        height = props.inputHeight - margin.top - margin.bottom - 20;
    var groupXOffset = 100;
    var groupYOffset = 50;

    var xScale = d3.scaleLinear()
        .range([0, width])
        .domain([0, 1.0]);


    var histogram = d3.histogram()
        .value(function (d) { return d.percentageGC; })   // I need to give the vector of value
        .domain(xScale.domain())  // the domain of the graphic
        .thresholds(xScale.ticks(70)); // the numbers of bins

    var bins = histogram(props.data);
    var yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(bins, function (d) { return d.length; })]);

    const ref = useRef(null);
    useEffect(() => {
        const g = d3.select(ref.current);
        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale))
            .append("text")
            .style("font", "20px times")
            .style("fill", "black")
            .attr("y", 40)
            .attr("x", width / 2)
            .text("% GC Content per Sequence");
        g.append("g")
            .attr("transform", "translate(0," + 0 + ")")
            .call(d3.axisLeft(yScale))
            .append("text")
            .style("font", "20px times")
            .attr("transform", "rotate(-90)")
            .style("fill", "black")
            .attr("y", -50)
            .attr("x", -120)
            .text("Frequency");
        g.selectAll("rect")
            .data(bins)
            .enter()
            .append("rect")
            .attr("transform", function (d) { return "translate(" + xScale(d.x0) + "," + yScale(d.length) + ")"; })
            .attr("width", function (d) {
                // if (xScale(d.x1) - xScale(d.x0) -1 < 0) {
                //     console.log(`width below 0! x0 (min): ${d.x0} x1 (max) ${d.x1}`);
                //     return 10;
                // }
                return xScale(d.x1) - xScale(d.x0); 
                // return 10;
            })
            .attr("height", function (d) { return height - yScale(d.length); })
            .style("fill", "#69b3a2")
            .text(function (d) {return d.x0 + "," + d.x1;});

    }, [])
    return (
        <div key="histogram">
            <svg
                preserveAspectRatio="xMinYMin"
                viewBox={"0 0 " + (props.inputWidth + groupXOffset) + " " + (props.inputHeight + groupYOffset)}
                svg-content-responsive="true"
                svg-container="true"
                className="gcHist"
                width={(props.inputWidth + groupXOffset) + "px"}
                height={(props.inputHeight + groupYOffset) + "px"}
            >
                <g ref={ref} transform={`translate(${groupXOffset}, ${groupYOffset})`}></g>
            </svg>
        </div>
    )
}

const GCGraph = (props) => {
    console.log('start rendering the gcgraph, are props different?');
    console.log(props);
    console.log('only re-render if this is different from before!' + props.gcContentPath);
    // const child =  () => handleGCData(props, d3.csvParse("percentageGC\n" + props.gcContent))
    return (
    <>{handleGCData(props, d3.csvParse("percentageGC\n" + props.gcContent))}</>
    );
}

const handleGCData = (props, gcContent) => {
    // console.log(gcContent);
    if (gcContent.length > 2000) {
        return (
            <GCHistogram data={gcContent} className="gcGraph"
                inputWidth={props.inputWidth}
                inputHeight={props.inputHeight}
                key="histogram"
            />
        );
    }
    var data = gcContent;

    // minus to make space for x label
    var margin = { top: 10, right: 30, bottom: 30, left: 60 },
        width = props.inputWidth - margin.left - margin.right,
        height = props.inputHeight - margin.top - margin.bottom - 20;
    var groupXOffset = 100;
    var groupYOffset = 50;

    if (data.length < 40) {
        var domain = [];
        var range = [];
        for (var i = 1; i < data.length + 1; i++) {
            domain.push(i);
            range.push((width / data.length) * (i - 1));
        }
        var xScale = d3.scaleLinear()
            .range(range)
            .domain(domain);
    } else {
        var xScale = d3.scaleLinear()
            .range([0, width])
            .domain([0, data.length]);
    }
    var yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, 1.0]);


    var radius = width / (data.length + 30);

    const ref = useRef(null);
    useEffect(() => {
        const g = d3.select(ref.current);
        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale)
                .tickValues(domain)
                .tickFormat(d3.format("d"))
            )
            .append("text")
            .style("font", "20px times")
            .style("fill", "black")
            .attr("y", 40)
            .attr("x", width / 2)
            .text("Sequence Number");
        g.append("g")
            .attr("transform", "translate(0," + 0 + ")")
            .call(d3.axisLeft(yScale))
            .append("text")
            .style("font", "20px times")
            .attr("transform", "rotate(-90)")
            .style("fill", "black")
            .attr("y", -50)
            .attr("x", -120)
            .text("% of letters that are G or C");
        g.selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function (d, i) {
                return xScale(i + 1);
            }
            )
            .attr("cy", function (d) {
                return yScale(d.percentageGC);
            })
            .attr("r", radius)
            .style("fill", "#69b3a2");
    }, [])

    return (
        <>
            <svg
                preserveAspectRatio="xMinYMin"
                viewBox={"0 0 " + (props.inputWidth + groupXOffset) + " " + (props.inputHeight + groupYOffset)}
                svg-content-responsive="true"
                svg-container="true"
                className="gcGraph"
                width={(props.inputWidth + groupXOffset) + "px"}
                height={(props.inputHeight + groupYOffset) + "px"}
            >
                <g ref={ref} transform={`translate(${groupXOffset}, ${groupYOffset})`}></g>
            </svg>
        </>
    )
}

const generateGraph = (input) => {
    console.log(input);
    d3.select(".graphSvg").remove();
    var data = d3.entries(input);
    console.log('data ');
    console.log(data);

    var margin = 200;
    var barWidth = 80;
    var marginBetweenBars = 5;
    var groupXOffset = 100;
    var groupYOffset = 50;

    var maxBarHeight = d3.max(data, function (d) {
        return d.value;
    });
    var yAxisHeight = 400;
    var numBars = Object.keys(input).length;
    var xAxisWidth = (barWidth + marginBetweenBars) * numBars;

    var svgWidth = xAxisWidth + groupXOffset;
    var svgHeight = yAxisHeight + margin;

    // select(d3Container.current).
    var svg = d3.create("svg")
        // .attr("width", svgWidth)
        // .attr("height", svgHeight)
        .attr("class", "graphSvg")
        .attr("preserveAspectRatio", "xMinYMin")
        .attr("viewBox", "0 0 600 400")
        .classed("svg-content-responsive", true)
        // .classed("svg-container", true)
        .attr("max-width", "100%")
        .attr("max-height", "100%")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("object-fit", "cover");


    // y axis has the frequency of letters appearing in the DNA template
    var yScale = d3.scaleLinear()
        .range([yAxisHeight, 0])
        .domain([0, maxBarHeight]);
    // X axis has the four letters
    var xScale = d3.scaleBand()
        .range([0, xAxisWidth])
        .domain(Object.keys(input));
    var g = svg.append("g")
        // transformation applied to all chldren of the group
        .attr("transform", "translate(" + groupXOffset + "," + groupYOffset + ")");

    g.append("g")
        .attr("transform", "translate(0," + yAxisHeight + ")")
        .call(d3.axisBottom(xScale))
        .append("text")
        .style("font", "20px times")
        .style("fill", "black")
        .attr("y", 40)
        .attr("x", xAxisWidth / 2)
        .text("DNA letter");
    g.append("g")
        .attr("transform", "translate(0," + 0 + ")")
        .call(d3.axisLeft(yScale))
        .append("text")
        .style("font", "20px times")
        .attr("transform", "rotate(-90)")
        .style("fill", "black")
        .attr("y", -50)
        .attr("x", -120)
        .text("Number of letters");
    g.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
            return xScale(d.key)
        })
        .attr("y", function (d) {
            return yScale(d.value);
        })
        .attr("width", barWidth - marginBetweenBars)
        .attr("height", function (d) {
            return yAxisHeight - yScale(d.value);
        });
    return svg;
}

export default EncodeDecodeContainer;