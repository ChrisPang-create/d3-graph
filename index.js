import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const DATA_URL = "./2025Q3Q4農產品批發市場交易行情.csv";
const DATE_KEY = "日期";
const BOM_DATE_KEY = "\ufeff日期";
const CROP_KEY = "作物品項";
const PRICE_KEY = "主要批發市場均價(元/公斤)";
const IMPORT_KEY = "主要批發市場交易量(進口)(公噸)";
const DOMESTIC_KEY = "主要批發市場交易量(國內)(公噸)";
const NORMAL_VOLUME_KEY = "前三年(平常年)主要批發市場平均交易量(公噸)";

const parseDate = d3.timeParse("%Y/%m/%d");

const rawData = await d3.csv(DATA_URL, (d) => {
  const rawDate = d[DATE_KEY] ?? d[BOM_DATE_KEY];
  const date = rawDate ? parseDate(rawDate.trim()) : null;
  const crop = d[CROP_KEY]?.trim();
  const price = Number.parseFloat(d[PRICE_KEY]);
  const importVolume = Number.parseFloat(d[IMPORT_KEY]) || 0;
  const domesticVolume = Number.parseFloat(d[DOMESTIC_KEY]) || 0;
  const normalVolume = Number.parseFloat(d[NORMAL_VOLUME_KEY]) || 0;
  const volume = importVolume + domesticVolume || normalVolume;

  return {
    date,
    crop,
    price: Number.isFinite(price) ? price : null,
    volume,
  };
});

const data = rawData.filter((d) => d.date && d.crop && d.price !== null);

const topCrops = d3
  .rollups(
    data,
    (values) => d3.sum(values, (d) => d.volume),
    (d) => d.crop
  )
  .sort((a, b) => d3.descending(a[1], b[1]))
  .slice(0, 5)
  .map(([crop]) => crop);

const series = d3
  .groups(
    data.filter((d) => topCrops.includes(d.crop)),
    (d) => d.crop
  )
  .map(([crop, values]) => ({
    crop,
    values: d3
      .rollups(values, (v) => d3.mean(v, (d) => d.price), (d) => d.date)
      .map(([date, price]) => ({ date, price }))
      .sort((a, b) => d3.ascending(a.date, b.date)),
  }));

const allDates = series.flatMap((d) => d.values.map((v) => v.date));
const allPrices = series.flatMap((d) => d.values.map((v) => v.price));

const margin = { top: 20, right: 30, bottom: 40, left: 60 };
const width = 1000;
const height = 520;

const x = d3
  .scaleTime()
  .domain(d3.extent(allDates))
  .range([margin.left, width - margin.right]);

const y = d3
  .scaleLinear()
  .domain([0, d3.max(allPrices) || 0])
  .nice()
  .range([height - margin.bottom, margin.top]);

const color = d3.scaleOrdinal(topCrops, d3.schemeTableau10);

const line = d3
  .line()
  .x((d) => x(d.date))
  .y((d) => y(d.price));

const svg = d3
  .select("#chart")
  .append("svg")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("role", "img")
  .attr(
    "aria-label",
    "前五名作物的主要批發市場均價折線圖"
  );

svg
  .append("g")
  .attr("transform", `translate(0,${height - margin.bottom})`)
  .call(d3.axisBottom(x).ticks(width / 120).tickSizeOuter(0));

svg
  .append("g")
  .attr("transform", `translate(${margin.left},0)`)
  .call(d3.axisLeft(y))
  .call((g) => g.select(".domain").remove())
  .call((g) =>
    g
      .selectAll(".tick line")
      .clone()
      .attr("x2", width - margin.left - margin.right)
      .attr("stroke-opacity", 0.15)
  );

svg
  .append("text")
  .attr("x", margin.left)
  .attr("y", margin.top - 6)
  .attr("fill", "#374151")
  .attr("font-size", 12)
  .text("主要批發市場均價（元/公斤）");

const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

const seriesGroup = svg.append("g");

seriesGroup
  .selectAll("path")
  .data(series)
  .join("path")
  .attr("fill", "none")
  .attr("stroke", (d) => color(d.crop))
  .attr("stroke-width", 2.5)
  .attr("d", (d) => line(d.values));

seriesGroup
  .selectAll("g")
  .data(series)
  .join("g")
  .selectAll("circle")
  .data((d) => d.values.map((v) => ({ ...v, crop: d.crop })))
  .join("circle")
  .attr("cx", (d) => x(d.date))
  .attr("cy", (d) => y(d.price))
  .attr("r", 3)
  .attr("fill", (d) => color(d.crop))
  .on("mouseenter", (event, d) => {
    tooltip
      .style("opacity", 1)
      .html(
        `<strong>${d.crop}</strong><br>${d3.timeFormat("%Y/%m/%d")(d.date)}<br>${d.price.toFixed(2)} 元/公斤`
      )
      .style("left", `${event.pageX + 12}px`)
      .style("top", `${event.pageY - 20}px`);
  })
  .on("mouseleave", () => {
    tooltip.style("opacity", 0);
  });

const legend = d3.select("#legend");
legend
  .selectAll("div")
  .data(topCrops)
  .join("div")
  .attr("class", "legend-item")
  .call((item) => {
    item
      .append("span")
      .attr("class", "legend-swatch")
      .style("background", (d) => color(d));
    item.append("span").text((d) => d);
  });
