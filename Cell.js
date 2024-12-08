class Cell{
    constructor(gridView, index){
        this.gridCell = null;
        this.gridView = gridView;
        this.gridContainer = null;
        this.index = index;
        this.syllable = "";
        this.isCurrentCell = false;
        this._isPlayable = false;
        this.isEditable = false;
        this.isCandidate = false;
        this.stepPlaying = false;
        
        this.setupDOM();
         
    }
    
    setupDOM(){
        this.gridCell = document.createElement("div");
        this.gridCell.classList.add("grid-cell");
        this.gridCell.dataset.index = this.index;
        this.gridContainer = this.gridView.gridContainer;
        this.gridContainer.appendChild(this.gridCell);
        
    }
    get isPlayable(){
     return this._isPlayable;
    }
    
    set isPlayable(value){
        this._isPlayable = value;
        if (value == true){
            this.gridCell.classList.add("is-playable");
        }else{
            this.gridCell.classList.remove("is-playable");
        }
    }
}


class StartMarker{
    constructor(gridView, index) {
        this.startMarkerCell = null;
        this.startMarkerContainer = null;
        this.gridView = gridView;
        this.index = index;
        
        this.setupDOM();
        
    }
    
    setupDOM(){
        this.startMarkerCell = document.createElement("div");
        this.startMarkerCell.classList.add("start-marker")
        this.startMarkerContainer = this.gridView.startMarkerContainer;
        this.startMarkerContainer.appendChild(this.startMarkerCell);
    }
    
}

class EndMarker {
    constructor(gridView, index) {
        this.endMarkerCell = null;
        this.endMarkerContainer = null;
        this.gridView = gridView;
        this.index = index;
        
        this.setupDOM();
        
    }
    
    setupDOM(){
        this.endMarkerCell = document.createElement("div");
        this.endMarkerCell.classList.add("end-marker")
        this.endMarkerContainer = this.gridView.endMarkerContainer;
        this.endMarkerContainer.appendChild(this.endMarkerCell);
        
    }
    
    
}