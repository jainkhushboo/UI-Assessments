var tooltipNodeContent = '<div id="tooltip" class="tooltip"><div class="tooltip-upper"><span id="date"></span></div><div class="tooltip-lower"><div id="lower-open-close"></div><div id="lower-high-low"></div></div></div>'
var inputVal;
var from;
var end;
var timespan;
//Open form if they hit enter.
window.onkeypress = enter;
function enter(e) {
  if (e.which == 13) { openModal(); }
}
// When the user clicks the button, open the modal 
function openModal(){
    inputVal = document.getElementById("myInput").value.toUpperCase();
    if(inputVal !== ''){
      getStockData();
      document.getElementById("myModal").style.display = "block";  
    }
   else{
      alert("Please submit a ticker symbol to view chart!");
  }
  }

// When the user clicks on <span> (x), close the modal
function closeModal(){
  document.getElementById("myModal").style.display = "none";
  document.getElementById("myInput").value = "";
  document.getElementById("wrapper").innerHTML = tooltipNodeContent;
  
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == this.modal) {
    document.getElementById("myModal").style.display = "none";
    document.getElementById("myInput").value = "";
    document.getElementById("wrapper").innerHTML = tooltipNodeContent;
  }
}

// Remote API URL format used: https://api.polygon.io/v2/aggs/ticker/{stocksTicker}/range/{multiplier}/{timespan}/{from}/{to}?adjusted=true&sort=asc&limit=7&apiKey={apiKey}
async function getStockData() {
    let apiKey = 'RWeluQMmprWoSmyaCKYoCGpeIUj6c4kq';
    let stocksTicker =  inputVal;
    let multiplier = 1; //The size of the timespan multiplier.
    timespan = 'day'; //The size of the time window.
    from = '2021-05-10'; //The start of the aggregate time window.
    end = '2021-05-30'; //The end of the aggregate time window.

    let url = 'https://api.polygon.io/v2/aggs/ticker/'+stocksTicker+'/range/'+multiplier+'/'+timespan+'/'+from+'/'+end+'?adjusted=true&sort=asc&limit=30&apiKey='+apiKey;
    try {
        let res = await fetch(url);
        let data = await res.json();
        let chartData = data.results;
          // Converting Unix Msec timestamp from data response to dd-mm-yyyy format
          chartData.forEach(element => {
             element.date=new Date(element.t).toLocaleDateString("en-GB");
          });
  
          // Creating Stock Bar Chart on modal
          createStockChart(chartData);
          return chartData;
    } catch (error) {
        alert('There has been a problem with fetch operation! Error is: '+error+". Please check ticker symbol once again!");
    }
}
 // Getting date in format of DD MMM 'YY
 function getDateReq(input) {
  let myMonth;
  let sptdate = String(input).split("-");
  let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let myYear = sptdate[0];
  myMonth = sptdate[1];
  let myDay = sptdate[2];
  let combineDatestr = myDay + " " + months[myMonth - 1] + " '" + myYear.slice(2, 4);
  return combineDatestr;
}
//Setting up chart
function createStockChart(chartData){
    const dataset = chartData;
    const yAccessor = (d) => d.c;
    const yAccessor1 = function (d){
      return {
        open: d.o,
        close: d.c,
        high: d.h,
        low:d.l
      }
    }
    const dateParser = d3.timeParse("%d/%m/%Y");
    const xAccessor = (d) => dateParser(d["date"]);

    // Creating a chart dimension by defining the size of the Wrapper and Margin
    let dimensions = {
      width: window.innerWidth * 0.7,
      height: 550,
      margin: {
        top: 115,
        right: 20,
        bottom: 40,
        left: 60,
      },
    };
    dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right;
    dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

    
    let viewBox = "0 0 "+(dimensions.width + dimensions.margin.left + dimensions.margin.right)+" "+dimensions.height;
  // Drawing Canvas
  const wrapper = d3
    .select('#wrapper')
    .append("svg")
    .attr("width", '100%')
    .attr("height", dimensions.height)
    .attr("viewBox", viewBox)
    .attr('preserveAspectRatio','xMinYMin');

  // Creating a Bounding Box for chart
  const bounds = wrapper
    .append("g")
    .attr("width", dimensions.width + dimensions.margin.left + dimensions.margin.right)
    .attr("height", dimensions.height)
    .style(
      "transform",
      `translate(${dimensions.margin.left}px,${dimensions.margin.top}px)`
    );

  // Defining Domain and Range for Scales
  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.boundedHeight, 0]);

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.boundedWidth])

  const lineGenerator = d3
    .line()
    .x((d) => xScale(xAccessor(d)))
    .y((d) => yScale(yAccessor(d)))
    // .curve(d3.curveBasis);

  // Converting X and Y into Path lines and dots
