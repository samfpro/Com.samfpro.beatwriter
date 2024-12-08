class DiskModule extends Module {
  constructor(app, titleText, styleName, htmlFile, parentElement) {
    // Call the parent class constructor
    super(app, titleText, styleName, htmlFile, parentElement);

    // Initialize default values for properties
    this._projectName = "";
    this._projectUrl = "";
    this._beatTrackUrl = ""; 
    this._beatTrackLeadInBars = 0;
    this._startMarkerPosition = 0;
    this._endMarkerPosition = 0;
    this._currentCell = null;
    this._mode = MODE_WRITE;
    console.log("MODE_WRITE: " + MODE_WRITE);   // Default mode, can be updated later
    this.propertiesDisplay= null;
    this.ac = app.ac;
    this.cells = [];
        // Initialize the beatTrackParameterValues array
    this.beatTrackParameterValues = [
      new ParameterValue("LeadInMS", "LIMS", 0, 10000, 0, "number"),
      new ParameterValue("LeadInBars", "LIBR", 0, 64, 0, "number"),
      new ParameterValue("PlayRate", "PLRT", 0, 300, 100, "number"),
    ];

    // Initialize the playParameterValues array
    this.playParameterValues = [
      new ParameterValue("BPM", "MBPM", 0, 240, 120, "number"),
      new ParameterValue("TtsRate", "TTSR", 1, 4, 3, "number"),
      new ParameterValue("TtsVoice", "TTSV", 1, 27, 4, "number"),
    ];
  }

  setupDOM() {
    // Call the parent setupDOM
    super.setupDOM();

    // Move the module container in the DOM hierarchy
    const fileManagerContainer = this.app.getModule("fileManager").moduleContainer;
    if (fileManagerContainer && this.parentElement) {
      this.parentElement.insertBefore(this.moduleContainer, fileManagerContainer);
      console.log("DiskModule moved before FileManagerModule in the DOM.");
    } else {
      console.warn("FileManagerModule or parentElement not found.");
    }

    // Attempt to find the properties display element
    this.propertiesDisplay = this.moduleContent.querySelector("#properties-display");
    if (this.propertiesDisplay) {
      console.log("propertiesDisplay successfully initialized.");
      this.beatTrackUrl = "beatTrack/Turtletuck_83BPM.mp3";
      this.BPM = 83;
      console.log("setting mode");
      this.mode = MODE_WRITE;
      
    } else {
      console.error("propertiesDisplay element is not available.");
    }
    this.app.getModule("gridView").generateGrid(this.cells);
    this.app.getModule("beatTrack").loadValueSelector();
     this.app.getModule("playParameters").loadValueSelector();
 
    this.startMarkerPosition = 0;
    this.endMarkerPosition = 4;
    this.updatePropertiesDisplay();
  }

  updatePropertiesDisplay() {
    // Ensure properties display exists before attempting updates
    let modeText = null;
    if (this._mode == 0){
      modeText = "Write";
    } else if(this._mode == 1){
      modeText = "Arrange";
    }else{
      modeText = "Play";
    }
    let startMarkerPositionText = "";
    if (this.startMarkerPosition == 0){
      startMarkerPositionText = "0"
    }else{
      startMarkerPositionText = this.startMarkerPosition;
    }
    let endMarkerPositionText = "";
    if (this.endMarkerPosition == 0){
      endMarkerPositionText = "0"
    }else{
      endMarkerPositionText = this.endMarkerPosition;
    }
       
    if (this.propertiesDisplay) {
      this.propertiesDisplay.innerHTML = `
        Project Name: ${this.projectName || ""} <br>
        Project URL: ${this.projectUrl || ""} <br>
        Beat Track URL: ${this.beatTrackUrl || ""} <br>
        BPM: ${this.playParameterValues[0].currentValue || ""} <br>
        Start Marker: ${startMarkerPositionText || ""} <br>
        End Marker: ${endMarkerPositionText || ""} <br>
        Current Cell: ${this.currentCell || ""} <br>
        Lead In MS: ${this.beatTrackParameterValues[0].currentValue || ""} <br>
        Lead In Bars: ${this.beatTrackParameterValues[1].currentValue || ""} <br>
        Play Rate: ${this.beatTrackParameterValues[2].currentValue || ""} <br>
        
       
      
        Mode: ${modeText || ""}
      `;
    } else {
      console.error("Properties display element is not available for update.");
    }
  }

  // Getters and setters for properties
  get projectName() {
    return this._projectName;
  }

  set projectName(value) {
    this._projectName = value;
    this.updatePropertiesDisplay();
  }

  get projectUrl() {
    return this._projectUrl;
  }

  set projectUrl(value) {
    this._projectUrl = value;
    this.updatePropertiesDisplay();
  }

  get beatTrackUrl() {
    return this._beatTrackUrl;
  }

  set beatTrackUrl(value) {
    this._beatTrackUrl = value;
    const beatTrackNameDisplay = this.app.getModule("beatTrack").beatTrackNameDisplay;
    console.log("beatTrackNameDisplay: " + beatTrackNameDisplay);
    if (beatTrackNameDisplay){
       beatTrackNameDisplay.textContent = value;
    }
    const waveFormViewModule = this.app.getModule("waveFormView");
    if (waveFormViewModule){
      waveFormViewModule.updateWaveForm(value);
      this.updatePropertiesDisplay();
    }
  }

  get BPM() {
    return this._BPM;
  }

  set BPM(value) {
    this._BPM = value;
    const waveFormViewModule = this.app.getModule("waveFormView");
    if (waveFormViewModule) {
      waveFormViewModule.updateMarkers(this.startMarkerPosition, this.endMarkerPosition, this._BPM, this.beatTrackLeadInBars);
    }
    this.updatePropertiesDisplay();
  }

  set startMarkerPosition(index) {
        // Update start marker position
        this._startMarkerPosition = index;

        // Ensure the end marker is at least equal to the start marker
        if (this._endMarkerPosition < this._startMarkerPosition) {
            this._endMarkerPosition = this._startMarkerPosition;
            this.app.getModule("gridView").updateMarker("end", this._endMarkerPosition, this._startMarkerPosition, this._endMarkerPosition);
        }

        // Call the GridView update for start marker
        this.app.getModule("gridView").updateMarker("start", this._startMarkerPosition, this._startMarkerPosition, this._endMarkerPosition);
        this.app.getModule("waveFormView").updateMarkers(this._startMarkerPosition, this._endMarkerPosition, this._BPM, this._beatTrackLeadInBars);


        // Update properties display
        this.updatePropertiesDisplay();
    }

    set endMarkerPosition(index) {
        // Update end marker position
        this._endMarkerPosition = index;

        // Ensure the start marker is not beyond the end marker
        if (this._startMarkerPosition > this._endMarkerPosition) {
            this._startMarkerPosition = this._endMarkerPosition;
            this.app.getModule("gridView").updateMarker("start", this._startMarkerPosition, this._startMarkerPosition, this._endMarkerPosition);
        }

        // Call the GridView update for end marker
        this.app.getModule("gridView").updateMarker("end", this._endMarkerPosition, this._startMarkerPosition, this._endMarkerPosition);
        this.app.getModule("waveFormView").updateMarkers(this._startMarkerPosition, this._endMarkerPosition, this._BPM, this._beatTrackLeadInBars);
        // Update properties display
        this.updatePropertiesDisplay();
    }

    get startMarkerPosition() {
        return this._startMarkerPosition;
    }

    get endMarkerPosition() {
        return this._endMarkerPosition;
    }
  
  get currentCell() {
    return this._currentCell;
  }

  set currentCell(index) {
    this._currentCell = index;
    this.app.getModule("gridView").makeCellCurrent(index);
    this.updatePropertiesDisplay();
}

  get mode() {
    return this._mode;
  }

  set mode(value) {
    this._mode = value;
    const modeModule = this.app.getModule("modeSelector");
    modeModule.toggleLights(value);
    console.log("set mode to " + value);
    this.updatePropertiesDisplay();
  }
}