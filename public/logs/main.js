import logs from "./logs.js";

const logContainer = document.getElementById("logContainer");

logContainer.innerHTML = "";
Object.keys(logs).forEach(k => {
    const l = logs[k];
    const log = document.createElement("a");
    log.id = "log";
    log.href = `./log.html?log=${k}`;

    const title = document.createElement("h3");
    title.textContent = l.title;
    log.appendChild(title);

    const desc = document.createElement("p");
    desc.textContent = l.description;
    log.appendChild(desc);
    
    logContainer.appendChild(log);
})
