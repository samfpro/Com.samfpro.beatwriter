class Cell {
    constructor(gridContainer, index) {
        this.gridCell = null;
        this.gridContainer = gridContainer;
        this.index = index;
        this._syllable = "";
        this.isCurrentCell = false;
        this._isPlayable = false;
        this._isCandidate = false;
        this._stepPlaying = false;
        this._mode = null;
        

        this.setupDOM();
    }

    setupDOM() {
        this.gridCell = document.createElement("div");
        this.gridCell.classList.add("grid-cell");
        this.gridCell.dataset.index = this.index;
        this.gridCell.setAttribute("autocapitalize", "none");
        this.gridCell.setAttribute("autocorrect", "off");
        this.gridCell.setAttribute("spellcheck", "false");
        this.gridCell.setAttribute("autocomplete", "off");
        this.gridContainer.appendChild(this.gridCell);
        this.mode = MODE_WRITE;
    }

    get isPlayable() {
        return this._isPlayable;
    }

    set isPlayable(value) {
        this._isPlayable = value;
        if (value == true) {
            this.gridCell.classList.add("is-playable");
        } else {
            this.gridCell.classList.remove("is-playable");
        }
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
    toJSON() {
        return {
            index: this.index,
            syllable: this._syllable,
            isPlayable: this._isPlayable,
            isCandidate: this._isCandidate,
            stepPlaying: this._stepPlaying,
            mode: this._mode
        };
    }

    /**
     * Recreate a Cell instance from a serialized object.
     * @param {Object} data Serialized state of a Cell.
     * @returns {Cell} Restored Cell instance.
     */
    static fromJSON(data, gridContainer) {
        const cell = new Cell(gridContainer, data.index);
        cell.syllable = data.syllable || "";
        cell.isPlayable = data.isPlayable || false;
        cell.isCandidate = data.isCandidate || false;
        cell.isEditable = data.isEditable || false;
        cell.stepPlaying = data.stepPlaying || false;
        return cell;
    }
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
        this.endMarkerContainer = this.endMarkerContainer;
        this.endMarkerContainer.appendChild(this.endMarkerCell);
        
    }
    
    
}
