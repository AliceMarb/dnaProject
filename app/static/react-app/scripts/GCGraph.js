import React, {useRef, useEffect} from 'react';
import * as d3 from 'd3';

const GCHistogram = (props) => {
    // Make a histogram of % GC Content vs frequency
    var groupXOffset = 100;
    var groupYOffset = 50;
    var margin = { top: 10, right: 30, bottom: 30, left: 60 },
        width = props.inputWidth - margin.left - margin.right - groupXOffset,
        height = props.inputHeight - margin.top - margin.bottom - groupYOffset;

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
        console.log('start rendering histogram!!!');
        console.log(props.gcContentPath);
        d3.select(ref.current).selectAll("*").remove();
        const g = d3.select(ref.current);
        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale))
            .append("text")
            .classed('label plot-label', true)
            .attr('class', 'label plot-label')
            .style("fill", "black")
            .attr("y", 40)
            .attr("x", width / 2)
            .text("% GC Content per Sequence");
        g.append("g")
            .attr("transform", "translate(0," + 0 + ")")
            .call(d3.axisLeft(yScale))
            .append("text")
            .classed('label plot-label', true)
            .attr('class', 'label plot-label')
            .attr("transform", "rotate(-90)")
            .style("fill", "black")
            .attr("y", -50)
            .attr("x", -90)
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
            .text(function (d) { return d.x0 + "," + d.x1; });

    }, [props.gcContentPath]);
    return (
        <div key="histogram">
            <svg
                preserveAspectRatio="xMinYMin"
                svg-content-responsive="true"
                svg-container="true"
                className="gcHist"
                viewBox={"0 0 " + (props.inputWidth) + " " + (props.inputHeight)}
                // width={(props.inputWidth) + "px"}
                // height={(props.inputHeight) + "px"}
            >
                <g ref={ref} transform={`translate(${groupXOffset}, ${groupYOffset})`}></g>
            </svg>
        </div>
    )
}

const GCGraph = (props) => {
    // const child =  () => handleGCData(props, d3.csvParse("percentageGC\n" + props.gcContent))
    return (
        <>{handleGCData(props, d3.csvParse("percentageGC\n" + props.gcContent))}</>
    );
}

const handleGCData = (props, gcContent) => {
    // console.log(gcContent);
    if (gcContent.length > 100) {
        return (
            <GCHistogram data={gcContent} className="gcGraph"
                inputWidth={props.inputWidth}
                inputHeight={props.inputHeight}
                gcContentPath={props.gcContentPath}
                key="histogram"
            />
        );
    }
    var data = gcContent;

    // minus to make space for x label
    var groupXOffset = 100;
    // make space for the y label at the bottom
    var groupYOffset = 50;
    var margin = { top: 30, right: 30, bottom: 30, left: 30 },
        width = props.inputWidth - margin.left - margin.right - groupXOffset,
        height = props.inputHeight - margin.top - margin.bottom - groupYOffset;


    if (data.length < 40) {
        var domain = [];
        var range = [];
        for (var i = 1; i < data.length + 1; i++) {
            domain.push(i);
            range.push((width / data.length) * (i - 1));
        }
        // if (range.length < 2) {
        //     range.push(0);
        // }
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
        console.log('rerendering graph!');
        console.log('has this changed?');
        console.log(props.gcContentPath);
    }, [props.gcContentPath]);
    
    useEffect(() => {
        if (data.length < 2) {
            // doesn't make sense to graph just one sequence
            return;
        } 
        console.log('start rendering gc graph. hello is this even working!!!');
        d3.select(ref.current).selectAll("*").remove();
        const g = d3.select(ref.current);
        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale)
                .tickValues(domain)
                .tickFormat(d3.format("d"))
            )
            .append("text")
            .attr('class', 'label plot-label')
            .classed('label plot-label', true)
            .style("fill", "black")
            .attr("y", 40)
            .attr("x", width / 2 - 25)
            .text("Sequence Number");
        console.log(g);
        g.append("g")
            .attr("transform", "translate(0," + 0 + ")")
            .call(d3.axisLeft(yScale))
            .append("text")
            .attr('class', 'label plot-label')
            .classed('label plot-label', true)
            .attr("transform", "rotate(-90)")
            .style("fill", "black")
            .attr("y", -50)
            .attr("x", -90)
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
    }, [props.gcContentPath])

    return (
        <>
            <svg
                preserveAspectRatio="xMinYMin"
                // viewBox={"0 0 " + (props.inputWidth + groupXOffset) + " " + (props.inputHeight + groupYOffset)}
                svg-content-responsive="true"
                svg-container="true"
                className="gcGraph"
                // width={(props.inputWidth + groupXOffset) + "px"}
                // height={(props.inputHeight + groupYOffset) + "px"}
                viewBox={"0 0 " + (props.inputWidth) + " " + (props.inputHeight)}
                // width={(props.inputWidth) + "px"}
                // height={(props.inputHeight) + "px"}
            >
                <g ref={ref} transform={`translate(${groupXOffset}, ${margin.top})`}></g>
            </svg>
        </>
    )
}

export default GCGraph;