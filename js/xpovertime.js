import { fetchGraphql } from "./fetchGraphql.js";

async function loadXPOverTime(data) {
    const transactions = await getXPOvertime(data.user[0].id)

    const aggregated = aggregateXPOverTime(transactions);

    renderXPLineChart(aggregated);

}



function aggregateXPOverTime(transactions) {
    const xpByDate = {};

    transactions.forEach(tx => {
        const date = new Date(tx.createdAt).toISOString().split("T")[0]; // 'YYYY-MM-DD'
        xpByDate[date] = (xpByDate[date] || 0) + tx.amount;
    });

    // Sort dates and return array of { date, amount }
    return Object.entries(xpByDate)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .map(([date, amount]) => ({ date, amount }));
}

async function getXPOvertime(id) {
    const query = `{
        transaction(where: {type: {_eq: "xp"}, userId: {_eq: ${id}}}, order_by: {createdAt: desc}) {
            amount
            createdAt
        }
    }
    `

    const data = await fetchGraphql(query);
    console.log(data);

    return data.transaction;
}

function renderXPLineChart(data) {
    // Create a scrollable container with styled border and shadow
    const wrapper = document.createElement('div');
    wrapper.style.overflowX = 'auto';
    wrapper.style.width = '100%';
    wrapper.style.marginTop = '20px';
    wrapper.style.marginBottom = '20px';
    wrapper.style.borderRadius = '4px';
    wrapper.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    
    // Define chart dimensions and parameters
    const padding = 60;
    const height = 500;
    // Make sure we have enough width for all data points
    const width = Math.max(600, padding * 2 + data.length * 80);
    const chartHeight = height - padding * 2;
    const maxXP = Math.max(...data.map(d => d.amount));
    
    // Create the SVG element with improved styling
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.style.background = "linear-gradient(to bottom, #ffffff, #f9f9f9)";
    svg.style.borderRadius = "4px";
    
    // Add chart title
    const title = document.createElementNS("http://www.w3.org/2000/svg", "text");
    title.setAttribute("x", width / 2);
    title.setAttribute("y", padding / 2);
    title.setAttribute("text-anchor", "middle");
    title.setAttribute("font-size", "16");
    title.setAttribute("font-weight", "bold");
    title.textContent = "XP Progress Over Time";
    svg.appendChild(title);
    
    // Draw Y-axis with grid lines
    const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yAxis.setAttribute("x1", padding);
    yAxis.setAttribute("y1", padding);
    yAxis.setAttribute("x2", padding);
    yAxis.setAttribute("y2", height - padding);
    yAxis.setAttribute("stroke", "#555");
    svg.appendChild(yAxis);
    
    // Y-axis label
    const yLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    yLabel.setAttribute("transform", `rotate(-90, ${padding/3}, ${height/2})`);
    yLabel.setAttribute("x", padding/3);
    yLabel.setAttribute("y", height/2);
    yLabel.setAttribute("text-anchor", "middle");
    yLabel.setAttribute("font-size", "12");
    yLabel.textContent = "XP Amount";
    svg.appendChild(yLabel);
    
    // Draw grid lines for Y-axis (5 lines)
    for (let i = 0; i <= 5; i++) {
        const yPos = height - padding - (i / 5) * chartHeight;
        const gridLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        gridLine.setAttribute("x1", padding);
        gridLine.setAttribute("y1", yPos);
        gridLine.setAttribute("x2", width - padding);
        gridLine.setAttribute("y2", yPos);
        gridLine.setAttribute("stroke", "#e0e0e0");
        gridLine.setAttribute("stroke-dasharray", "3,3");
        svg.appendChild(gridLine);
        
        // Add Y-axis value labels
        const valueLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
        valueLabel.setAttribute("x", padding - 10);
        valueLabel.setAttribute("y", yPos);
        valueLabel.setAttribute("text-anchor", "end");
        valueLabel.setAttribute("dominant-baseline", "middle");
        valueLabel.setAttribute("font-size", "10");
        valueLabel.textContent = Math.round(maxXP * i / 5);
        svg.appendChild(valueLabel);
    }
    
    // Draw X-axis
    const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xAxis.setAttribute("x1", padding);
    xAxis.setAttribute("y1", height - padding);
    xAxis.setAttribute("x2", width - padding);
    xAxis.setAttribute("y2", height - padding);
    xAxis.setAttribute("stroke", "#555");
    svg.appendChild(xAxis);
    
    // X-axis label
    const xLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    xLabel.setAttribute("x", width / 2);
    xLabel.setAttribute("y", height - padding / 3);
    xLabel.setAttribute("text-anchor", "middle");
    xLabel.setAttribute("font-size", "12");
    xLabel.textContent = "Date";
    svg.appendChild(xLabel);
    
    // Calculate points for the line chart
    const points = data.map((item, i) => {
        const x = padding + i * ((width - padding * 2) / (data.length - 1 || 1));
        const y = height - padding - (item.amount / maxXP) * chartHeight;
        return [x, y];
    });
    
    // Create gradient for the area under the line
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    gradient.setAttribute("id", "area-gradient");
    gradient.setAttribute("x1", "0%");
    gradient.setAttribute("y1", "0%");
    gradient.setAttribute("x2", "0%");
    gradient.setAttribute("y2", "100%");
    
    const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", "rgba(74, 144, 226, 0.6)");
    gradient.appendChild(stop1);
    
    const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("stop-color", "rgba(74, 144, 226, 0.1)");
    gradient.appendChild(stop2);
    
    defs.appendChild(gradient);
    svg.appendChild(defs);
    
    // Draw area under the line
    const areaPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const areaPathD = `
        M ${points[0][0]},${height - padding} 
        L ${points[0][0]},${points[0][1]} 
        ${points.map(p => `L ${p[0]},${p[1]}`).join(" ")} 
        L ${points[points.length-1][0]},${height - padding} Z
    `;
    areaPath.setAttribute("d", areaPathD);
    areaPath.setAttribute("fill", "url(#area-gradient)");
    areaPath.setAttribute("opacity", "0.7");
    svg.appendChild(areaPath);
    
    // Draw the line connecting data points with smooth curve
    const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    polyline.setAttribute("fill", "none");
    polyline.setAttribute("stroke", "#4A90E2");
    polyline.setAttribute("stroke-width", "3");
    polyline.setAttribute("points", points.map(p => p.join(",")).join(" "));
    polyline.setAttribute("stroke-linecap", "round");
    polyline.setAttribute("stroke-linejoin", "round");
    svg.appendChild(polyline);
    
    // Draw data points and labels
    points.forEach(([x, y], i) => {
        const { date, amount } = data[i];
        
        // Draw circle for data point
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", 5);
        circle.setAttribute("fill", "white");
        circle.setAttribute("stroke", "#4A90E2");
        circle.setAttribute("stroke-width", "2");
        
        // Add hover effect and tooltip
        circle.setAttribute("class", "data-point");
        circle.addEventListener("mouseover", () => {
            circle.setAttribute("r", "7");
            tooltip.style.display = "block";
            tooltip.style.left = `${x + 10}px`;
            tooltip.style.top = `${y - 10}px`;
            tooltip.textContent = `${date}: ${amount} XP`;
        });
        circle.addEventListener("mouseout", () => {
            circle.setAttribute("r", "5");
            tooltip.style.display = "none";
        });
        svg.appendChild(circle);
        
        // Add amount label above the point
        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", x);
        label.setAttribute("y", y - 15);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("font-size", "11");
        label.setAttribute("font-weight", "bold");
        label.textContent = amount;
        svg.appendChild(label);
        
        // Add date label below the X-axis with improved formatting
        const dateLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
        dateLabel.setAttribute("x", x);
        dateLabel.setAttribute("y", height - padding + 15);
        dateLabel.setAttribute("text-anchor", "middle");
        dateLabel.setAttribute("font-size", "10");
        
        // Format date as MM-DD
        const formattedDate = date.slice(5);
        dateLabel.textContent = formattedDate;
        svg.appendChild(dateLabel);
    });
    
    // Create a tooltip element for interactive data display
    const tooltip = document.createElement("div");
    tooltip.style.position = "absolute";
    tooltip.style.display = "none";
    tooltip.style.background = "rgba(0,0,0,0.7)";
    tooltip.style.color = "white";
    tooltip.style.padding = "5px";
    tooltip.style.borderRadius = "3px";
    tooltip.style.fontSize = "12px";
    tooltip.style.pointerEvents = "none";
    tooltip.style.zIndex = "1000";
    
    // Append chart to the document
    wrapper.appendChild(svg);
    wrapper.appendChild(tooltip);
    document.getElementById('content').appendChild(wrapper);
}

export { loadXPOverTime };