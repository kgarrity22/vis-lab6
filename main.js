import AreaChart from './AreaChart.js';
import StackedAreaChart from './StackedAreaChart.js';

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

    const areaChart = AreaChart(".chart-container2");
    //console.log(areaChart1)
    console.log(areaChart.update(data))

    const stackedAreaChart = StackedAreaChart(".chart-container1")
    stackedAreaChart.update((data));

    areaChart.on("brushed", (range) => {
        stackedAreaChart.filterByDate(range); // coordinating with stackedAreaChart
    });

    

    

    
    

}) // end CSV parsing


