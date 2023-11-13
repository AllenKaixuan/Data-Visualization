import * as d3 from "d3";

function scatter(){
const dataset = [
    [ 2012,8.53, 0.1129 ],
    [ 2013,   9.57,0.1232 ],
    [ 2014,   10.48,0.1313 ],
    [ 2015,   11.06,0.1470 ],
    [ 2016,   11.23,0.1468 ],
    [ 2017,   12.31,0.1511 ],
    [ 2018,   13.89,0.1606 ],
    [ 2019,    14.28,0.1627 ],
    [ 2020,   14.69,0.1723 ],
    [ 2021,   17.82,0.1839 ]
];

const w = 1000;
const h = 600;
const padding = 50;

const xScale = d3.scaleLinear()
    .domain([new Date(2011), new Date(2023)])
    .range([padding, w - padding]);

const yScale = d3.scaleLinear()
    .domain([0, d3.max(dataset, (d) => d[1])+6])
    .range([h - padding, padding]);


const container = d3.select("#svgContainer2")
const svg = container.select("svg")
                    .attr("width", w)
                    .attr("height", h);




svg.selectAll("circle")
  .data(dataset)
  .enter()
  .append("circle")
  .attr("cx", (d) => xScale(d[0]))
  .attr("cy", (d) => yScale(d[1]))
  .attr("r", (d) => 50 * d[2])
  .style("fill", "green");
  
const line = d3.line()
  .x(d => xScale(d[0]))
  .y(d => yScale(d[1]));

// 绘制折线
svg.append("path")
  .datum(dataset)
  .attr("fill", "none")
  .attr("stroke", "blue")
  .attr("stroke-width", 2)
  .attr("d", line);



svg.selectAll("text")
.data(dataset)
.enter()
.append("text")
.text((d) =>  (d[1] + "," + (d[2]*100).toFixed(1)+"%"))
.attr("x", (d) => xScale(d[0] ))
.attr("y", (d) => yScale(d[1]-1))

const xAxis = d3.axisBottom(xScale);


const yAxis = d3.axisLeft(yScale);


svg.append("g")
.attr("transform", "translate(0," + (h - padding) + ")")
.call(xAxis)
.call(g => g.append("text")
            .attr("x", w-padding)
            .attr("y", 30)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text("→ Year"));


svg.append("g")
.attr("transform", "translate(" +padding  + ", 0)")
.call(yAxis)
.call(g => g.append("text")
            .attr("x",-30)
            .attr("y", padding-10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text("↑ GDP(万亿元)"));

return svg.node;
}

export default scatter;
