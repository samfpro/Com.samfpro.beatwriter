class AlertBox {
    constructor() {
        this.createAlertBox();
    }

    createAlertBox() {
        this.alertBox = document.createElement("div");
        this.alertBox.className = "alert-box";
        this.alertBox.innerHTML = `
            <div class="alert-content">
                <p id="alert-message"></p>
                <input type="text" id="alert-input" style="display:none;" />
                <div class="alert-buttons">
                    <button id="alert-ok">OK</button>
                    <button id="alert-cancel">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(this.alertBox);

        this.messageElement = this.alertBox.querySelector("#alert-message");
        this.inputElement = this.alertBox.querySelector("#alert-input");
        this.okButton = this.alertBox.querySelector("#alert-ok");
        this.cancelButton = this.alertBox.querySelector("#alert-cancel");

        this.okButton.addEventListener("click", () => this.handleOk());
        this.cancelButton.addEventListener("click", () => this.close());
    }

    show(message, options = {}) {
        this.messageElement.textContent = message;

        if (options.input) {
            this.inputElement.style.display = "block";
            this.inputElement.value = "";
        } else {
            this.inputElement.style.display = "none";
        }

        this.callback = options.callback || null;
        this.alertBox.style.display = "flex";
    }

    handleOk() {
        if (this.callback) {
            const inputValue = this.inputElement.style.display === "block" ? this.inputElement.value : null;
            this.callback(inputValue);
        }
        this.close();
    }

    close() {
        this.alertBox.style.display = "none";
    }
}

// Create a global instance
const Alert = new AlertBox();
