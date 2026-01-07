const DATE_FORMAT = d3.timeParse("%Y/%m/%d");
const DATA_URL = "2025Q3Q4農產品批發市場交易行情.csv";

function parseNumber(value) {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  const cleaned = value.toString().replace(/,/g, "").trim();
  return cleaned === "" ? 0 : Number(cleaned);
}

function formatDateRange(dates) {
  const formatter = d3.timeFormat("%Y/%m/%d");
  const [start, end] = d3.extent(dates);
  return `${formatter(start)} - ${formatter(end)}`;
}

function renderLegend(container, keys, colorScale) {
  container.innerHTML = "";
  const fragment = document.createDocumentFragment();
  keys.forEach((key) => {
    const item = document.createElement("div");
    item.className = "legend-item";

    const swatch = document.createElement("span");
    swatch.className = "legend-swatch";
    swatch.style.backgroundColor = colorScale(key);

    const label = document.createElement("span");
    label.textContent = key;

    item.appendChild(swatch);
    item.appendChild(label);
    fragment.appendChild(item);
  });
  container.appendChild(fragment);
}

function drawStackedArea(data, keys) {
  const width = 960;
  const height = 500;
  const margin = { top: 20, right: 20, bottom: 40, left: 60 };

  const stack = d3.stack().keys(keys);
  const series = stack(data);

  const x = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.date))
    .range([margin.left, width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(series, (layer) => d3.max(layer, (d) => d[1]))])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const color = d3
    .scaleOrdinal()
    .domain(keys)
    .range(d3.schemeTableau10.concat(d3.schemeSet3).slice(0, keys.length));

  const area = d3
    .area()
    .x((d) => x(d.data.date))
    .y0((d) => y(d[0]))
    .y1((d) => y(d[1]));

  const svg = d3
    .create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", "100%")
    .attr("height", height)
    .attr("role", "img")
    .attr("aria-label", "主要批發市場交易量堆疊面積圖");

  svg
    .append("g")
    .selectAll("path")
    .data(series)
    .join("path")
    .attr("fill", (d) => color(d.key))
    .attr("d", area)
    .append("title")
    .text((d) => d.key);

  const xAxis = d3.axisBottom(x).ticks(width / 100).tickSizeOuter(0);
  const yAxis = d3.axisLeft(y).ticks(height / 80);

  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis);

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis)
    .call((g) => g.select(".domain").remove())
    .call((g) =>
      g
        .selectAll(".tick line")
        .clone()
        .attr("x2", width - margin.left - margin.right)
        .attr("stroke-opacity", 0.12)
    )
    .call((g) =>
      g
        .append("text")
        .attr("x", -margin.left)
        .attr("y", 12)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .attr("font-weight", "600")
        .text("交易量（公噸）")
    );

  return { svg: svg.node(), color };
}

async function init() {
  const raw = await d3.csv(DATA_URL, (d) => ({
    date: DATE_FORMAT(d["日期"]),
    crop: d["作物品項"],
    importVolume: parseNumber(d["主要批發市場交易量(進口)(公噸)"]),
    domesticVolume: parseNumber(d["主要批發市場交易量(國內)(公噸)"]),
  }));

  const cleaned = raw.filter((d) => d.date && d.crop);
  const totalsByCrop = d3.rollups(
    cleaned,
    (values) => d3.sum(values, (d) => d.importVolume + d.domesticVolume),
    (d) => d.crop
  );

  const topCrops = totalsByCrop
    .sort((a, b) => d3.descending(a[1], b[1]))
    .slice(0, 8)
    .map(([crop]) => crop);

  const filtered = cleaned.filter((d) => topCrops.includes(d.crop));

  const byDate = d3.rollups(
    filtered,
    (values) => {
      const totals = d3.rollup(
        values,
        (v) => d3.sum(v, (d) => d.importVolume + d.domesticVolume),
        (d) => d.crop
      );
      const entry = { date: values[0].date };
      topCrops.forEach((crop) => {
        entry[crop] = totals.get(crop) || 0;
      });
      return entry;
    },
    (d) => d.date
  );

  const stackedData = byDate
    .map(([, entry]) => entry)
    .sort((a, b) => d3.ascending(a.date, b.date));

  const chartContainer = document.getElementById("chart");
  const legendContainer = document.getElementById("legend");
  const dateRange = document.getElementById("date-range");

  const { svg, color } = drawStackedArea(stackedData, topCrops);
  chartContainer.appendChild(svg);
  renderLegend(legendContainer, topCrops, color);
  dateRange.textContent = `資料日期：${formatDateRange(
    stackedData.map((d) => d.date)
  )}`;
}

init();
