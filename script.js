import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// not pure functions
function createTextElement(
  svg,
  text,
  { textAnchor, x, y, fontFamily, fontSize }
) {
  svg
    .append("text")
    .attr("text-anchor", textAnchor)
    .attr("x", x)
    .attr("y", y)
    .attr("font-family", fontFamily)
    .attr("font-size", fontSize)
    .text(text);
}

function createBars(svg, data, { className, x, y, width, height, fill }) {
  svg
    .selectAll(`.${className}`)
    .data(data)
    .enter()
    .append("rect")
    .attr("class", className)
    .attr("x", x)
    .attr("y", y)
    .attr("width", width)
    .attr("height", height)
    .attr("fill", fill);
}

function createBarLabels(svg, data, label, { className, x, y, textAnchor }) {
  svg
    .selectAll(`.${className}`)
    .data(data)
    .enter()
    .append("text")
    .attr("class", className)
    .attr("x", x)
    .attr("y", (d) => y(d.age) + y.bandwidth() / 2)
    .attr("dy", ".35em")
    .attr("text-anchor", textAnchor)
    .text(label)
    .attr("font-family", fontFamily)
    .attr("fill", "black")
    .attr("font-size", "9pt");
}

const colors = {
  female: "#F25858",
  femaleSurplus: "#812F2F",
  male: "#0071BD",
  maleSurplus: "#1A3564",
};

const fontFamily = "Roboto, sans-serif";

function generateChart(title, data, source, { margin, width, height }) {
  const svg = d3
    .create("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const xMale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.male)])
    .range([width / 2 - 30, 0]);

  const xFemale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.female)])
    .range([0, width / 2 - 30]);

  const y = d3
    .scaleBand()
    .domain(data.map((d) => d.age))
    .range([-30, height])
    .padding(0.1);

  // Bars
  createBars(svg, data, {
    className: "bar-male",
    x: (d) => xMale(d.male),
    y: (d) => y(d.age),
    width: (d) => width / 2 - 30 - xMale(d.male),
    height: y.bandwidth(),
    fill: colors.male,
  });

  createBars(svg, data, {
    className: "bar-female",
    x: width / 2 + 30,
    y: (d) => y(d.age),
    width: (d) => xFemale(d.female),
    height: y.bandwidth(),
    fill: colors.female,
  });

  // surplus bars
  createBars(
    svg,
    data.filter((d) => d.male > d.female),
    {
      className: "surplus-male",
      x: (d) => xMale(d.male),
      y: (d) => y(d.age),
      width: (d) => xMale(d.female) - xMale(d.male),
      height: y.bandwidth(),
      fill: colors.maleSurplus,
    }
  );

  createBars(
    svg,
    data.filter((d) => d.female > d.male),
    {
      className: "surplus-female",
      x: (d) => width / 2 + 30 + xFemale(d.male),
      y: (d) => y(d.age),
      width: (d) => xFemale(d.female) - xFemale(d.male),
      height: y.bandwidth(),
      fill: colors.femaleSurplus,
    }
  );

  // middle y-axis
  svg
    .append("g")
    .attr("transform", `translate(${width / 2}, 0)`)
    .call(d3.axisRight(y).tickSize(0))
    .call((g) => g.select(".domain").remove())
    .selectAll("text")
    .attr("x", 0)
    .attr("dy", ".35em")
    .attr("font-family", fontFamily)
    .attr("font-size", "10pt")
    .attr("text-anchor", "middle")
    .attr("fill", "black")
    .style("font-weight", "bold");

  // Add bar labels
  createBarLabels(svg, data, (d) => (d.male / 1000).toFixed(2), {
    className: "text-male",
    x: (d) => xMale(d.male) - 5,
    y: y,
    textAnchor: "end",
  });

  createBarLabels(svg, data, (d) => (d.female / 1000).toFixed(2), {
    className: "text-female",
    x: (d) => width / 2 + 30 + xFemale(d.female) + 5,
    y: y,
    textAnchor: "start",
  });

  // Axis labels
  createTextElement(svg, "Male", {
    textAnchor: "end",
    x: width / 2 - 40,
    y: height + margin.bottom - 20,
    fontFamily,
  });
  createTextElement(svg, "Female", {
    textAnchor: "start",
    x: width / 2 + 40,
    y: height + margin.bottom - 20,
    fontFamily,
  });

  // Legend
  const legend = svg
    .append("g")
    .attr("font-family", fontFamily)
    .attr("font-size", 12)
    .attr("text-anchor", "start")
    .selectAll("g")
    .data(["Male", "Male surplus", "Female", "Female surplus"])
    .enter()
    .append("g")
    .attr("transform", (_d, i) => `translate(0,${i * 20})`);

  legend
    .append("rect")
    .attr("x", 0)
    .attr("width", 19)
    .attr("height", 19)
    .attr(
      "fill",
      (_d, i) =>
        [colors.male, colors.maleSurplus, colors.female, colors.femaleSurplus][
          i
        ]
    );

  legend
    .append("text")
    .attr("x", 24)
    .attr("y", 9.5)
    .attr("dy", "0.32em")
    .text((d) => d);

  // title and other info
  createTextElement(svg, title, {
    textAnchor: "middle",
    x: width / 2,
    y: 0 - margin.top / 1.5,
    fontFamily,
    fontSize: "16px",
  });
  createTextElement(svg, "(in thousands)", {
    textAnchor: "middle",
    x: width / 2,
    y: 0 - margin.top / 1.5 + 18,
    fontFamily,
    fontSize: "12px",
  });
  if (source != null && source != "") {
    createTextElement(svg, "Source: " + source, {
      textAnchor: "end",
      x: width + margin.right / 1.5,
      y: height + margin.bottom / 1.5,
      fontFamily,
      fontSize: "12px",
    });
  }

  return svg.node();
}

