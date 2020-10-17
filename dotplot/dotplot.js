var data = d3.csv("heating_test.csv")
    .then(data => {
        data.forEach(d => {
            d.total = +d.total;
            d.utilitygas = +d.utilitygas/d.total;
            d.bottled_tank = +d.bottled_tank/d.total;
            d.electricity = +d.electricity/d.total;
            d.fueloil = +d.fueloil/d.total;
            d.wood = +d.wood/d.total;
            d.solar = +d.solar/d.total;
            d.other_fuel = +d.other_fuel/d.total;
            d.coal_coke = +d.coal_coke/d.total;
        });   

        var allYears = new Set(data.map(d => +d.year));
        // add the options to the year drop-down button
        d3.select("#yearDropdown")
            .selectAll('myOptions')
                .data(allYears)
            .enter()
            .append('option')
            .text(function (d) { return d; }) // text showed in the menu
            .attr("value", function (d) { return d; }); // corresponding value returned by the button

        keys = data.columns.slice(1,data.columns.length - 2); //exclude the total column
        var year = 2019;   
        var yearData = getFilteredData(data, year);
        console.log(yearData);
        render(yearData, keys);

        // When the button is changed, run the updateChart function
        d3.select("#yearDropdown").on("change", function(d) {
            // recover the option that has been chosen
            var selectedYear = d3.select(this).property("value")
            console.log(selectedYear)
            // run the updateChart function with this selected option
            // extract the data for the year selected by user  
            update(yearData)
        });
        
        // add the options to the fuel drop-down button
        d3.select("#fuelDropdown")
            .selectAll('myOptions')
                .data(keys)
            .enter()
            .append('option')
            .text(function (d) { return d; }) // text showed in the menu
            .attr("value", function (d) { return d; }); // corresponding value returned by the button

        // // When the button is changed, run the updateChart function
        // d3.select("#fuelDropdown").on("change", function(d) {
        //     // recover the option that has been chosen
        //     var selectedFuel = d3.select(this).property("value");
        //     console.log(selectedFuel);
        //     // run the updateChart function with this selected option
        //     // extract the data for the year selected by user  
        //     var fuelData = getFilteredData(data, selectedFuel);
        //     update(fuelData);
        // })

    });
  
    function render(yearData, keys) {
        var margin = ({top: 20, right: 10, bottom: 10, left: 95});
        var height = yearData.length*16;
        var width = margin.left + 742 + margin.right;
    
        const color = d3.scaleOrdinal()
                    .domain(keys)
                    .range(d3.schemeTableau10);
        
        console.log("second render:", yearData);
    
        x = d3.scaleLinear()
            .domain([-0.01, d3.max(yearData, d => d3.max(keys, k => d[k]))])
            .rangeRound([margin.left, width - margin.right])
    
        y = d3.scalePoint()
            .domain(yearData.map(d => d.state).sort(d3.ascending))
            .rangeRound([margin.top, height - margin.bottom])
            .padding(1)

        xAxis = g => g
            .attr("transform", `translate(0,${margin.top})`)
            .call(d3.axisTop(x).ticks(null, "%"))
            .call(g => g.selectAll(".tick line").clone().attr("stroke-opacity", 0.1).attr("y2", height - margin.bottom))
            .call(g => g.selectAll(".domain").remove());

        const c = chart();
        (async () => {
            for await (const val of c) {
                console.log(val); // Prints "Hello"
            }
            })();
        
        async function* chart()  {
            
            const svg = d3.select("#chart").append("svg")
                .attr("viewBox", [0, 0, width, height]);
    
            svg.append("g")
                .call(xAxis);
    
            const g = svg.append("g")
                .attr("text-anchor", "end")
                .style("font", "10px sans-serif")
                .selectAll("g")
                .data(yearData)
                .join("g")
                .attr("transform", (d, i) => `translate(0,${y(d.state)})`);
    
            g.append("line")
                .attr("stroke", "#aaa")
                .attr("x1", d => x(d3.min(keys, k => d[k])))
                .attr("x2", d => x(d3.max(keys, k => d[k])));
    
            g.append("g")
                .selectAll("circle")
                .data(d => d3.cross(keys, [d]))
                .join("circle")
                .attr("cx", ([k, d]) => x(d[k]))
                .attr("fill", ([k]) => color(k))
                .attr("opacity", "0.8")
                .attr("r", 5);
    
            g.append("text")
                .attr("dy", "0.35em")
                .attr("style", "bold")
                .attr("x", margin.left)
                .text((d, i) => d.state);

            g.exit().remove()    
    
            return Object.assign(svg.node(), {
                update(states) {
                y.domain(states);
    
                g.transition()
                    .delay((d, i) => i * 10)
                    .attr("transform", d => `translate(0,${y(d.state)})`)
                }
            });
        };
     
    }
    
    // Get a subset of the data based on the group
    function getFilteredData(data, year) {
        return data.filter(function(d){return d.year == year;})
    }
    function update(yearData) {
        const index = d3.range(yearData.length);
        const order = yearDropdown === 2015 ? d3.ascending : d3.descending;
        index.sort((i, j) => order(yearData[i][yearDropdown], yearData[j][yearDropdown]));
        return chart
    };  