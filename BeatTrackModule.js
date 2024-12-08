class BeatTrackModule extends Module {
  constructor(app, titleText, styleName, htmlFile, parentElement) {
    // Call the parent constructor
    super(app, titleText, styleName, htmlFile, parentElement);
    this.beatTrackNameDisplay = null;
    this.beatTrackLoadButton = null;
    this.tryBpmButton = null;
    this.valueSelectorContainer = null;
  }

  // Override setupDOM to handle the DOM elements and event listeners
  setupDOM() {
    super.setupDOM();

    // Query the DOM elements inside this module
    this.moduleContent.id = "beat-track-module-content";
    this.beatTrackNameDisplay = this.moduleContent.querySelector("#beat-track-name-display");
    this.beatTrackLoadButton = this.moduleContent.querySelector("#beat-track-load-button");
    this.tryBpmButton = this.moduleContent.querySelector("#try-bpm-button");
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
    this.tryBpmButton?.addEventListener("click", () => this.handleTryBPM());

    
  }

  // Open the file picker via Android interface or fallback
  openFilePicker() {
    if (window.Android) {
      window.Android.openFilePicker();
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
  handleTryBPM() {
    console.log("Try BPM functionality triggered.");
    // Placeholder for Try BPM functionality
  }
  
  async loadValueSelector(){
      const htmlLoader = new HTMLFileLoader();
      const content = await htmlLoader.loadHtmlFromFile(VALUE_SELECTOR_URL);
      this.valueSelectorContainer.innerHTML = content;
      this.parameterValues = this.app.getModule("disk").beatTrackParameterValues;
      this.valueSelector = new ValueSelector(this, this.parameterValues);

  }
  
  
  
}