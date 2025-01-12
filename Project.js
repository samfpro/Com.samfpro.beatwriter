class Project{
    constructor(projectUrl){
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
    
    compileProject(disk, gridView, mixer){
        this.disk = disk;
        this.gridView  = gridView;
        this.mixer = mixer;
        
        this.beatTrackUrl = this.disk.beatTrackUrl;
        this.BPM = this.disk.BPM;
        this.cells = this.gridView.cells;
        this.beatTrackLeadInBars = this.disk.beatTrackLeadInBars;
        this.beatTrackLeadInMS = this.disk.beatTrackLeadInMS;
        this.ttsVoice = this.disk.ttsVoice;
        this.ttsRate = this.disk.ttsRate;
        this.startMarkerPosition = this.disk.startMarkerPosition;
        this.endMarkerPosition = this.disk.endMarkerPosition;
        this.mode = this.disk.mode;
        this.currentCell = this.disk.curentCell;
        this.mixerChannel1MuteState = null;
        this.mixerChannel1SliderValue = null;
        this.mixerChannel2MuteState = null;
        this.mixerChannel2SliderValue = null;
        this.mixerChannel3MuteState = null;
        this.mixerChannel3SliderValue = null;
        this.mixerChannel4MuteState = null;
        this.mixerChannel4SliderValue = null;

        
        
        
    }
}

