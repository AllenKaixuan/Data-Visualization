import * as d3 from "d3";
import { svg } from "d3";



function difference(array){     //  求出每个活动的差值（活动时间），得到一天内各活动的排序
    const rows = array[0].length;
    const columns = array.length;
   
    const differenceArray = Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => new Array())
    );
    for(let i = 0; i <rows; i++){
        for (let j = 0; j < columns; j++) {
            differenceArray[i][j].push(j);
            differenceArray[i][j].push(i);
            differenceArray[i][j] .push(array[j][i][1]-array[j][i][0]); // (index_i, index_j, difference)
          }
        differenceArray[i] = differenceArray[i].sort((a,b) => a[2]- b[2]); // 差值排序
    }
    return differenceArray;
}

function calcu(array, series){  // 重新设置起始时间
    for(let i = 0; i < array.length; i++){
        let accu = 0;
        for (let j = 0; j < array[0].length; j++) {
            series[array[i][j][0]][array[i][j][1]][0] = accu;
            accu += array[i][j][2];
            series[array[i][j][0]][array[i][j][1]][1] = accu;

        }
    }
    return series;
}



function stackarea (data) {
    // Specify the chart’s dimensions.
    const width = 1000;
    const height = 500;
    const marginTop = 30;
    const marginRight = 10;
    const marginBottom = 20;
    const marginLeft = 40;
  
    // 计算堆叠，指定按照什么类型堆叠（堆叠key）activity，指定堆叠什么值（堆叠value）time
    // 返回堆叠计算结果数组，有多少个key值（系列），数组就有多少项，数组的每一项都是一个InternMap
    // InternMap的Key为系列值，Value为一个Array(time array)
    // 该Value也就是将同一个key的汇总到一个Array下，Array的每一个元素是一个两个元素数组[开始，结束]，
    // 此外该数组还有一个data属性存储原始的该行记录
    // Determine the series that need to be stacked.
    const series = d3.stack()
        //设定系列keys，有多少个keys值就有多少个系列，一个系列表示一个分组
        .keys(d3.union(data.map(d => d.activity))) // distinct series keys, in input order
        //设置堆积字段，D为原始数据按照key=系列值，value=行的方式组织的InternMap对象，D.get(key)即可获取到一行记录
        .value(([, D], key) => D.get(key).time) // get value for each series key and stack
      //按照date、activity二维分组，返回InternMap两层结构
      (d3.index(data, d => d.date, d => d.activity)) // group by stack then series key
      
 
        // console.log(series);
        const temp = difference(series);
        // console.log(temp);
        
        console.log(calcu(temp,series));
        // console.log(cal_bottom(temp,series));

           
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
        .y1(d => y(d[1]))
        .curve(d3.curveBasis);  // 平滑
        
   
  
    // Create the SVG container.
    const container = d3.select("#svgContainer")
    const svg = container.select("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width+100, height+20])
        .attr("style", "max-width: 100%; height: auto;");
  
    // Y轴
    // Add the y-axis, remove the domain line, add grid lines and a label.
    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y).ticks(height / 50))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("x2", width - marginLeft - marginRight)
            .attr("stroke-opacity", 0.1))
        .call(g => g.append("text")
            .attr("x", -marginLeft)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text("↑ Time(24h)"));
  
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
    //Append the horizontal axis atop the area.
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];




let xAxis = d3.axisBottom(x)
    .ticks(d3.timeDay.every(1))
    .tickFormat(d => daysOfWeek[d.getDay()]) // Format tick labels as the full name of the day of the week
    .tickSizeOuter(0);


    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(xAxis)
        .call(g => g.append("text")
            .attr("x", width-marginLeft)
            .attr("y", 30)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text("→ Week(day)"));
    // Return the chart with the color scale as a property (for the legend).
    
    const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(" + (width - 100) + ", 30)");
  
  // 为每个系列创建图例项
  series.forEach((d, i) => {
    const legendItem = legend.append("g")
      .attr("transform", "translate(100, " + (i * 20) + ")");
  
    legendItem.append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", color(d.key));
  
    legendItem.append("text")
      .attr("x", 15)
      .attr("y", 8)
      .text(d.key);
  });

    return Object.assign(svg.node(), {scales: {color}});
  }

export default stackarea; 