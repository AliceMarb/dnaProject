import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { useLocation } from 'react-router-dom';
// import './jquery.js';
// import $ from './jquery.js'; 
import $ from 'jquery';
// console.log('Hello:!' + $);
// import plugin from 'jquery-plugin';
window.jQuery = $;
import arrow from './arrow-mid-blue-down-96x96.png';
// import otherArrow from '../dist/arrow-mid-blue-down-96x96.png';


const EncodeDecodeContainer = () => {
    const [mode, setMode] = useState("default");
    const location = useLocation();
    const [toEncode, setToEncode] = useState("");
    const [toDecode, setToDecode] = useState("");
    const [payloadTrits, setPayloadTrits] = useState("");
    const [addressLength, setAddressLength] = useState("");
    const [synthesisLength, setSynthesisLength] = useState("");
    const [gcContent, setGCContent] = useState("");
    const [encodeHistory, setEncHistory] = useState([]);
    const [decodeHistory, setDecHistory] = useState([]);
    const [nucleotideContent, setNucleotideContent] = useState({});

    // acts like a class member, e.g. props or state, but without
    // a class. So it is retained between renders.
    // is set with its .current property
    const d3Container = useRef();
    const gcContainer = useRef();


    const OutputBox = () => {
        var card;
        if (mode === "default") {
            // return  <h1>Empty!</h1>;
            return (
                <div className="output-sub-block">
                    <div className="label">DATA</div>
                </div>
            );
        } else if (mode === "encode") {
            card = <p>Payload Trits: {payloadTrits}<br /></p>;

        } else {
            card = <p>Synthesis Length: {synthesisLength}<br /></p>;
        }
        return (
            <div className="output-sub-block">
                <div className="label">DATA</div>
                {card}
                <p>Address Length: {addressLength}<br /></p>
            </div>
        );
    }
    const GraphBox = () => {
        return (
            <div

            >
                <div
                    ref={d3Container}
                    svg-container="true"
                    className="graphContainer"
                    id="graph1"
                // svg-container="true"
                // preserveAspectRatio="xMinYMin"
                // viewBox= "0 0 600 400"
                // svg-content-responsive="true"

                />
                <div
                    ref={gcContainer}
                    className="graphContainer"
                    id="graph2"
                    svg-container="true"
                    preserveAspectRatio="xMinYMin"
                    viewBox="0 0 600 400"
                    svg-content-responsive="true"
                />
            </div>
        );
    }
    const encodeText = (event) => {
        event.preventDefault();
        // const location = useLocation();
        // console.log(location.pathname);
        const options = {
            method: "POST",
            body: JSON.stringify({ "input": toEncode }),
            headers: new Headers({
                'content-type': 'application/json',
                dataType: "json",
            }),
        };
        var url = "encode_string"
        if (location.pathname.includes('dev')) {
            url = "/dev/" + url;
        } else if (location.pathname.includes('master')) {
            url = "/master/" + url;
        }
        // console.log(url);
        fetch(url, options)
            .then((data) => {
                if (data.ok) {
                    // alert('returning json');
                    return data.json();
                } else {
                    alert('An error has occurred returning the data. Check console for data log.');
                    console.log("Error!");
                    console.log(data);
                }
            })
            .then((data) => {
                var encoded = data['word'];
                setEncHistory((encodeHistory) => [[toEncode, encoded], ...encodeHistory]);
                console.log([[toEncode, encoded], ...encodeHistory]);
                setMode("encode");
                setPayloadTrits(data['payload_trits']);
                setAddressLength(data['address_length']);
                // setGCContent(data['gc_content']);
                setNucleotideContent(data['letter_dict']);
                // grab straight from data because a state variable won't be ready
                // in time
                var svg = generateGraph(data['letter_dict']);
                d3.select(d3Container.current).append(
                    () => { return svg.node() }
                );
                var gcSvg = generateGCGraph(data['gc_content']);
                d3.select(gcContainer.current).append(
                    () => { return gcSvg.node() }
                );
            })
            .catch((error) => {
                alert('Catch: An error has occurred returning the data. Check console for data log.');
                console.log(error);
            });
    }
    const decodeText = (event) => {
        event.preventDefault();
        // const location = useLocation();
        var cleanDNA = errorCheckDNA(toDecode);
        if (!cleanDNA) {
            return;
        }
        const options = {
            method: "POST",
            body: JSON.stringify({ "input": cleanDNA }),
            headers: new Headers({
                'content-type': 'application/json',
                dataType: "json",
            }),
        };
        var url = "decode_string"
        if (location.pathname.includes('dev')) {
            url = "/dev/" + url;
        } else if (location.pathname.includes('master')) {
            url = "/master/" + url;
        }
        // console.log(url);
        fetch(url, options)
            .then((data) => {
                if (data.ok) {
                    // alert('returning json');
                    return data.json();
                } else {
                    alert('An error has occurred returning the data. Check console for data log.');
                    console.log(data);
                }
            })
            .then((data) => {
                var decoded = data['word'];
                setDecHistory((decodeHistory) => [[toDecode, decoded], ...decodeHistory]);
                console.log([[toDecode, decoded], ...decodeHistory]);
                setMode("decode");
                setSynthesisLength(data['synthesis_length']);
                setAddressLength(data['address_length']);

            })
            .catch((error) => {
                alert('An error has occurred returning the data. Check console for data log.');
                console.log(error);
            });
    }
    const handleEncodeText = (event) => {
        setToEncode(event.target.value);
    }
    const handleDecodeText = (event) => {
        setToDecode(event.target.value);
    }

    const ResultBox = () => {
        if (mode === "encode") {
            return <textarea value={encodeHistory[0][1]} readOnly
                disabled="disabled" placeholder="DNA Sequence Output" maxLength="5000" id="DNA-Sequence-output-2" name="DNA-Sequence-output" data-name="DNA-Sequence-output" className="textarea-2 w-input"></textarea>;
        }
        else if (mode === "decode") {

            return <textarea value={decodeHistory[0][1]} readOnly
                disabled="disabled" placeholder="DNA Sequence Output" maxLength="5000" id="DNA-Sequence-output-2" name="DNA-Sequence-output" data-name="DNA-Sequence-output" className="textarea-2 w-input"></textarea>;
        }
        else {
            return <textarea value="" readOnly
                disabled="disabled" placeholder="DNA Sequence Output" maxLength="5000" id="DNA-Sequence-output-2" name="DNA-Sequence-output" data-name="DNA-Sequence-output" className="textarea-2 w-input"></textarea>;
        }
    }
    return (
        <div>
            
            <div className="body-4">
                <div>
                    <div className="section-heading-wrap">
                        <h2 className="heading-2">DNA Synthesizer<br /></h2>
                        <div className="label cc-light">Encode your data into our synthetic dna<br /></div>
                    </div>
                    <div className="main-body-section">
                        <div className="panel-nav">
                            <div data-w-id="555ec916-369b-67ad-10b5-ae562a9d19f6" className="panel-trigger">
                                <h3 className="accordion-label">Input</h3>
                                <img src={arrow} loading="lazy" width={10} alt="" className="accordion-arrow" />
                            </div>
                        </div>
                        <div className="panel-block">
                            <div data-w-id="b3df5cfc-7716-175b-6877-256bb15805eb" className="input-block">
                                <div className="panel-title">
                                    <h4 className="heading-6">Input</h4>
                                </div>
                                <div className="accordion-wrapper">
                                    <div className="w-form">
                                        <form onSubmit={encodeText} id="wf-form-Encode-Text-Form" name="wf-form-Encode-Text-Form"
                                            data-name="Encode Text Form">
                                            <div className="accordion-closed-item">
                                                <div className="accordion-closed-item-trigger">
                                                    <h3 className="accordion-label">Text string</h3>
                                                    <img src={arrow} loading="lazy" width={10} alt="" className="accordion-arrow" />
                                                    <div className="accordion-item-content">
                                                        <textarea
                                                            value={toEncode}
                                                            onChange={handleEncodeText}
                                                            placeholder="Text string, e.g. &quot;Hello&quot;"
                                                            maxLength={5000}
                                                            data-name="TextInput"
                                                            id="TextInput-3"
                                                            name="TextInput"
                                                            className="textarea w-input"
                                                            type="text"
                                                            required="required"
                                                        >
                                                        </textarea>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="accordion-closed-item">
                                                <div className="accordion-closed-item-trigger">
                                                    <h3 className="accordion-label">Upload file</h3>
                                                    <img src={arrow} loading="lazy" width={10} alt="" className="accordion-arrow" />
                                                </div>
                                                <div className="accordion-item-content">
                                                    <input type="submit" value="Upload File" data-wait="Please wait..." className="submit-button w-button" />
                                                </div>
                                            </div>
                                            <input
                                                type="submit"
                                                name="submit_button_str"
                                                value="Encode"
                                                data-wait="Please wait..." className="submit-button w-button"
                                            />
                                        </form>
                                    </div>
                                </div>
                                <div className="form-block w-form">
                                    <form onSubmit={decodeText} id="wf-form-Decode-DNA-Form" name="wf-form-Decode-DNA-Form" data-name="Decode DNA Form" className="form">
                                        <div className="accordion-closed-item">
                                            <div className="accordion-closed-item-trigger">
                                                <h3 className="accordion-label">DNA&nbsp;Sequence Decode</h3><img src={arrow} loading="lazy" width={10} alt="" className="accordion-arrow" />
                                            </div>
                                            <div className="accordion-item-content">
                                                <textarea value={toDecode} onChange={handleDecodeText}
                                                    placeholder="DNA sequence, e.g. AGATGAG, ACGATCA, ATACTCT, TCGTCTC, TACGACT,"
                                                    maxLength={5000} id="DNA-Input" name="DNA-Input" data-name="DNA Input"
                                                    className="textarea w-input" />
                                                <input type="submit" value="Decode" data-wait="Please wait..." className="submit-button w-button" />
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                            <div className="column-2 w-col w-col-9">
                                <div className="output-block">
                                    <div className="w-form">
                                        <h4 className="heading-4">Output</h4>
                                        <div id="email-form" name="email-form" className="form-2">
                                            <div className="w-row">
                                                <div className="w-col w-col-4">
                                                    <OutputBox />
                                                    <div className="output-sub-block">
                                                        <div className="label">Nucleotide content</div>
                                                        <div className="w-layout-grid grid-2">
                                                            <div><strong>T: </strong>{nucleotideContent['T']}</div>
                                                            <div><strong>C:</strong> {nucleotideContent['C']}</div>
                                                            <div><strong>G:</strong> {nucleotideContent['G']}</div>
                                                            <div><strong>A:</strong> {nucleotideContent['A']}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="w-col w-col-8">
                                                    <div className="output-sub-block">
                                                        <div className="label">DNA Sequence</div>
                                                        {/* <textarea placeholder="Sample DNA Sequence Output Box, will hide on page load. Only here for style/layout purposes" maxLength="5000" id="DNA-Sequence-Output" data-name="DNA Sequence Output" name="DNA-Sequence-Output" data-w-id="d6157cf2-1d65-a330-ced7-868e330b1164" style="display:none" className="textarea-2 w-input"></textarea> */}
                                                        <div className="w-embed">
                                                            <ResultBox />
                                                        </div>
                                                    </div>
                                                </div>
                                                <GraphBox />
                                            </div>
                                        </div>
                                    </div>
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

const generateGCGraph = (gcContent) => {
    var data = gcContent;
    console.log(data);
    var margin = { top: 10, right: 30, bottom: 30, left: 60 },
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;
    // var maxYValue = d3.max(data);

    var svg = d3.create("svg")
        .attr("preserveAspectRatio", "xMinYMin")
        .attr("viewBox", "0 0 600 400")
        .classed("svg-content-responsive", true)
        // .attr("width", width + margin.left + margin.right)
        // .attr("height", height + margin.top + margin.bottom)
        .attr("class", "gcGraph")
        .classed("svg-container", true)
        // .attr("overflow", "visible");
        .attr("max-width", "100%")
        .attr("max-height", "100%")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("object-fit", "cover");



    var yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, 1.0]);

    var domain = [];
    var range = [];
    for (var i = 1; i < data.length + 1; i++) {
        domain.push(i);
        range.push((width / data.length) * (i - 1));
    }
    var xScale = d3.scaleLinear()
        .range(range)
        .domain(domain);

    var groupXOffset = 100;
    var groupYOffset = 50;
    var g = svg.append("g")
        // transformation applied to all chldren of the group
        // .classed("svg-content-responsive", true)
        .attr("transform", "translate(" + groupXOffset + "," + groupYOffset + ")");

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
            // console.log(i + 1);
            return xScale(i + 1);
        }
        )
        .attr("cy", function (d) {
            // console.log(d);
            return yScale(d);
        })
        .attr("r", 1.5)
        .style("fill", "#69b3a2");

    return svg;
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