const line = bounds
    .append("path")
    .attr("d", lineGenerator(dataset))
    .attr("fill", "none")
    .attr("stroke", "Red")
    .attr("stroke-width", 2);

  const dots =  bounds.append('g')
    .selectAll("dot")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(xAccessor(d)) )
    .attr("cy", (d) => yScale(yAccessor(d)) )
    .attr("r", 4)

  // Creating X axis and Y axis on canvas

  // Generate Y Axis
  const yAxisGenerator = d3.axisLeft().scale(yScale).tickSize(5).tickSizeOuter(0);
  const yAxis = bounds.append("g").attr("id",'yAxisG').attr("transform", "translate(0,0)").call(yAxisGenerator)
  
  // Generate X Axis
  const xAxisGenerator = d3.axisBottom().scale(xScale).tickSizeOuter(0);
  const xAxis = bounds
    .append("g")
    .call(xAxisGenerator.tickFormat(d3.timeFormat("%e %b")))
    .style("transform", `translateY(${dimensions.boundedHeight}px)`)
  
  // Adding the chart header
  wrapper
    .append("g")
    .style("transform", `translate(${50}px,${15}px)`)
    .append("text")
    .attr("class", "title")
    .attr("x", dimensions.width / 2)
    .attr("y", dimensions.margin.top / 2)
    .attr("text-anchor", "middle")
    .text("Stock Chart for "+inputVal+" from "+getDateReq(from)+" to "+getDateReq(end))
    .style("font-size", "36px")
    .style("text-decoration", "underline");

    // y-axis description
    wrapper
    .append("g")
    .append("text")
    .attr("class", "axisDesc")
    .attr("x", -dimensions.boundedHeight / 2)
    .attr("y", -dimensions.margin.left + 70)
    .attr("text-anchor", "middle")
    .text("Closing Stock Price in $")
    .attr("transform", "rotate(-90)" );

    //x-axis description    
    wrapper
    .append("g")
    .style("transform", `translate(${50}px,${15}px)`)
    .append("text")
    .attr("x",  dimensions.width - 100)
    .attr("y", dimensions.height - 20)
    .attr("class", "axisDesc")
    .attr("text-anchor", "middle")
    .text("Price Per "+timespan.charAt(0).toUpperCase()+timespan.slice(1));

  // Setting up interactions for tooltip
const listeningRect = bounds
  .append("rect")
  .attr("class", "listening-rect")
  .attr("width", dimensions.boundedWidth)
  .attr("height", dimensions.boundedHeight)
  .on("mousemove", onMouseMove)
  .on("mouseleave", onMouseLeave);

const xAxisLine = bounds
  .append("g")
  .append("rect")
  .attr("class", "dotted")
  .attr("stroke-width", "1px")
  .attr("width", ".5px")
  .attr("height", dimensions.boundedHeight);

function onMouseMove() {
  const mousePosition = d3.mouse(this);
  const hoveredDate = xScale.invert(mousePosition[0]);

  const getDistanceFromHoveredDate = (d) =>
    Math.abs(xAccessor(d) - hoveredDate);
  const closestIndex = d3.scan(
    dataset,
    (a, b) => getDistanceFromHoveredDate(a) - getDistanceFromHoveredDate(b)
  );
  const closestDataPoint = dataset[closestIndex];
  const closestXValue = xAccessor(closestDataPoint);
  const closestYValue = yAccessor(closestDataPoint);
  const closestYValue1 = yAccessor1(closestDataPoint);
  
  const formatDate = d3.timeFormat("%-d %B, %Y");
  tooltip.select("#date").text(formatDate(closestXValue));

  const formatOpenClosePrice = (d) => 'Open: '+d.open + ", Close: " +d.close;
  const formatHighLowPrice = (d) =>'High: '+d.high + ", Low: " +d.low;
  tooltip.select("#lower-open-close").html(formatOpenClosePrice(closestYValue1));
  tooltip.select("#lower-high-low").html(formatHighLowPrice(closestYValue1)); 

  const x = xScale(closestXValue) + dimensions.margin.left;
  const y = yScale(closestYValue) + dimensions.margin.top;

  //Grab the x and y position of our closest point,
  //shift our tooltip, and hide/show our tooltip appropriately

  tooltip.style(
    "transform",
    `translate(` + `calc( -50% + ${x}px),` + `calc(-100% + ${y}px)` + `)`
  );

  tooltip.style("opacity", 1)

  tooltipCircle
    .attr("cx", xScale(closestXValue))
    .attr("cy", yScale(closestYValue))
    .style("opacity", 1);

  xAxisLine.attr("x", xScale(closestXValue));
}

function onMouseLeave() {
  tooltip.style("opacity", 0);
  tooltipCircle.style("opacity", 0);
}

// Add a circle under our tooltip, right over the “hovered” point
const tooltip = d3.select("#tooltip");
const tooltipCircle = bounds
  .append("circle")
  .attr("class", "tooltip-circle")
  .attr("r", 4)
  .attr("stroke", "#f44336")
  .attr("fill", "white")
  .attr("stroke-width", 2)
  .style("opacity", 0);

}



