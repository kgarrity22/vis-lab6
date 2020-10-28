

function AreaChart(container) {// selector for a chart container e.g., ".chart"

    // initialization
    const margin = ({ top: 50, right: 40, bottom: 50, left: 40 })
    const width = 650 - margin.left - margin.right,
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

    let xAxis = d3.axisBottom()
        .scale(xScale)

    let yAxis = d3.axisLeft()
        .scale(yScale)
        .ticks(10)
    
    svg.append("path")
        .attr("class", "area")

    svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", `translate(0, ${height})`);

    svg.append("g")
        .attr("class", "axis y-axis")
    

    function update(data) {

        // update scales, encodings, axes (use the total count)
        xScale.domain([d3.min(data, function (d) { return d.date }), d3.max(data, function (d) { return d.date })]);
        //console.log("xscale: ", xScale.domain())

        yScale.domain([0, d3.max(data, function (d) { return d.total})]);

        //console.log("data: ", data)
        let area = d3.area()
            .defined(function (d) { 
                return d.total; 
            })
            .x(function (d) { 
                //console.log("date: ", d.date)
                //console.log("X: ", xScale(d.date))
                return xScale(d.date); 
            })
            .y0(function () { 
                return yScale.range()[0]; 
            })
            .y1(function (d) { 
                //console.log("d.total: ", yScale(d.total))
                return yScale(d.total); 
            });
        
            
        
        //console.log("data post: ", data)
        d3.select(".area")
            .datum(data)
            .attr("fill", "pink")
            .attr("d", area);
            
        d3.selectAll(".x-axis")
            .call(xAxis)
            
        d3.selectAll(".y-axis")
            .call(yAxis)
            


    } // end of update function 

    return {
        update: update // ES6 shorthand for "update": update
    };
} // end of area chart creation function 

////////////////////////////////////////////////////


function StackedAreaChart(container) {
    // initialization
    const margin = ({ top: 50, right: 40, bottom: 50, left: 40 })
    const width = 650 - margin.left - margin.right,
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

    function update(data) {

        // extract leys for stacking
        var stack_keys = data.columns.slice(1)
        console.log("stack-keys: ", stack_keys)

        // compute a stack
        var stack = d3.stack()
                    .keys(stack_keys)
                    .order(d3.stackOrderNone)
                    .offset(d3.stackOffsetNone);

        
        //console.log("stack: ", stack);

        var stackedData = stack(data)
        console.log("series: ", stackedData)

        // update domains for sclaes
        color.domain(stack_keys)

        xScale.domain(d3.extent(data, d => d.date));
        //console.log("xscale: ", xScale)
        //console.log("here: ", d3.extent(data, d => d.date))
        

        yScale.domain([0, d3.max(stackedData, function(d){
            return d3.max(d, function(b){
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
            .x(function(d) {
                
                return xScale(d.data.date);
            })
                    
                    
        
        // create areas based on the stack
        //console.log(stackedData[0].key)
        const areas = svg.selectAll(".area")
            .data(stackedData, function(d) {
                console.log("d looks like: ", d.key)
                return d.key;
            });

        areas.enter() // or you could use join()
            .append("path")
            .attr("class", "area")
            .attr("fill", function(d){
                return color(d.key);
            })
	        .merge(areas)
            .attr("d", area)
            areas.exit().remove();


        // update axes

    }
    return {
        update
    }
} // 


d3.csv("unemployment.csv", d => {
    d3.autoType(d);
    //console.log("d: ", d)
    d["total"] = Object.values(d).slice(1).reduce(function(a, b){
        return a + b;
    });
    //console.log("d.date: ", d3.d.date)
    //var 
    //d.date = new Date(d3.timeParse("%Y-%m-%d %B")(d.date))
    return d;
}).then(data => {
    console.log(data)
    

    //update2(data);


    const areaChart1 = AreaChart(".chart-container1");
    console.log(areaChart1)
    console.log(areaChart1.update(data))

    //areaChart1(data);

    const areaChart2 = StackedAreaChart(".chart-container2")
    areaChart2.update((data));
    

}) // end CSV parsing


