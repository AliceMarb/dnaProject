import React, { useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';

const generateGraph = (props) => {
    var data = d3.entries(props.nucleotideContent);
    // console.log('data ');
    // console.log(data);

    var numBars = Object.keys(data).length;
    // var barWidth = 80;
    // var yAxisHeight = 400;
    // var xAxisWidth = (barWidth + marginBetweenBars) * numBars;

    var margin = { top: 30, right: 30, bottom: 30, left: 60 };
    var groupXOffset = 100;
    var groupYOffset = 80;

    var yAxisHeight = props.inputHeight - margin.top - margin.bottom - groupYOffset;

    var xAxisWidth = (props.inputWidth - margin.left - margin.right - groupXOffset);

    var marginBetweenBars = 5;
    var barWidth = xAxisWidth / numBars - marginBetweenBars;

    var maxBarHeight = d3.max(data, function (d) {
        return d.value;
    });

    // y axis has the frequency of letters appearing in the DNA template
    var yScale = d3.scaleLinear()
        .range([yAxisHeight, 0])
        .domain([0, maxBarHeight]);
    // X axis has the four letters
    var xScale = d3.scaleBand()
        .range([0, xAxisWidth])
        .domain(Object.keys(props.nucleotideContent));

    const ref = useRef(null);

    useEffect(() => {
        console.log('rerendering!');
        console.log(props.nucleotideContent);
    }, [props.nucleotideContent]);
    useEffect(() => {
        d3.select(ref.current).selectAll("*").remove();
        const g = d3.select(ref.current);
        console.log('inside use effect');
        console.log(data);
        // g.append("g")
        //     // transformation applied to all chldren of the group
        //     .attr("transform", "translate(" + groupXOffset + "," + groupYOffset + ")");
        g.append("g")
            .attr("transform", "translate(0," + yAxisHeight + ")")
            .call(d3.axisBottom(xScale))
            .append("text")
            .classed('label plot-label', true)
            .attr('class', 'label plot-label')
            .style("fill", "black")
            .attr("y", 40)
            .attr("x", xAxisWidth / 2)
            .text("DNA letter");
        g.append("g")
            .attr("transform", "translate(0," + 0 + ")")
            .call(d3.axisLeft(yScale))
            .append("text")
            .classed('label plot-label', true)
            .attr('class', 'label plot-label')
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
            .attr("width", barWidth)
            .attr("height", function (d) {
                return yAxisHeight - yScale(d.value);
            });
    }, [props.nucleotideContent])
    // var svgWidth = xAxisWidth + groupXOffset;
    // var svgHeight = yAxisHeight + margin;

    // select(d3Container.current).
    // return useMemo(() => {
        return (
            <div>
                <svg
                    preserveAspectRatio="xMinYMin"
                    viewBox={"0 0 " + (props.inputWidth) + " " + (props.inputHeight + groupYOffset)}
                    svg-content-responsive="true"
                    svg-container="true"
                    className="nucleotideContent"
                    // width={(props.inputWidth) + "px"}
                    // height={(props.inputHeight + groupYOffset) + "px"}
                >
                    <g ref={ref} transform={`translate(${groupXOffset}, ${groupYOffset})`}></g>
                </svg>
            </div>
        )
    // }, [props.nucleotideContent]);
}

const NucleotideGraph = (props) => {
    // console.log(props.nucleotideContent);
    return generateGraph(props);
}

export default NucleotideGraph;