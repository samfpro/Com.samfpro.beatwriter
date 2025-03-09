class ConsoleToDiv {
    static instance = null;

    constructor(options = {}) {
        if (ConsoleToDiv.instance) {
            return ConsoleToDiv.instance;
        }
        ConsoleToDiv.instance = this;

        this.options = {
            divId: 'console-container',
            maxMessages: 200,
            showTimestamp: true,
            captureErrors: true,
            captureWarnings: true,
            captureAlerts: true,
            showSource: true,  // New option to display error source
            ...options
        };

        this.originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn
        };
        this.originalAlert = window.alert;
        this.messages = [];
        this.init();
    }

    init() {
        this.createContainer();
        this.applyStyles();
        this.overrideConsoleMethods();
        if (this.options.captureAlerts) this.overrideAlert();
    }

    createContainer() {
        this.container = document.getElementById(this.options.divId);
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = this.options.divId;
            document.body.appendChild(this.container);
        }
    }

    applyStyles() {
        const styleId = `${this.options.divId}-styles`;
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                #${this.options.divId} {
                    width: 800px;
                    height: 300px;
                    overflow-y: auto;
                    background: rgba(0, 0, 0, 0.8);
                    color: #00ff00;
                    padding: 10px;
                    font-family: monospace;
                    font-size: 14px;
                    z-index: 9999;
                    border-radius: 5px;
                    pointer-events: none;
                }
                .console-message {
                    margin-bottom: 4px;
                    word-break: break-word;
                }
                .timestamp {
                    color: #888;
                    margin-right: 8px;
                }
                .console-error { color: #ff4444; }
                .console-warn { color: #ffaa44; }
                .console-alert { color: #44aaff; font-weight: bold; }
                .source-info {
                    font-size: 12px;
                    color: #999;
                }
            `;
            document.head.appendChild(style);
        }
    }

    overrideConsoleMethods() {
        console.log = this.createHandler('log').bind(this);
        if (this.options.captureErrors) console.error = this.createHandler('error').bind(this);
        if (this.options.captureWarnings) console.warn = this.createHandler('warn').bind(this);
    }

    overrideAlert() {
        window.alert = (message) => {
            this.handleMessage('alert', [message]);
            this.originalAlert(message);
        };
    }

    createHandler(type) {
        return (...args) => {
            this.originalConsole[type](...args);
            this.handleMessage(type, args);
        };
    }

    getCallerInfo() {
    try {
        const stack = new Error().stack.split("\n");
        
        // Skip lines that belong to ConsoleToDiv
        for (let i = 3; i < stack.length; i++) { 
            if (!stack[i].includes("ConsoleToDiv.")) {  // Ignore internal logging
                const match = stack[i].match(/at\s+(.*?)\s+(.*?):(\d+):(\d+)/) ||
                              stack[i].match(/at\s+(.*?):(\d+):(\d+)/); // Handle different formats

                if (match) {
                    const functionName = match[1].trim() || "Anonymous Function";
                    const file = match[2] || match[1]; // Handle different stack formats
                    const line = match[3];
                    return `${functionName} (${file}:${line})`;
                }
            }
        }
        return "Unknown Source";
    } catch (e) {
        return "Error Retrieving Source";
    }
}
    handleMessage(type, args) {
        const messageElement = document.createElement('div');
        messageElement.className = `console-message console-${type}`;

        if (this.options.showTimestamp) {
            const timestamp = document.createElement('span');
            timestamp.className = 'timestamp';
            timestamp.textContent = new Date().toLocaleTimeString();
            messageElement.appendChild(timestamp);
        }

        const content = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');

        const sourceInfo = this.getCallerInfo();
        const sourceElement = document.createElement('div');
        sourceElement.className = 'source-info';
        sourceElement.textContent = `[${sourceInfo}]`;

        messageElement.appendChild(document.createTextNode(content));
        messageElement.appendChild(sourceElement);

        this.messages.unshift(messageElement);
        this.container.insertBefore(messageElement, this.container.firstChild);

        if (this.messages.length > this.options.maxMessages) {
            const oldMessage = this.messages.pop();
            if (oldMessage.parentNode === this.container) {
                this.container.removeChild(oldMessage);
            }
        }
    }

    destroy() {
        console.log = this.originalConsole.log;
        console.error = this.originalConsole.error;
        console.warn = this.originalConsole.warn;
        window.alert = this.originalAlert;
        ConsoleToDiv.instance = null;
    }
}