class BeatTrackModule extends Module {
  constructor(app, titleText, styleName, htmlFile, parentElement) {
    // Call the parent constructor
    super(app, titleText, styleName, htmlFile, parentElement);
    this.beatTrackNameDisplay = null;
    this.beatTrackLoadButton = null;
    this.detectBpmButton = null;
    this.bpmMultButton = null;
    this.bpmDivButton = null;
    this.valueSelectorContainer = null;
  }

  // Override setupDOM to handle the DOM elements and event listeners
  setupDOM() {
    super.setupDOM();

    // Query the DOM elements inside this module
    this.moduleContent.id = "beat-track-module-content";
    this.beatTrackNameDisplay = this.moduleContent.querySelector("#beat-track-name-display");
    this.beatTrackLoadButton = this.moduleContent.querySelector("#beat-track-load-button");
    this.detectBpmButton = this.moduleContent.querySelector("#detect-bpm-button");
    this.detectBpmDisplay = this.moduleContent.querySelector("#detect-bpm-display");
    this.bpmMultButton = this.moduleContent.querySelector("#bpm-mult-button");
    this.bpmDivButton = this.moduleContent.querySelector("#bpm-div-button");
    this.bpmCommitButton = this.moduleContent.querySelector("#commit-bpm-button");
    this.valueSelectorContainer = this.moduleContent.querySelector("#beat-track-value-selector");
        console.log("beatTrackNameDisplay: " + this.beatTrackNameDisplay);
    // Validate the presence of required elements
    if (!this.beatTrackNameDisplay) {
      console.warn("Beat track name display not found.");
    }
    if (!this.beatTrackLoadButton) {
      console.warn("Beat track load button not found.");
    }
    if (!this.tryBpmButton) {
      console.warn("Try BPM button not found.");
    }

    // Attach event listeners only if elements exist
    this.beatTrackLoadButton?.addEventListener("click", () => this.openFilePicker());
    this.detectBpmButton?.addEventListener("click", () => this.handleTryBPM());
    this.bpmMultButton?.addEventListener("click", () => this.handleBPMMultiply());
    this.bpmDivButton?.addEventListener("click", () => this.handleBPMDivide());
    this.bpmCommitButton?.addEventListener("click", () => this.handleBPMCommit());

  }

  // Open the file picker via Android interface or fallback
  openFilePicker() {
    if (window.Android) {
      window.Android.openFilePicker("audio");
    } else {
      console.warn("File picker not available in this environment.");
    }
  }

  // Handle file selection event and update the beat track URL
  onFileSelected(fileUrl) {
    console.log("File selected:", fileUrl);

    // Update DiskModule with the new beat track URL
    const diskModule = this.app.getModule("disk");
    if (diskModule) {
      diskModule.beatTrackUrl = fileUrl;
    } else {
      console.warn("DiskModule not found in app.");
    }

    // Update the display with the selected beat track name
    const fileName = fileUrl.split("/").pop(); // Extract the file name from URL
    if (this.beatTrackNameDisplay) {
      this.beatTrackNameDisplay.textContent = fileName || "Unknown File";
    }
  }

  // Handle Try BPM button click (placeholder functionality)
  async handleTryBPM() {
    console.log("Try BPM functionality triggered.");

    // Fetch the beat track file URL from the DiskModule
    const diskModule = this.app.getModule("disk");
    if (!diskModule || !diskModule.beatTrackUrl) {
        console.warn("No beat track URL found in DiskModule.");
        return;
    }

    // Use XMLHttpRequest to load the audio file
    try {
        const lc = new LoadingCover();
        lc.show("Attempting to find BPM, please wait... ")
        const audioBlob = await this._loadAudioFile(diskModule.beatTrackUrl);

        // Analyze BPM using BPMDetector
        const bpmDetector = new BPMDetector();
        const bpm = await bpmDetector.analyzeBPM(audioBlob);

        console.log(`Detected BPM: ${bpm}`);
        lc.hide();
        // Update the detectBpmDisplay element with the BPM value
        if (this.detectBpmDisplay) {
            this.detectBpmDisplay.textContent = bpm;
        } else {
            console.warn("Detect BPM display element not found.");
        }
    } catch (error) {
        console.error("Error analyzing BPM:", error);
    }
}

// Helper method to load audio file using XMLHttpRequest
_loadAudioFile(fileUrl) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", fileUrl, true);
        xhr.responseType = "blob"; // Request the file as a Blob

        xhr.onload = function () {
            if (xhr.status === 200) {
                resolve(xhr.response);
            } else {
                reject(new Error(`Failed to load file: ${xhr.status}`));
            }
        };

        xhr.onerror = function () {
            reject(new Error("An error occurred during the request."));
        };

        xhr.send();
    });
}
  
  async loadValueSelector(){
      const htmlLoader = new HTMLFileLoader();
      const content = await htmlLoader.loadHtmlFromFile(VALUE_SELECTOR_URL);
      this.valueSelectorContainer.innerHTML = content;
      this.parameterValues = this.app.getModule("disk").beatTrackParameterValues;
      this.valueSelector = new ValueSelector(this, this.parameterValues);

  }
  
  handleBPMMultiply(){
    if (this.detectBpmDisplay.textContent != ""){
      let bpm = this.detectBpmDisplay.textContent;
      this.detectBpmDisplay.textContent = bpm*2;
    }
    
  }
  
  handleBPMDivide(){
    if (this.detectBpmDisplay.textContent != ""){
      let bpm = this.detectBpmDisplay.textContent;
      this.detectBpmDisplay.textContent = bpm/2;
    }
  }
  handleBPMCommit(){
    if (this.detectBpmDisplay.textContent != ""){
      let bpm = this.detectBpmDisplay.textContent;
      this.app.getModule("Disk").BPM = bpm;
    }
    
  }
  
}