var parseDate = d3.timeParse("%m/%d/%Y");
d3.csv("final_dataset_101520.csv")
    .then(data => {
        data.forEach(d => {
            d.value = +d.house_median_value;
            d.date = parseDate(d.date);
        });
        render(data);
        
    });

function render(data) {
    var margin = ({top: 16, right: 30, bottom: 6, left: 20});
    var barSize = 24;
    var n = 12;
    var duration = 250;
    var width = margin.left + 742 + margin.right;
    var height = margin.top + barSize * n + margin.bottom;
    var k = 10;

    var states = new Set(data.map(d => d.state));
    
    var datevalues = Array.from(d3.rollup(data, ([d]) => d.value, d => +d.date, d => d.state))
                        .map(([date, data]) => [new Date(date), data])
                        .sort(([a], [b]) => d3.ascending(a, b));

    function rank(value) {
        const data = Array.from(states, state => ({state, value: value(state) || 0}));
        data.sort((a, b) => d3.descending(a.value, b.value));
        for (let i = 0; i < data.length; ++i) data[i].rank = Math.min(n, i);
        return data;
    };

    // function keyframes() {
    const keyframes = [];
    let ka, a, kb, b;
    for ([[ka, a], [kb, b]] of d3.pairs(datevalues)) {
        for (let i = 0; i < k; ++i) {
        const t = i / k;
        keyframes.push([
            new Date(ka * (1 - t) + kb * t),
            rank(state => a.get(state) * (1 - t) + b.get(state) * t)
        ]);
        }
    };
    keyframes.push([new Date(kb), rank(state => b.get(state))]);

    var stateframes = d3.groups(keyframes.flatMap(([, data]) => data), d => d.state);
    var prev = new Map(stateframes.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a])));
    var next = new Map(stateframes.flatMap(([, data]) => d3.pairs(data)));
    var y = d3.scaleBand()
                .domain(d3.range(n + 1))
                .rangeRound([margin.top, margin.top + barSize * (n + 1 + 0.1)])
                .padding(0.1);

    var x = d3.scaleLinear([0, 1], [margin.left, width - margin.right]);
   
    var formatDate = d3.utcFormat("%Y");
    var formatNumber = d3.format(",d");
    
    function ticker(svg) {
        const now = svg.append("text")
            .attr("font-size",`${barSize}px`)
            .attr("font-family", "sans-serif")
            .attr("text-anchor", "end")
            .attr("x", width - 6)
            .attr("y", margin.top + barSize * (n - 0.45))
            .attr("dy", "0.32em")
            .text(formatDate(keyframes[0][0]));

        return ([date], transition) => {
            transition.end().then(() => now.text(formatDate(date)));
        };
    };

    function axis(svg) {
        const g = svg.append("g")
            .attr("transform", `translate(0,${margin.top})`);
    
        const axis = d3.axisTop(x)
            .ticks(width / 160)
            .tickSizeOuter(0)
            .tickSizeInner(-barSize * (n + y.padding()));
    
        return (_, transition) => {
        g.transition(transition).call(axis);
        g.select(".tick:first-of-type text").remove();
        g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "white");
        g.select(".domain").remove();
        };
    };

    function textTween(a, b) {
        const i = d3.interpolateNumber(a, b);
        return function(t) {
        this.textContent = formatNumber(i(t));
        };
    };

    function bars(svg) {
        let bar = svg.append("g")
            .attr("fill-opacity", 0.6)
        .selectAll("rect");
    
        const scale = d3.scaleOrdinal(d3.schemeTableau10);
        return ([date, data], transition) => bar = bar
        .data(data.slice(0, n), d => d.state)
        .join(
            enter => enter.append("rect")
            .attr("fill", d => scale(d.state))
            .attr("height", y.bandwidth())
            .attr("x", x(0))
            .attr("y", d => y((prev.get(d) || d).rank))
            .attr("width", d => x((prev.get(d) || d).value) - x(0)),
            update => update,
            exit => exit.transition(transition).remove()
            .attr("y", d => y((next.get(d) || d).rank))
            .attr("width", d => x((next.get(d) || d).value) - x(0))
        )
        .call(bar => bar.transition(transition)
            .attr("y", d => y(d.rank))
            .attr("width", d => x(d.value) - x(0)));
    };

    function labels(svg) {
        let label = svg.append("g")
            .attr("text-anchor", "end")
        .selectAll("text");
    
        return ([date, data], transition) => label = label
        .data(data.slice(0, n), d => d.state)
        .join(
            enter => enter.append("text")
            .attr("transform", d => `translate(${x((prev.get(d) || d).value)},${y((prev.get(d) || d).rank)})`)
            .attr("y", y.bandwidth() / 2)
            .attr("x", -6)
            .attr("dy", "-0.25em")
            .attr("font-size",`${barSize/3}px`)
            .attr("font-family", "sans-serif")
            .text(d => d.state)
            .call(text => text.append("tspan")
                .attr("fill-opacity", 0.7)
                .attr("font-weight", "normal")
                .attr("x", -6)
                .attr("dy", "1.15em")),
            update => update,
            exit => exit.transition(transition).remove()
            .attr("transform", d => `translate(${x((next.get(d) || d).value)},${y((next.get(d) || d).rank)})`)
            .call(g => g.select("tspan").tween("text", d => textTween(d.value, (next.get(d) || d).value)))
        )
        .call(bar => bar.transition(transition)
            .attr("transform", d => `translate(${x(d.value)},${y(d.rank)})`)
            .call(g => g.select("tspan").tween("text", d => textTween((prev.get(d) || d).value, d.value))));
    };

    
    async function* chart() {
        const svg = d3.select("#chart").append("svg")
            .attr("viewBox", [0, 0, width, height]);

        const updateBars = bars(svg);
        const updateAxis = axis(svg);
        const updateLabels = labels(svg);
        const updateTicker = ticker(svg);
 
        yield svg.node();

        for (const keyframe of keyframes) {
            const transition = svg.transition()
                .duration(duration)
                .ease(d3.easeLinear);

            // Extract the top bar’s value.
            x.domain([0, keyframe[1][0].value]);

            updateAxis(keyframe, transition);
            updateBars(keyframe, transition);
            updateLabels(keyframe, transition);
            updateTicker(keyframe, transition);

            // invalidation.then(() => svg.interrupt());
            await transition.end();
        };
    };
    
    const c = chart();
    (async () => {
        for await (const val of c) {
          console.log(val); 
        }
      })();
};