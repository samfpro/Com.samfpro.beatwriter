class Project {
  constructor(projectUrl = "") {
    this.projectUrl = projectUrl;
    this.beatTrackUrl = null;
    this.BPM = null;
    this.cells = [];
    this.beatTrackLeadInBars = null;
    this.beatTrackLeadInMS = null;
    this.ttsVoice = null;
    this.ttsRate = null;
    this.startMarkerPosition = null;
    this.endMarkerPosition = null;
    this.mode = null;
    this.currentCell = null;
    this.mixer = {
      channel1: { muteState: null, sliderValue: null },
      channel2: { muteState: null, sliderValue: null },
      channel3: { muteState: null, sliderValue: null },
      channel4: { muteState: null, sliderValue: null },
    };
  }

  // Method to compile the project into a serialized JSON object
  compileProject(beatTrack, gridView, mixer, mode, playParams, projMgr) {
    console.log("Starting project compilation...");

    // Update project properties
    this.projectUrl = projMgr.projectUrl;
    this.beatTrackUrl = beatTrack.beatTrackUrl;
    this.BPM = playParams.BPM;
    this.beatTrackLeadInBars = beatTrack.beatTrackLeadInBars;
    this.beatTrackLeadInMS = beatTrack.beatTrackLeadInMS;
    this.ttsVoice = playParams.ttsVoice;
    this.ttsRate = playParams.ttsRate;
    this.startMarkerPosition = gridView.startMarkerPosition;
    this.endMarkerPosition = gridView.endMarkerPosition;
    this.mode = mode.mode;
    this.currentCell = gridView.currentCell;

    // Serialize grid cells
    this.cells = gridView.cells.map((cell) => cell.toJSON());
    console.log("Grid cells serialized. Total cells: " + this.cells.length);

    // Update mixer properties
    mixer.channels.forEach((channel, index) => {
      this.mixer[`channel${index + 1}`].muteState = channel.muteState;
      this.mixer[`channel${index + 1}`].sliderValue = channel.slider.value;
      console.log(`Mixer channel ${index + 1}: muteState=${channel.muteState}, sliderValue=${channel.sliderValue}`);
    });

    const serializedProject = JSON.stringify(this, Project.getCircularReplacer());
    console.log("Project successfully compiled. Serialized JSON length: " + serializedProject.length);

    return serializedProject;
  }

  // Method to load the project from a serialized JSON object
  loadFromSerializedProject(serializedProject, beatTrack, gridView, mixer, mode, playParams, projMgr) {
    const data = JSON.parse(serializedProject);

    // Update project properties
    projMgr.projectUrl = data.projectUrl;
    beatTrack.beatTrackUrl = data.beatTrackUrl;
    playParams.BPM = data.BPM;
    beatTrack.beatTrackLeadInBars = data.beatTrackLeadInBars;
    beatTrack.beatTrackLeadInMS = data.beatTrackLeadInMS;
    playParams.ttsVoice = data.ttsVoice;
    playParams.ttsRate = data.ttsRate;
    gridView.startMarkerPosition = data.startMarkerPosition;
    gridView.endMarkerPosition = data.endMarkerPosition;
    mode.mode = data.mode;
    playParams.currentCell = data.currentCell;

    // Load grid cells
    gridView.cells = data.cells.map((cellData) => gridView.createCellFromData(cellData));

    // Load mixer data
    mixer.channels.forEach((channel, index) => {
      channel.muteState = data.mixer[`channel${index + 1}`].muteState;
      channel.sliderValue = data.mixer[`channel${index + 1}`].slider.value;
    });
  }

  static getCircularReplacer() {
    const seen = new WeakSet();
    return (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return "[Circular]";
        }
        seen.add(value);
      }
      return value;
    };
  }
}