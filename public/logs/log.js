import logs from "./logs.js";

const logId = new URLSearchParams(window.location.search).get("log");
const currentLog = logs[logId];
const logContent = document.createElement("div");
logContent.id = "logContent";

// Thanks ChatGPT!
const parseContent = (input) => {
    // Split the input string into lines
    const lines = input.split('\n');
    let output = '';

    // Regular expressions to match Markdown elements
    const headingRegex = /(#+)\s(.+)$/;
    const hrRegex = /---$/;
    const codeBlockStartRegex = /```(\w+)$/;
    const codeBlockEndRegex = /```$/;
    const imgRegex = /\!\[(.*?)\]/;
    const linkRegex = /\[(.*)]\((.+)\)/;
    let inCodeBlock = false;

    // Iterate through each line
    for (const line of lines) {
        if (line.match(headingRegex)) {
            // Match headings (H1, H2, H3)
            const [, headingSymbols, text] = line.match(headingRegex);
            const headingLevel = headingSymbols.length;
            output += `<h${headingLevel}>${text}</h${headingLevel}>\n`;
        } else if (line.match(hrRegex)) {
            // Match horizontal rule (---)
            output += '<hr>\n';
        } else if (line.match(codeBlockStartRegex)) {
            // Match code block start (```language)
            const [, language] = line.match(codeBlockStartRegex);
            output += '<code>\n';
            output += `<h3>${language}</h3>\n`;
            inCodeBlock = true;
        } else if (line.match(codeBlockEndRegex) && inCodeBlock) {
            // Match code block end (```)
            output += '</code>\n';
            inCodeBlock = false;
        } else if (line.match(imgRegex)) {
            const imgSrc = line.match(imgRegex)[1];
            output += `<img src="/img/${imgSrc}"></img>`
        } else if (line.match(linkRegex)) {
            const [, linkText, link] = line.match(linkRegex);
            const newLine = line.replace(linkRegex, `<a href="${link}">${linkText}</a>`);
            output += newLine;
        } else {
            // Handle normal text or code block lines
            if (inCodeBlock) {
                // Inside a code block, wrap the line in <p> tags
                output += `<p>${line}</p>\n`;
            } else {
                // Outside a code block, treat it as plain text
                output += `${line}\n`;
            }
        }
        output += "<br />";
    }

    return output;
}

if (currentLog) 
    logContent.innerHTML = parseContent(currentLog.content);
else {
    const title = document.createElement("h1");
    title.textContent = "404 - Log Not Found";
    logContent.appendChild(title);
}

document.body.appendChild(logContent);