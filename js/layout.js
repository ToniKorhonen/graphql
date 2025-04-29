
function loadLayout() {
    const app = document.getElementById('app');
    const header = document.createElement('header');
    header.id = 'header';
    const title = document.createElement('h1');
    title.id = 'title';
    const footer = document.createElement('footer');
    
    const footerText = document.createElement('p');
    const content = document.createElement('div');
    content.id = 'content';
    
    app.appendChild(header);
    app.appendChild(content);
    app.appendChild(footer);
    header.appendChild(title);
    footer.appendChild(footerText);

}

export { loadLayout };