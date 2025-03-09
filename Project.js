class Project {
  constructor(app) {
    this.app = app; // Store reference to the app instance
  }

  createNewProject() {
  console.log("Creating a new blank project...");

  const newProjectJson = JSON.stringify({
    projectName: "untitled",
    projectUri: "",
    beatTrackUrl: "beatTrack/Turtletuck_83BPM.mp3",
    BPM: 83,
    mode: MODE_WRITE,
    offsetBars: 0,
    offsetMS: 0,
    ttsVoice: 4,
    ttsRate: 3,
    startMarkerPosition: 0,
    endMarkerPosition: 4,
    currentCell: 0,
    cells: this._getClearedCells(),  // Keep cell structure instead of creating an empty array
    mixer: this._initializeMixer()
  });

  this.loadFromSerializedProject(newProjectJson);
}

  _initializeMixer() {
    let mixerSettings = {};
    for (let i = 1; i <= 4; i++) {
      mixerSettings[`channel${i}`] = {
        muteState: MUTE_STATE_OFF,
        sliderValue: 0.8,
      };
    }
    return mixerSettings;
  }
  _getClearedCells() {
  const gridView = this.app.getModule("gridView");
  return gridView.cells.map(cell => ({
    index: cell.index,
    syllable: "",
    syllableOverride: false,
    timeOffset: 0,
    voiceRate: 3,
    emphasize: false,
    isPlayable: false,
    isCandidate: false,
    stepPlaying: false,
    mode: MODE_WRITE
  }));
}
  
  getMixerSettings() {
    const mixer = this.app.getModule("mixer");
    let mixerSettings = {};
    for (let i = 1; i <= 4; i++) {
      mixerSettings[`channel${i}`] = {
        muteState: mixer.channels[i-1].muteState,
        sliderValue: mixer.channels[i-1].slider.value,
      };
    }
    return mixerSettings;
  }

  compileProject() {
    console.log("Starting project compilation...");

    const projMgr = this.app.getModule("projectManager");
    const beatTrack = this.app.getModule("beatTrack");
    const playParams = this.app.getModule("playParameters");
    const gridView = this.app.getModule("gridView");
    const mode = this.app.getModule("mode");
    const filteredCells = gridView.cells
      .filter(cell => cell.syllable && cell.syllable.trim() !== "")
      .map(cell => cell.toJSON());

    return JSON.stringify({
      projectName: projMgr.projectName,
      projectUri: projMgr.projectUri,
      beatTrackUrl: beatTrack.beatTrackUrl,
      BPM: playParams.BPM,
      offsetBars: beatTrack.offsetBars,
      offsetMS: beatTrack.offsetMS,
      ttsVoice: playParams.ttsVoice,
      ttsRate: playParams.ttsRate,
      startMarkerPosition: gridView.startMarkerPosition,
      endMarkerPosition: gridView.endMarkerPosition,
      mode: mode.mode,
      currentCell: gridView.currentCell,
      cells: filteredCells,
      mixer: this.getMixerSettings()
    }, null, 2);
  }

  loadFromSerializedProject(serializedProject) {
    console.log("Loading project from JSON...");
    const data = JSON.parse(serializedProject);

    const projMgr = this.app.getModule("projectManager");
    const beatTrack = this.app.getModule("beatTrack");
    const playParams = this.app.getModule("playParameters");
    const gridView = this.app.getModule("gridView");
    const mixer = this.app.getModule("mixer");
    const mode = this.app.getModule("mode");
    if (projMgr) {
        projMgr.projectName = data.projectName;
        projMgr.projectUri = data.projectUri;
    }
    if (beatTrack) {
        beatTrack.beatTrackUrl = data.beatTrackUrl;
        beatTrack.offsetBars = data.offsetBars;
        beatTrack.offsetMS = data.offsetMS;
    }
    if (playParams) {
        playParams.BPM = data.BPM;
        playParams.ttsVoice = data.ttsVoice;
        playParams.ttsRate = data.ttsRate;
    }
    if (gridView) {
        gridView.startMarkerPosition = data.startMarkerPosition;
        gridView.endMarkerPosition = data.endMarkerPosition;
        gridView.currentCell = data.currentCell;
        gridView.loadGridData(Array.isArray(data.cells) ? data.cells : []);
    }
    if (mixer && data.mixer) {
        mixer.loadMixerSettings(data.mixer);
    }
    if (mode) {
      mode.mode = data.mode;
    }

    console.log("Project successfully loaded.");
}
}