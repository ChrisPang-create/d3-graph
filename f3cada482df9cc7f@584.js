import define1 from "./a33468b95d0b15b0@817.js";

function _1(md){return(
md`# 2025Q3Q4 農產品批發市場交易行情

以下圖表以堆疊面積圖呈現 2025 年第三、四季各作物在主要批發市場的交易量（公噸），便於比較不同作物的供應規模與變化趨勢。資料來源：\`2025Q3Q4農產品批發市場交易行情.csv\`。`
)}

function _key(Swatches,chart){return(
Swatches(chart.scales.color, {columns: "180px"})
)}

function _chart(d3,data)
{
  // Specify the chart’s dimensions.
  const width = 928;
  const height = 500;
  const marginTop = 10;
  const marginRight = 10;
  const marginBottom = 20;
  const marginLeft = 60;

  // Determine the series that need to be stacked.
  const series = d3.stack()
      .keys(d3.union(data.map(d => d.crop))) // distinct series keys, in input order
      .value(([, D], key) => D.get(key).volume) // get value for each series key and stack
    (d3.index(data, d => d.date, d => d.crop)); // group by stack then series key

  // Prepare the scales for positional and color encodings.
  const x = d3.scaleUtc()
      .domain(d3.extent(data, d => d.date))
      .range([marginLeft, width - marginRight]);

  const y = d3.scaleLinear()
      .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
      .rangeRound([height - marginBottom, marginTop]);

  const color = d3.scaleOrdinal()
      .domain(series.map(d => d.key))
      .range(d3.schemeTableau10);

  // Construct an area shape.
  const area = d3.area()
      .x(d => x(d.data[0]))
      .y0(d => y(d[0]))
      .y1(d => y(d[1]));

  // Create the SVG container.
  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

  // Add the y-axis, remove the domain line, add grid lines and a label.
  svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y).ticks(height / 80))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
          .attr("x2", width - marginLeft - marginRight)
          .attr("stroke-opacity", 0.1))
      .call(g => g.append("text")
          .attr("x", -marginLeft + 10)
          .attr("y", 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .attr("font-weight", "bold")
          .text("交易量（公噸）"));

  // Append a path for each series.
  svg.append("g")
    .selectAll()
    .data(series)
    .join("path")
      .attr("fill", d => color(d.key))
      .attr("d", area)
    .append("title")
      .text(d => d.key);

  // Append the horizontal axis atop the area.
  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0));

  // Return the chart with the color scale as a property (for the legend).
  return Object.assign(svg.node(), {scales: {color}});
}


function _data(d3,FileAttachment){return(
FileAttachment("2025Q3Q4農產品批發市場交易行情.csv").csv({typed: true}).then((rows) => {
  const parseDate = d3.timeParse("%Y/%m/%d");
  return rows.map((row) => {
    const importVolume = row["主要批發市場交易量(進口)(公噸)"] || 0;
    const domesticVolume = row["主要批發市場交易量(國內)(公噸)"] || 0;
    return {
      date: parseDate(row["日期"]),
      crop: row["作物品項"],
      volume: importVolume + domesticVolume,
      avgPrice: row["主要批發市場均價(元/公斤)"] || null,
      normalVolume: row["前三年(平常年)主要批發市場平均交易量(公噸)"] || null,
      normalPrice: row["前三年(平常年)主要批發市場均價(元/公斤)"] || null
    };
  });
})
)}

function _6(md){return(
md`使用 [Observable Plot](https://observablehq.com/plot) 也可以快速建立相同的堆疊面積圖，以下為 Plot 版本的示意。`
)}

function _7(Plot,data){return(
Plot.plot({
  marginLeft: 60,
  y: {grid: true, label: "交易量（公噸）"},
  color: {legend: true, columns: 6},
  marks: [
    Plot.areaY(data, {x: "date", y: "volume", fill: "crop"}),
    Plot.ruleY([0])
  ]
})
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["2025Q3Q4農產品批發市場交易行情.csv", {url: new URL("./2025Q3Q4農產品批發市場交易行情.csv", import.meta.url), mimeType: "text/csv", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("key")).define("key", ["Swatches","chart"], _key);
  main.variable(observer("chart")).define("chart", ["d3","data"], _chart);
  main.variable(observer("data")).define("data", ["d3","FileAttachment"], _data);
  const child1 = runtime.module(define1);
  main.import("Swatches", child1);
  main.variable(observer()).define(["md"], _6);
  main.variable(observer()).define(["Plot","data"], _7);
  return main;
}
