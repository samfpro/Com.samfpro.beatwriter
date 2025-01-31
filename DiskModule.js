class DiskModule extends Module {
  constructor(app, titleText, styleName, htmlFile, parentElement) {
    // Call the parent class constructor
    super(app, titleText, styleName, htmlFile, parentElement);
    window.diskModule = this;
    // Initialize default values for properties
    this._projectName = "";
    this._projectUrl = "";
    this._beatTrackUrl = "";
    this._startMarkerPosition = 1;
    this._endMarkerPosition = 4;
    this._currentCell = null;
    this._mode = MODE_WRITE;
    console.log("MODE_WRITE: " + MODE_WRITE);   // Default mode, can be updated later
    this.propertiesDisplay= null;
    this.ac = app.ac;
    this.updateWaveFormMarkers = this.updateWaveFormMarkers.bind(this);
    this.fm = this.app.getModule("fileManager");
        // Initialize the beatTrackParameterValues array
    this.beatTrackParameterValues = [
      new ParameterValue("LeadInMS", "OFSTMS", 0, 10000, 0, "number", this.updateWaveFormMarkers),
      new ParameterValue("LeadInBars", "OFSTBR", 0, 64, 0, "number", this.updateWaveFormMarkers),
      new ParameterValue("PlayRate", "PLAYRT", 0, 300, 100, "number", this.updateWaveFormMarkers),
    ];
    
    // Initialize the playParameterValues array
      this.playParameterValues = [
      new ParameterValue("BPM", "MBPM", 0, 240, 83, "number", this.updateWaveFormMarkers),
      new ParameterValue("TtsVoice", "TTSV", 1, 27, 3, "number", this.updateWaveFormMarkers),
      new ParameterValue("TtsRate", "TTSR", 1, 4, 4, "number", this.updateWavwFormMarkers),
    ];
    
       }
  

  setupDOM() {
    // Call the parent setupDOM
    super.setupDOM();

    // Move the module container in the DOM hierarchy
    const fileManagerContainer = this.app.getModule("fileManager").moduleContainer;

    // Attempt to find the properties display element
    this.propertiesDisplay = this.moduleContent.querySelector("#properties-display");
    if (this.propertiesDisplay) {
      console.log("propertiesDisplay successfully initialized.");
      this._beatTrackUrl = ;
      console.log("setting mode");
      this.mode = MODE_WRITE;
      this.propertiesDisplay.addEventListener("touchmove", (event) => {
        event.stopPropagation();
      });
      
    } else {
      console.error("propertiesDisplay element is not available.");
    }
    this.app.getModule("gridView").generateGrid();
    this.app.getModule("beatTrack").loadValueSelector();
    this.app.getModule("playParameters").loadValueSelector();
 
    this.projectName = "<untitled>";
    this.startMarkerPosition = 1;
    this.endMarkerPosition = 4;
    this.currentCell = 16;
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
    const autoSyl = this.app.getModule("gridView").autoSyllables;
    let autoSylText = null;
    if(autoSyl == true){
      autoSylText = "true";
    }else{
      autoSylText = "false";
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
        Auto Syllables: ${autoSylText || ""}<br>
        Mode: ${modeText || ""}
      `;
      this.fm.autosaveProject();
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
  const fileManagerModule = this.app.getModule("fileManager");
  fileManagerModule.projectNameInput.textContent = value;
  this.updatePropertiesDisplay();
}

get projectUrl() {
  return this._projectUrl;
}

set projectUrl(value) {
  this._projectUrl = value;

  // Extract the project name from the URL
  const projectName = this.extractProjectNameFromUrl(value);

  // Set the extracted project name
  if (projectName) {
    this.projectName = projectName; // This will trigger the projectName setter
  }

  this.updatePropertiesDisplay();
}

// Helper method to extract the project name from a URL
extractProjectNameFromUrl(url) {
  try {
    // Decode the URL
    const decodedUrl = decodeURIComponent(url);

    // Extract the file path after "document/"
    const match = decodedUrl.match(/document\/[^%]*%3A([^/]+)\/([^/]+)\.json/);

    if (match && match[2]) {
      return match[2]; // Return the extracted project name (e.g., "Muuscin")
    }
  } catch (error) {
    console.error("Error extracting project name from URL:", error);
  }

  return null; // Return null if extraction fails
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
    this.drawWave(value);
    this.updatePropertiesDisplay();
    
  }
  
  async drawWave(value) {
  const waveFormViewModule = this.app.getModule("waveFormView");
  if (waveFormViewModule) {
    // Pass a callback to hideWhenReady that calls updateWaveForm and waits for animation frame
      waveFormViewModule.updateWaveForm(
        value,
        this.startMarkerPosition,
        this.endMarkerPosition,
        this.BPM,
        this.beatTrackParameterValues[1].currentValue
      );
      console.log("waveViewMarkersParameters: " + this.startMarkerPosition + this.endMarkerPosition + this.BPM + this.beatTrackParameterValues[1].currentValue);
    }
  }
  
  get BPM() {
    return this.playParameterValues[0].currentValue;
  }

  set BPM(value) {
    console.log("setting bpm to " + value);
    this.playParameterValues[0].currentValue = value;
    this.updateWaveFormMarkers();
    this.updatePropertiesDisplay();
  }
  
  updateWaveFormMarkers(){
    const wfv = this.app.getModule("waveFormView");
    wfv.updateMarkers(this.startMarkerPosition, this.endMarkerPosition, this.BPM, this.beatTrackLeadInBars);
  }
  
  get beatTrackLeadInMS(){
    return this.beatTrackParameterValues[0].currentValue;
  }
  
  set beatTrackLeadInMS(value){
    this.beatTrackParameterValues[0].currentValue = value;
    const waveFormViewModule = this.app.getModule("waveFormView");
    if (waveFormViewModule) {
      waveFormViewModule.updateMarkers(this.startMarkerPosition, this.endMarkerPosition, this.BPM, this.beatTrackParameterValues[1].currentValue);
    }
    this.updatePropertiesDisplay();
  }
  get beatTrackLeadInBars(){
    return this.beatTrackParameterValues[1].currentValue;
  }
  
  set beatTrackLeadInBars(value){
    this.beatTrackParameterValues[1].currentValue = value;
    const waveFormViewModule = this.app.getModule("waveFormView");
    if (waveFormViewModule) {
      waveFormViewModule.updateMarkers(this.startMarkerPosition, this.endMarkerPosition, this.BPM, this.beatTrackParameterValues[1].currentValue);
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
        this.app.getModule("waveFormView").updateMarkers(this._startMarkerPosition, this._endMarkerPosition, this.BPM, this.beatTrackParameterValues[1].currentValue);


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
        this.app.getModule("waveFormView").updateMarkers(this._startMarkerPosition, this._endMarkerPosition, this.BPM, this.beatTrackParameterValues[1].currentValue);
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

  // Get mode module and ensure it's valid
  const modeModule = this.app.getModule("mode");
  if (modeModule && typeof modeModule.toggleLights === "function") {
    modeModule.toggleLights(value);
  } else {
    console.error("Mode module or toggleLights function not found.");
  }

  // Get grid module and update cell modes
  const grid = this.app.getModule("gridView");
  if (grid && Array.isArray(grid.cells)) {
    grid.cells.forEach((cell) => {
      if (cell) {
        cell.mode = value;
      }
    });
  } else {
    console.error("Grid module or cells array not found.");
  }

  console.log("Set mode to " + value);
  this.updatePropertiesDisplay();
}
}
