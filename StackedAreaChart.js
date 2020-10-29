export default function StackedAreaChart(container) {
    // initialization
    const margin = ({ top: 50, right: 200, bottom: 50, left: 40 })
    const width = 1000 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;


    let svg = d3.select(container).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    let xScale = d3.scaleTime()
        .range([0, width])

    let yScale = d3.scaleLinear()
        .range([height, 0])

    let color = d3.scaleOrdinal()
        .range(d3.schemeCategory10)


    let xAxis = d3.axisBottom()
        .scale(xScale)

    let yAxis = d3.axisLeft()
        .scale(yScale)
        .ticks(10)

    // svg.append("path")
    //     .attr("class", "area")

    svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", `translate(0, ${height})`);

    svg.append("g")
        .attr("class", "axis y-axis")

    const tooltip = svg
        .append("text")
        .attr("class", "tooltip")
        .attr("x", 2)
        .attr("y", 0);
    
    svg.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)// the size of clip-path is the same as
        .attr("height", height); // the chart area
    
    
    

    let selected = null, xDomain, data;


    function update(_data) {
        data = _data;
        
        const keys = selected ? [selected] : data.columns.slice(1);

        // extract leys for stacking
       // var stack_keys = data.columns.slice(1)
        //console.log("stack-keys: ", stack_keys)

        // compute a stack
        var stack = d3.stack()
            .keys(keys)
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone);


        //console.log("stack: ", stack);

        var stackedData = stack(data)
        console.log("series: ", stackedData)

        // update domains for sclaes
        color.domain(keys)

        xScale.domain(xDomain ? xDomain : d3.extent(data, d => d.date))
        //xScale.domain();
        //console.log("xscale: ", xScale)
        //console.log("here: ", d3.extent(data, d => d.date))


        yScale.domain([0, d3.max(stackedData, function (d) {
            return d3.max(d, function (b) {
                //console.log("b in here is: ", b)
                return b[1];
            });
        })])

        console.log("yscale domain: ", yScale.domain())
        console.log("xscale domain is: ", xScale.domain())
        //console.log(" this too: ", [0, d3.max(stackedData, (a) => d3.max(a, (d) => d[1]))]);


        // create an area generator
        const area = d3.area()
            .y0(function (d) {

                return yScale(d[0]);
            })
            .y1(function (d) {

                return yScale(d[1]);
            })
            .x(function (d) {

                return xScale(d.data.date);
            })



        // create areas based on the stack
        //console.log(stackedData[0].key)
        const areas = svg.selectAll(".area")
            .data(stackedData, function (d) {
                //console.log("d looks like: ", d.key)
                return d.key;
            });

        areas.enter() // or you could use join()
            .append("path")
            .attr("class", "area")
            .attr("fill", function (d) {
                return color(d.key);
            })
            .merge(areas)
            .attr("d", area)
            .attr("clip-path", "url(#clip)")
            .on("mouseover", function (event, d, i) {
                //console.log("D: ", d.key)
                tooltip.text(d.key)
                // .style("display", "block")
            })
            .on("mouseout", function (event, d, i) {
                tooltip.text("")
            })
            .on("click", (event, d) => {
                // toggle selected based on d.key
                if (selected === d.key) {
                    console.log("SELECTED: ", selected)
                    selected = null;
                } else {
                    console.log("KEY!!!!!! ", d.key)
                    selected = d.key;
                }
                update(data); // simply update the chart again
            });
        areas.exit().remove()



        // update axes
        d3.selectAll(".x-axis")
            .call(xAxis)

        d3.selectAll(".y-axis")
            .call(yAxis)


    }
    function filterByDate(range) {
        xDomain = range;  // -- (3)
        update(data); // -- (4
    }
    return {
        update,
        filterByDate
    }
      
}  