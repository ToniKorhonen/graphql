import { fetchGraphql } from './fetchGraphql.js';

async function loadXPgraph(data) {
    const transactions = await getXPperProject(data.user[0].id)
    const xpMap = aggregateXP(transactions);

    renderChart(xpMap);
}

async function getXPperProject(id) {
    const query = `{
        transaction(where: {type: {_eq: "xp"}, userId: {_eq: ${id}}}) {
            amount
            object {
                name
            }
        }
    }`;

    const data = await fetchGraphql(query);
    console.log(data);

    return data.transaction;
}

function aggregateXP(transactions) {
    const xpMap = {};

    transactions.forEach(tx => {
        const project = tx.object?.name || "Unknown";
        xpMap[project] = (xpMap[project] || 0) + tx.amount;
    });

    return Object.entries(xpMap).map(([name, amount]) => ({ name, amount }));
}

function renderChart(data) {
    const existingWrapper = document.getElementById('xp-chart-wrapper');
    if (existingWrapper) existingWrapper.remove();

    const wrapper = document.createElement('div');
    wrapper.id = 'xp-chart-wrapper';
    wrapper.style.display = 'block';
    wrapper.style.overflowX = 'auto';
    wrapper.style.width = '100%';
    wrapper.style.padding = '20px 0';
    wrapper.style.backgroundColor = '#f5f8ff';
    wrapper.style.borderRadius = '8px';
    wrapper.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';

    // Add title
    const title = document.createElement('h2');
    title.textContent = 'XP by Project';
    title.style.textAlign = 'center';
    title.style.color = '#333';
    title.style.fontFamily = 'Arial, sans-serif';
    title.style.margin = '10px 0 30px';
    wrapper.appendChild(title);

    const height = 500;
    const padding = 60;
    const barWidth = 40;
    const charWidth = 8;
    const extraSpacing = 30;

    const labelsWidth = data.map(d => d.name.length * charWidth + extraSpacing);
    const width = Math.max(labelsWidth.reduce((a, b) => a + b, 0) + padding * 2, window.innerWidth);

    const maxXP = Math.max(...data.map(d => d.amount));
    const chartHeight = height - padding * 3;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.style.fontFamily = 'Arial, sans-serif';

    // Add grid lines
    for (let i = 0; i <= 5; i++) {
        const y = height - padding * 2 - (chartHeight / 5) * i;
        const gridLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        gridLine.setAttribute("x1", padding);
        gridLine.setAttribute("y1", y);
        gridLine.setAttribute("x2", width - padding);
        gridLine.setAttribute("y2", y);
        gridLine.setAttribute("stroke", "#e0e0e0");
        gridLine.setAttribute("stroke-width", "1");
        gridLine.setAttribute("stroke-dasharray", "5,5");
        svg.appendChild(gridLine);
        
        // Y-axis labels
        const yLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
        yLabel.setAttribute("x", padding - 10);
        yLabel.setAttribute("y", y + 5);
        yLabel.setAttribute("text-anchor", "end");
        yLabel.setAttribute("font-size", "12");
        yLabel.setAttribute("fill", "#555");
        yLabel.textContent = Math.round((maxXP / 5) * i);
        svg.appendChild(yLabel);
    }

    // Y-axis
    const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yAxis.setAttribute("x1", padding);
    yAxis.setAttribute("y1", padding);
    yAxis.setAttribute("x2", padding);
    yAxis.setAttribute("y2", height - padding * 2);
    yAxis.setAttribute("stroke", "#333");
    yAxis.setAttribute("stroke-width", "2");
    svg.appendChild(yAxis);

    // X-axis
    const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xAxis.setAttribute("x1", padding);
    xAxis.setAttribute("y1", height - padding * 2);
    xAxis.setAttribute("x2", width - padding);
    xAxis.setAttribute("y2", height - padding * 2);
    xAxis.setAttribute("stroke", "#333");
    xAxis.setAttribute("stroke-width", "2");
    svg.appendChild(xAxis);

    // Define gradient
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    gradient.setAttribute("id", "barGradient");
    gradient.setAttribute("gradientTransform", "rotate(90)");
    
    const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", "#6366F1");
    
    const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("stop-color", "#8B5CF6");
    
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.appendChild(defs);

    // Bars
    let currentX = padding + extraSpacing;
    data.forEach((item, i) => {
        const barHeight = (item.amount / maxXP) * chartHeight;
        const x = currentX;
        const y = height - padding * 2 - barHeight;

        // Bar with animation
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", x);
        rect.setAttribute("y", height - padding * 2);
        rect.setAttribute("width", barWidth);
        rect.setAttribute("height", 0);
        rect.setAttribute("fill", "url(#barGradient)");
        rect.setAttribute("rx", "5");
        rect.setAttribute("ry", "5");
        rect.style.transition = "height 1s, y 1s";
        rect.style.cursor = "pointer";
        
        // Tooltip
        const tooltip = document.createElementNS("http://www.w3.org/2000/svg", "title");
        tooltip.textContent = `${item.name}: ${item.amount} XP`;
        rect.appendChild(tooltip);
        
        svg.appendChild(rect);
        
        // Animate after a small delay
        setTimeout(() => {
            rect.setAttribute("height", barHeight);
            rect.setAttribute("y", y);
        }, i * 100);

        // Add hover effect
        rect.addEventListener('mouseover', () => {
            rect.setAttribute("fill", "#4F46E5");
            valueLabel.setAttribute("font-weight", "bold");
        });
        
        rect.addEventListener('mouseout', () => {
            rect.setAttribute("fill", "url(#barGradient)");
            valueLabel.setAttribute("font-weight", "normal");
        });

        // XP value above bar
        const valueLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
        valueLabel.setAttribute("x", x + barWidth / 2);
        valueLabel.setAttribute("y", y - 10);
        valueLabel.setAttribute("text-anchor", "middle");
        valueLabel.setAttribute("font-size", "14");
        valueLabel.setAttribute("fill", "#333");
        valueLabel.textContent = item.amount;
        svg.appendChild(valueLabel);

        // Project name below bar
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", x + barWidth / 2);
        text.setAttribute("y", height - padding + 10);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("font-size", "12");
        text.setAttribute("fill", "#555");
        text.style.fontWeight = "bold";
        text.textContent = item.name;
        svg.appendChild(text);

// Updated positioning logic
currentX += Math.max(item.name.length * charWidth + extraSpacing, barWidth + extraSpacing * 2);    });

    wrapper.appendChild(svg);
    document.getElementById('content').appendChild(wrapper);
}



export { loadXPgraph };