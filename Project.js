class Project {
  constructor(app) {
    this.app = app; // Store reference to the app instance
    this.projectName = "untitled";
    this.projectUrl = "";
    this.BPM = 83;
    this.beatTrackUrl = "beatTrack/Turtletuck_83BPM";
    this.cells = [];
    this.offsetBars = 0;
    this.offsetMS = 0;
    this.ttsVoice = 4;
    this.ttsRate = 3;
    this.startMarkerPosition = 0;
    this.endMarkerPosition = 4;
    this.currentCell = 0;
    this.mixerSettings = null;
  }

  _initializeMixer() {
    let mixerSettings = {};
    for (let i = 1; i <= 4; i++) {
      mixerSettings[`channel${i}`] = {
        muteState: (this.mixer && this.mixer.channels && this.mixer.channels[i - 1] && this.mixer.channels[i - 1].muteState) || false,
        sliderValue: (this.mixer && this.mixer.channels && this.mixer.channels[i - 1] && this.mixer.channels[i - 1].slider && this.mixer.channels[i - 1].slider.value) || 0,
      };
    }
    return mixerSettings;
  }

  compileProject() {
    console.log("Starting project compilation...");
    this.projMgr = this.app.getModule("projectManager");
    this.beatTrack = this.app.getModule("beatTrack");

    const proj = JSON.stringify({
        projectName: this.projectName,
        projectUrl: this.projectUrl,
        beatTrackUrl: this.beatTrack.beatTrackUrl,
        BPM: this.BPM,
        offsetBars: this.beatTrack.offsetBars,
        offsetMS: this.beatTrack.offsetMS,
        ttsVoice: this.ttsVoice,
        ttsRate: this.ttsRate,
        startMarkerPosition: this.startMarkerPosition,
        endMarkerPosition: this.endMarkerPosition,
        mode: this.mode ? this.mode.mode : MODE_WRITE,
        currentCell: this.currentCell,
        cells: this.app.getModule("gridView").cells.map(cell => cell.toJSON()), // Ensure cells are properly serialized
        mixer: this.mixerSettings || this._initializeMixer()
    }, null, 2); // Pretty-print JSON

    this.projMgr.updatePropertiesDisplay(proj);
    console.log("Project compiled successfully.");
    return proj;
}

  loadFromSerializedProject(serializedProject) {
    console.log("Loading project from JSON...");
    const data = JSON.parse(serializedProject);

    // Assign values back to modules
    if (this.projMgr) this.projMgr.projectName = data.projectName;
    if (this.projMgr) this.projMgr.projectUrl = data.projectUrl;
    if (this.beatTrack) {
      this.beatTrack.beatTrackUrl = data.beatTrackUrl;
      this.beatTrack.offsetBars = data.offsetBars;
      this.beatTrack.offsetMS = data.offsetMS;
    }
    if (this.playParams) {
      this.playParams.BPM = data.BPM;
      this.playParams.ttsVoice = data.ttsVoice;
      this.playParams.ttsRate = data.ttsRate;
    }
    if (this.gridView) {
      this.gridView.startMarkerPosition = data.startMarkerPosition;
      this.gridView.endMarkerPosition = data.endMarkerPosition;
      this.gridView.currentCell = data.currentCell;
      this.gridView.cells = (data.cells && data.cells.map((cellData) => this.gridView.createCellFromData(cellData))) || [];
    }
    if (this.mode) this.mode.mode = data.mode;

    // Load mixer settings
    if (this.mixer) {
      if (this.mixer.channels) {
        this.mixer.channels.forEach((channel, index) => {
          channel.muteState = (data.mixer && data.mixer[`channel${index + 1}`] && data.mixer[`channel${index + 1}`].muteState) || false;
          channel.slider.value = (data.mixer && data.mixer[`channel${index + 1}`] && data.mixer[`channel${index + 1}`].sliderValue) || 0;
        });
      }
    }

    console.log("Project successfully loaded.");
  }
}