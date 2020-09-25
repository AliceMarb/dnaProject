import React, { useState, useRef } from 'react';
import * as d3 from 'd3';

const EncodeDecodeContainer = () => {
    const [mode, setMode] = useState("default");
    const [toEncode, setToEncode] = useState("");
    const [toDecode, setToDecode] = useState("");
    const [payloadTrits, setPayloadTrits] = useState("");
    const [addressLength, setAddressLength] = useState("");
    const [synthesisLength, setSynthesisLength] = useState("");
    const [encodeHistory, setEncHistory] = useState([]);
    const [decodeHistory, setDecHistory] = useState([]);

    // acts like a class member, e.g. props or state, but without
    // a class. So it is retained between renders.
    // is set with its .current property
    const d3Container = useRef();


    const InfoBox  = () => {
        let card;
        if (mode === "default") {
            console.log('Does this keep changing?')
            // return  <h1>Empty!</h1>;
            return <h2></h2>;
        } else if (mode === "encode") {
            return  (
                <div>
                    <h2>Payload Trits: {payloadTrits}</h2>
                    <h2>Address Length: {addressLength}</h2>
                    <svg 
                        ref={d3Container}
                        className="graphContainer"
                    />
                </div>
            );
        } else {
            // decode 
            return  (
                <div>
                    <h2>Synthesis Length: {synthesisLength}</h2>
                    <h2>Address Length: {addressLength}</h2>
                </div>
            );
        }
    }
    const encodeText = (event) => {
        event.preventDefault();
        const options = {
            method: "POST",
            body: JSON.stringify({"input": toEncode}),
            headers: new Headers({
              'content-type': 'application/json',
              dataType: "json",
            }),
        };
        var url = "encode_string"
        if (window.location.href.includes('dev')) {
            url = "/dev/" + url;
        } else if (window.location.href.includes('master')){
            url = "/master/" + url;
        }
        console.log(url);
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
            generateGraph(data['letter_dict']);
        })
        .catch((error) => {
            alert('Catch: An error has occurred returning the data. Check console for data log.');
            console.log(error);
        });
    }
    const decodeText = (event) => {
        event.preventDefault();
        var cleanDNA = errorCheckDNA(toDecode);
        if (!cleanDNA) {
            return;
        }
        const options = {
            method: "POST",
            body: JSON.stringify({"input": cleanDNA}),
            headers: new Headers({
              'content-type': 'application/json',
              dataType: "json",
            }),
        };
        var url = "decode_string"
        if (window.location.href.includes('dev')) {
            url = "/dev/" + url;
        } else if (window.location.href.includes('master')){
            url = "/master/" + url;
        }
        console.log(url);
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
    
        var svg = d3.select(d3Container.current).append("svg")
          .attr("width", svgWidth)
          .attr("height", svgHeight)
          .attr("class", "graphSvg")
        
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
          .text("Frequency of letter in DNA");
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
    }

    const ResultBox = () => {
        if (mode === "encode"){
            return <textarea className="output_word" value={encodeHistory[0][1]} readOnly></textarea>;
        } 
        else if (mode === "decode") {
            return <textarea className="output_word" value={decodeHistory[0][1]} readOnly></textarea>;
        }
        else {
            return <textarea className="output_word" readOnly></textarea>;
        }
    }
    return (
        <div>
            <h1>Hi!</h1>
            <form onSubmit={encodeText}>
                <textarea className="Something" value={toEncode} onChange={handleEncodeText} placeholder="Type your string here... e.g. hello"></textarea>
                <input type="submit" name="submit_button_str" value="Encode your input!"/>
            </form>
            <form id="dna_form" onSubmit={decodeText}>
                <textarea value={toDecode} onChange={handleDecodeText} name="word"
                placeholder="Type your DNA here... e.g. TCACA,TCAGC,TAGAG,TAGAG,TAGTC"></textarea>
                <input type="submit" name="submit_button_dna" value="Decode DNA"/>
            </form>
            <ResultBox/>
            <InfoBox/>
            {/* <textarea id="output_word" value={displayResult()} readOnly></textarea> */}
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
    for (let i = 0; i < testInput.length; i++) {
        let c = testInput.charAt(i);
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