import define1 from "./a33468b95d0b15b0@817.js";

function _1(md){return(
md`<div style="color: grey; font: 13px/25.5px var(--sans-serif); text-transform: uppercase;"><h1 style="display: none;">2025 Q3/Q4 農產品批發市場交易行情</h1><a href="https://d3js.org/">D3</a> › <a href="/@d3/gallery">Gallery</a></div>

# 2025 Q3/Q4 農產品批發市場交易行情

以下視覺化呈現 2025 年第三、四季的農產品批發市場交易行情，依交易量最高的作物品項呈現每日期間的交易量變化。資料來源：農產品批發市場交易行情 (2025 Q3/Q4)。`
)}

function _key(Swatches,chart){return(
Swatches(chart.scales.color, {columns: "180px"})
)}

function _chart(d3,data,activeCrops)
{
  // Specify the chart’s dimensions.
  const width = 928;
  const height = 500;
  const marginTop = 10;
  const marginRight = 10;
  const marginBottom = 20;
  const marginLeft = 40;

  // Determine the series that need to be stacked.
  const series = d3.stack()
      .keys(activeCrops) // distinct series keys, in input order
      .value(([, D], key) => D.get(key)?.totalVolume ?? 0) // get value for each series key and stack
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
          .attr("x", -marginLeft)
          .attr("y", 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text("↑ 交易量（公噸）"));

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


function _data(FileAttachment,d3){return(
FileAttachment("2025Q3Q4農產品批發市場交易行情.csv").csv({typed: true}).then((rows) => {
  const parseDate = d3.timeParse("%Y/%m/%d");
  return rows.map((row) => {
    const importVolume = row["主要批發市場交易量(進口)(公噸)"] ?? 0;
    const domesticVolume = row["主要批發市場交易量(國內)(公噸)"] ?? 0;
    return {
      date: parseDate(row["日期"]),
      crop: row["作物品項"],
      importVolume,
      domesticVolume,
      totalVolume: importVolume + domesticVolume,
      averagePrice: row["主要批發市場均價(元/公斤)"] ?? 0,
      normalYearVolume: row["前三年(平常年)主要批發市場平均交易量(公噸)"] ?? 0,
      normalYearPrice: row["前三年(平常年)主要批發市場均價(元/公斤)"] ?? 0
    };
  }).filter((row) => row.date && row.crop);
})
)}

function _topCrops(d3,data)
{
  const totals = d3.rollup(data, (group) => d3.sum(group, (d) => d.totalVolume), (d) => d.crop);
  return Array.from(totals, ([crop, total]) => ({crop, total}))
    .sort((a, b) => d3.descending(a.total, b.total))
    .slice(0, 8)
    .map((d) => d.crop);
}

function _filteredData(data,topCrops){return(
data.filter((row) => topCrops.includes(row.crop))
)}

function _selectedCrop(d3,topCrops)
{
  const form = d3.create("form")
    .attr("style", "display: flex; flex-wrap: wrap; align-items: center; gap: 12px; font: 12px var(--sans-serif);");
  form.append("span")
    .attr("style", "font-weight: 600;")
    .text("作物篩選");
  const options = ["全部", ...topCrops];
  const items = form.selectAll("label")
    .data(options)
    .join("label")
    .attr("style", "display: inline-flex; align-items: center; gap: 6px; cursor: pointer;");
  items.append("input")
    .attr("type", "radio")
    .attr("name", "crop")
    .attr("value", (d) => d)
    .property("checked", (d, i) => i === 0);
  items.append("span")
    .text((d) => d);
  form.node().value = "全部";
  form.on("input", (event) => {
    form.node().value = event.target.value;
    form.node().dispatchEvent(new Event("input", {bubbles: true}));
  });
  return form.node();
}

function _activeCrops(topCrops,selectedCrop){return(
selectedCrop === "全部" ? topCrops : [selectedCrop]
)}

function _displayData(filteredData,activeCrops){return(
filteredData.filter((row) => activeCrops.includes(row.crop))
)}

function _6(md){return(
md`使用 [Observable Plot](https://observablehq.com/plot) 的簡潔 API，也可以繪製相同資料的堆疊面積圖。`
)}

function _7(Plot,displayData){return(
Plot.plot({
  marginLeft: 60,
  y: {grid: true},
  color: {legend: true, columns: 6},
  marks: [
    Plot.areaY(displayData, {x: "date", y: "totalVolume", fill: "crop"}),
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
  main.variable(observer("chart")).define("chart", ["d3","displayData","activeCrops"], _chart);
  main.variable(observer("data")).define("data", ["FileAttachment","d3"], _data);
  main.variable(observer("topCrops")).define("topCrops", ["d3","data"], _topCrops);
  main.variable(observer("filteredData")).define("filteredData", ["data","topCrops"], _filteredData);
  main.variable(observer("viewof selectedCrop")).define("viewof selectedCrop", ["d3","topCrops"], _selectedCrop);
  main.variable(observer("selectedCrop")).define("selectedCrop", ["Generators", "viewof selectedCrop"], (G, _) => G.input(_));
  main.variable(observer("activeCrops")).define("activeCrops", ["topCrops","selectedCrop"], _activeCrops);
  main.variable(observer("displayData")).define("displayData", ["filteredData","activeCrops"], _displayData);
  const child1 = runtime.module(define1);
  main.import("Swatches", child1);
  main.variable(observer()).define(["md"], _6);
  main.variable(observer()).define(["Plot","displayData"], _7);
  return main;
}
