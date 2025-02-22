class Cell {
    constructor(app, gridContainer, cellEditorContainer, index) {
        this.app = app;
        this.gridContainer = gridContainer;
        this.cellEditorContainer = cellEditorContainer;
        this.pm = null;
        
      //properties to save to project  
        this.index = index;
        this._syllable = "";
        this._syllableOverride = false;
        this._timeOffset = 0;
        this._voiceRate = 3;
        this._emphasize = false;
      //  
        this._isCurrentCell = false;
        this._isPlayable = false;
        this._isCandidate = false;
        this._stepPlaying = false;
        this._mode = MODE_WRITE;
        
        this.ce_syllableOverrideSwitch = this.cellEditorContainer.querySelector("#syllable-override-switch");
        this.ce_timeOffsetDisplay = this.cellEditorContainer.querySelector("#time-offset-display");
        this.ce_voiceRateDisplay = this.cellEditorContainer.querySelector("#voice-rate-display");
        this.ce_emphasizeSwitch = this.cellEditorContainer.querySelector("#emphasize-switch");
        
        
        this.gridCell = this.createDOMElement();
        gridContainer.appendChild(this.gridCell);
    }

  createDOMElement() {
    const el = document.createElement("div");
    el.classList.add("grid-cell");
    el.dataset.index = this.index;
      el.contentEditable = true;
    return el;
  }
    
    get isPlayable(){
        return this._isPlayable;
    }
    
    set isPlayable(value){
        this._isPlayable = value;
        if (value == true){
            this.gridCell.classList.add("is-playable");
        } else {
            this.gridCell.classList.remove("is-playable");
        }
    }
    
    get isCurrentCell(){
        return this._isCurrentCell;
    }
    
    set isCurrentCell(value){
        this._isCurrentCell = value;
        this.ce_timeOffsetDisplay.textContent = this._timeOffset;
    }
    
    get isCandidate() {
        return this._isCandidate;
    }

    set isCandidate(value) {
        this._isCandidate = value;
        if (value == true) {
            this.gridCell.classList.add("is-candidate");
        } else {
            this.gridCell.classList.remove("is-candidate");
        }
    }

    get syllable() {
        return this._syllable;
    }

    set syllable(value) {
        console.log("syllable setter setting to" + value);
        this._syllable = value;
        this.gridCell.textContent = value;
    }

    get stepPlaying() {
        return this._stepPlaying;
    }

    set stepPlaying(value) {
        this._stepPlaying = value;

        if (value == true) {
            this.gridCell.classList.add("step-playing");
        } else {
        this.gridCell.classList.remove("step-playing");
        }
    }
    
    get mode(){
        return this._mode;
    }
   
    set mode(value){
        this._mode = value;
        if (value == MODE_WRITE){
            this.gridCell.classList.remove("mode-arrange");
            this.gridCell.classList.add("mode-write");
            this.gridCell.contentEditable = true;
        }else if (value == MODE_ARRANGE){
            this.gridCell.classList.remove("mode-write");
            this.gridCell.classList.add("mode-arrange");
            this.gridCell.contentEditable = false;
        }
    }
    /**
     * Serialize the Cell's state into a JSON-compatible object.
     * @returns {Object} Serialized state of the Cell.
     */
   get timeOffset() {
       return this._timeOffset;
   }
    
    set timeOffset(value){
        this._timeOffset = value;
        this.ce_timeOffsetDisplay.textContent = value;
    }
  updateFromData(data) {
    // Update all properties atomically
      this.syllable = data.syllable || "";
      this._syllableOverride = data.syllableOverride || false;
      this._timeOffset = data.timeOffset || 0;
      this._voiceRate = data.voiceRate || 3;
      this._emphasize = data.emphasisze || false;
        
    // Direct DOM manipulation stays within class
    this.gridCell.textContent = this.syllable;
  }
    
    destroy() {
        this.gridCell.remove();
  }
    
    toJSON() {
        return {
            index: this.index,
            syllable: this._syllable,
            syllableOverride: this._syllableOverride,
            timeOffset: this._timeOffset,
            voiceRate: this._voiceRate,
            emphasize: this._emphasize
        };
    }

    /**
     * Recreate a Cell instance from a serialized object.
     * @param {Object} data Serialized state of a Cell.
     * @returns {Cell} Restored Cell instance.
     */
}

class StartMarker{
    constructor(startMarkerContainer, index) {
        this.startMarkerCell = null;
        this.startMarkerContainer = startMarkerContainer;
        this.index = index;
        
        this.setupDOM();
        
    }
    
    setupDOM(){
        this.startMarkerCell = document.createElement("div");
        this.startMarkerCell.classList.add("start-marker")
        this.startMarkerContainer.appendChild(this.startMarkerCell);
    }
    
}

class EndMarker {
    constructor(endMarkerContainer, index) {
        this.endMarkerCell = null;
        this.endMarkerContainer = endMarkerContainer;
        this.index = index;
        
        this.setupDOM();
        
    }
    
    setupDOM(){
        this.endMarkerCell = document.createElement("div");
        this.endMarkerCell.classList.add("end-marker")
        this.endMarkerContainer.appendChild(this.endMarkerCell);
        
    }
    
    
}
