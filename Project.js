class Project {
    constructor(projectUrl) {
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
        this.mixerChannel1MuteState = null;
        this.mixerChannel1SliderValue = null;
        this.mixerChannel2MuteState = null;
        this.mixerChannel2SliderValue = null;
        this.mixerChannel3MuteState = null;
        this.mixerChannel3SliderValue = null;
        this.mixerChannel4MuteState = null;
        this.mixerChannel4SliderValue = null;
    }

    // Helper function to handle circular references
    static getCircularReplacer() {
        const seenObjects = new WeakSet();
        return (key, value) => {
            if (typeof value === "object" && value !== null) {
                if (seenObjects.has(value)) {
                    return "[Circular]"; // Replace circular reference with a placeholder
                }
                seenObjects.add(value);
            }
            return value;
        };
    }

    // Method to compile the project and return a serialized JSON object
    compileProject(disk, gridView, mixer) {
    console.log("Starting project compilation...");
    
    // Update properties from disk
    this.beatTrackUrl = disk.beatTrackUrl;
    console.log("beatTrackUrl set to: " + this.beatTrackUrl);
    
    this.BPM = disk.BPM;
    console.log("BPM set to: " + this.BPM);
    
    this.beatTrackLeadInBars = disk.beatTrackLeadInBars;
    console.log("beatTrackLeadInBars set to: " + this.beatTrackLeadInBars);
    
    this.beatTrackLeadInMS = disk.beatTrackLeadInMS;
    console.log("beatTrackLeadInMS set to: " + this.beatTrackLeadInMS);
    
    this.ttsVoice = disk.ttsVoice;
    console.log("ttsVoice set to: " + this.ttsVoice);
    
    this.ttsRate = disk.ttsRate;
    console.log("ttsRate set to: " + this.ttsRate);
    
    this.startMarkerPosition = disk.startMarkerPosition;
    console.log("startMarkerPosition set to: " + this.startMarkerPosition);
    
    this.endMarkerPosition = disk.endMarkerPosition;
    console.log("endMarkerPosition set to: " + this.endMarkerPosition);
    
    this.mode = disk.mode;
    console.log("Mode set to: " + this.mode);
    
    this.currentCell = disk.currentCell;
    console.log("Current cell set to: " + this.currentCell);

    // Serialize grid cells
    this.cells = gridView.cells.map(cell => cell.toJSON());
    console.log("Grid cells serialized. Total cells: " + this.cells.length);

    // Update mixer properties
    this.mixerChannel1MuteState = mixer.channels[0].muteState;
    this.mixerChannel1SliderValue = mixer.channels[0].sliderValue;
    console.log("Mixer channel 1: muteState=" + this.mixerChannel1MuteState + ", sliderValue=" + this.mixerChannel1SliderValue);

    this.mixerChannel2MuteState = mixer.channels[1].muteState;
    this.mixerChannel2SliderValue = mixer.channels[1].sliderValue;
    console.log("Mixer channel 2: muteState=" + this.mixerChannel2MuteState + ", sliderValue=" + this.mixerChannel2SliderValue);

    this.mixerChannel3MuteState = mixer.channels[2].muteState;
    this.mixerChannel3SliderValue = mixer.channels[2].sliderValue;
    console.log("Mixer channel 3: muteState=" + this.mixerChannel3MuteState + ", sliderValue=" + this.mixerChannel3SliderValue);

    this.mixerChannel4MuteState = mixer.channels[3].muteState;
    this.mixerChannel4SliderValue = mixer.channels[3].sliderValue;
    console.log("Mixer channel 4: muteState=" + this.mixerChannel4MuteState + ", sliderValue=" + this.mixerChannel4SliderValue);

    // Serialize the project to JSON
    const serializedProject = JSON.stringify(this, Project.getCircularReplacer());
    console.log("Project successfully compiled. Serialized JSON length: " + serializedProject.length);

    return serializedProject;
}

    // Method to load the project from a serialized JSON object
    loadFromSerializedProject(serializedProject, disk, gridView, mixer) {
        const data = JSON.parse(serializedProject);

        disk.beatTrackUrl = data.beatTrackUrl;
        disk.BPM = data.BPM;
        disk.beatTrackLeadInBars = data.beatTrackLeadInBars;
        disk.beatTrackLeadInMS = data.beatTrackLeadInMS;
        disk.ttsVoice = data.ttsVoice;
        disk.ttsRate = data.ttsRate;
        disk.startMarkerPosition = data.startMarkerPosition;
        disk.endMarkerPosition = data.endMarkerPosition;
        disk.mode = data.mode;
        disk.currentCell = data.currentCell;

        // Load grid cells
        gridView.cells = data.cells.map(cellData => gridView.createCellFromData(cellData));

        // Load mixer data
        mixer.channels[0].muteState = data.mixerChannel1MuteState;
        mixer.channels[0].sliderValue = data.mixerChannel1SliderValue;
        mixer.channels[1].muteState = data.mixerChannel2MuteState;
        mixer.channels[1].sliderValue = data.mixerChannel2SliderValue;
        mixer.channels[2].muteState = data.mixerChannel3MuteState;
        mixer.channels[2].sliderValue = data.mixerChannel3SliderValue;
        mixer.channels[3].muteState = data.mixerChannel4MuteState;
        mixer.channels[3].sliderValue = data.mixerChannel4SliderValue;
    }
}
