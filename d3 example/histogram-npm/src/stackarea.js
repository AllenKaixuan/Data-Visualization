import * as d3 from "d3";


function stackarea (data,{
    

} = {}) {
    // Specify the chart’s dimensions.
    const width = 928;
    const height = 500;
    const marginTop = 10;
    const marginRight = 10;
    const marginBottom = 20;
    const marginLeft = 40;
  
    // 计算堆叠，指定按照什么类型堆叠（堆叠key），指定堆叠什么值（堆叠value）
    // 返回堆叠计算结果数组，有多少个key值（系列），数组就有多少项，数组的每一项都是一个InternMap
    // InternMap的Key为系列值，Value为一个Array
    // 该Value也就是将同一个key的汇总到一个Array下，Array的每一个元素是一个两个元素数组[开始，结束]，
    // 此外该数组还有一个data属性存储原始的该行记录
    // Determine the series that need to be stacked.
    const series = d3.stack()
        //设定系列keys，有多少个keys值就有多少个系列，一个系列表示一个分组
        .keys(d3.union(data.map(d => d.industry))) // distinct series keys, in input order
        //设置堆积字段，D为原始数据按照key=系列值，value=行的方式组织的InternMap对象，D.get(key)即可获取到一行记录
        .value(([, D], key) => D.get(key).unemployed) // get value for each series key and stack
      //按照date、industry二维分组，返回InternMap两层结构
      (d3.index(data, d => d.date, d => d.industry)); // group by stack then series key
  
    // X尺子，utc时间
    // Prepare the scales for positional and color encodings.
    const x = d3.scaleUtc()
        .domain(d3.extent(data, d => d.date))
        .range([marginLeft, width - marginRight]);
  
    //Y尺子，线性尺子，计算出堆叠系列series的最大值d[1]
    const y = d3.scaleLinear()
        //值域获取堆叠后的最大值，堆叠结构为一个array，array里每一个系列一个元素
        //每个系列的元素还是一个array，为该系列的所有数据
        //获取最大值需要两层嵌套，内层获取每一个系列内部的最大值，外层获取到不同系列的最大值
        .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
        //取整
        .rangeRound([height - marginBottom, marginTop]);
  
    //颜色尺子
    const color = d3.scaleOrdinal()
        //值域为堆叠系列的key
        .domain(series.map(d => d.key))
        .range(d3.schemeTableau10);
    
    // Area生成器，数据源后面会指定series，因此每一个series的数据d
    // d[0]为堆叠开始值，d[1]为堆叠结束值，d.data为原始行记录值
    // Construct an area shape.
    const area = d3.area()
        .x(d => x(d.data[0]))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]));
  
    // Create the SVG container.
    const svg = d3.select("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto;");
  
    // Y轴
    // Add the y-axis, remove the domain line, add grid lines and a label.
    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y).ticks(height / 80))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("x2", width - marginLeft - marginRight)
            .attr("stroke-opacity", 0.1))
        .call(g => g.append("text")
            .attr("x", -marginLeft)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text("↑ Unemployed persons"));
  
    // 采用path绘制面积图，采用fill进行填充，color为系列分组的颜色
    // Append a path for each series.
    svg.append("g")
      .selectAll()
      .data(series)
      .join("path")
        //采用系列分组的颜色进行填充
        .attr("fill", d => color(d.key))
        .attr("fill-opacity", 0.9)
        .attr("d", area)
      //鼠标移入显示
      .append("title")
        .text(d => d.key);
  
    // X轴
    // Append the horizontal axis atop the area.
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0));
  
    // Return the chart with the color scale as a property (for the legend).
    return Object.assign(svg.node(), {scales: {color}});
  }

export default stackarea; 