// Utility function to download SVG content as a file
function downloadSVG(svgEl, name) {
  const svgData = new XMLSerializer().serializeToString(svgEl);
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);
  const downloadLink = document.createElement("a");
  downloadLink.href = svgUrl;
  downloadLink.download = name;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

// Utility function to convert SVG to Canvas, then download as JPG
function downloadJPG(svgEl, name, width, height) {
  const svgData = new XMLSerializer().serializeToString(svgEl);
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.src = svgUrl;
  img.onload = function () {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFFFFF"; // Set fill color to white
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the canvas
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(svgUrl);

    canvas.toBlob(function (blob) {
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = name;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }, "image/jpeg");
  };
}

let title = localStorage.getItem("title");
let data = localStorage.getItem("data");
let source = localStorage.getItem("source");

const svgElement = document.getElementById("container");

document
  .getElementById("btn-download-svg")
  .addEventListener("click", function () {
    downloadSVG(svgElement, `chart_${title}.svg`);
  });

document
  .getElementById("btn-download-jpg")
  .addEventListener("click", function () {
    const svgWidth = parseInt(svgElement.getAttribute("width"));
    const svgHeight = parseInt(svgElement.getAttribute("height"));
    downloadJPG(svgElement, `chart_${title}.jpg`, svgWidth, svgHeight);
  });

const margin = { top: 100, right: 80, bottom: 50, left: 80 };
const width = 1024 - margin.left - margin.right;
const height = 768 - margin.top - margin.bottom;

const inputTitle = document.getElementById("title");
const inputData = document.getElementById("data");
const inputSource = document.getElementById("source");

if (title && data) {
  const node = generateChart(title, JSON.parse(data), source, {
    margin,
    width,
    height,
  });
  svgElement.innerHTML = "";
  svgElement.setAttribute("width", `${width + margin.left + margin.right}px`);
  svgElement.setAttribute("height", `${height + margin.top + margin.bottom}px`);
  svgElement.appendChild(node);

  inputTitle.value = title;
  inputData.value = data;
  inputSource.value = source;
}

document.getElementById("form").addEventListener("submit", function (e) {
  e.preventDefault();

  const title = inputTitle.value;
  const data = inputData.value;
  const source = inputSource.value;

  if (!title || !data) {
    alert("Please provide title and data");
    return;
  }

  localStorage.setItem("title", title);
  localStorage.setItem("data", data);
  localStorage.setItem("source", source);

  const node = generateChart(title, JSON.parse(data), source, {
    margin,
    width,
    height,
  });
  svgElement.innerHTML = "";
  svgElement.setAttribute("width", `${width + margin.left + margin.right}px`);
  svgElement.setAttribute("height", `${height + margin.top + margin.bottom}px`);
  svgElement.appendChild(node);
});
