const GRID_CELL_COUNT = 288;
const MARKER_COUNT = 18;

class GridViewModule extends Module {
  constructor(app, titleText, styleName, htmlFile, parentElement) {
    super(app, titleText, styleName, htmlFile, parentElement);
    this.gridViewDisplay = null;
    this.gridContainer = null;
    this.cells = [];
    this.startMarkers = [];
    this.lastStartMarker = null;
    this.endMarkers = [];
    this.lastEndMarker = null; // Add a reference for the last active end marker
    this.startMarkerContainer = null;
    this.endMarkerContainer = null;
    this.rowLabelContainer = null;
    this.modeWrite = new ModeWrite(app);
    this.modeArrange = new ModeArrange(app);
    this.syllableSwitchContainer = null;
    this.syllableSwitch = null;
    this._autoSyllables = true;
    
    
  }
  

  setupDOM() {
    super.setupDOM();

    this.gridViewDisplay = this.moduleContent.querySelector("#grid-view-display");
    this.gridContainer = this.gridViewDisplay.querySelector("#grid-container");
    this.startMarkerContainer = this.gridViewDisplay.querySelector("#start-marker-container");
    this.endMarkerContainer = this.gridViewDisplay.querySelector("#end-marker-container");
    this.syllableSwitchContainer = this.moduleContent.querySelector("#syllable-switch-container");
    console.log("attempting to build syllable switch with container: " + this.syllableSwitchContainer);
    this.syllableSwitch = new BoolSwitch(
            this.syllableSwitchContainer,
            this.autoSyllables, // Initial state
            "Auto Syllables:  ",            // Label te
            (newState) => {              // Callback for state changes
                this.autoSyllables = newState;
                console.log(`autoSyllables is now: ${newState}`);
            }
        ); 
    // Add a click listener for the entire grid container
    this.gridContainer.addEventListener("click", (event) => {
      this.handleGridCellClick(event);
    });
    this.gridContainer.addEventListener("keyup", (event) => {
     this.handleGridKeyup(event);
    });
    // Event listeners for marker containers
    this.startMarkerContainer.addEventListener("click", (event) => {
      this.handleMarkerClick(event, "start");
    });
    this.endMarkerContainer.addEventListener("click", (event) => {
      this.handleMarkerClick(event, "end");
    });
  }
  
  get autoSyllables(){
    return this._autoSyllables;
  }
  
  set autoSyllables(value){
    this._autoSyllables = value;
    this.app.getModule("disk").updatePropertiesDisplay();
  }  
  
  makeCellCurrent(index) {
    const gridCell = this.cells[index].gridCell;
    gridCell.contentEditable = true;
    gridCell.focus();

    // Check if the cell is not blank
    if (gridCell.textContent.trim() !== "") {
        // Select all text in the grid cell
        const range = document.createRange();
        range.selectNodeContents(gridCell);

        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }
}
  
  
  generateGrid() {
    this.gridContainer.innerHTML = "";
    const rowLabelContainers = this.gridViewDisplay.querySelectorAll(".row-label-container");
    const columnLabelContainers = this.gridViewDisplay.querySelectorAll(".column-label-container");

    for (let i = 0; i < GRID_CELL_COUNT; i++) {
        const cell = new Cell(this, i);
        this.cells.push(cell);
    }

    for (let i = 0; i < MARKER_COUNT; i++) {
        // Add row labels
        ["row-label-container", "row-label-container"].forEach((container, idx) => {
            const rowLabel = document.createElement("div");
            rowLabel.textContent = i;
            rowLabel.classList.add("row-label");
            rowLabelContainers[idx].appendChild(rowLabel);
        });

        // Add column labels
        if (i < 16) {
            ["column-label-container", "column-label-container"].forEach((container, idx) => {
                const colLabel = document.createElement("div");
                colLabel.textContent = i + 1;
                colLabel.classList.add("column-label");
                columnLabelContainers[idx].appendChild(colLabel);
            });
        }

        // Create markers
        this.startMarkers.push(new StartMarker(this, i).startMarkerCell);
        this.endMarkers.push(new EndMarker(this, i).endMarkerCell);
    }
  }

  handleGridCellClick(event) {
    console.log("Detected click in grid");
    const cellElement = event.target.closest(".grid-cell");
    if (!cellElement) return; // Ignore clicks outside cells

    const cellIndex = cellElement.dataset.index;
    
    if (cellIndex) {
        console.log(`Grid cell ${cellIndex} clicked`);
        switch (this.app.getModule("disk").mode) {
            case MODE_WRITE:
                this.modeWrite.handleGridClick(cellIndex);
                break;
            case MODE_ARRANGE:
                this.modeArrange.handleGridCellClick(cellIndex);
                break;
            default:
                console.warn("Unhandled mode:", this.app.mode);
        }
    }
}
  
  handleGridKeyup(event) {
    console.log("Detected keyup in grid");
    const cellElement = event.target.closest(".grid-cell");
    if (!cellElement) return; // Ignore clicks outside cells

    const cellIndex = cellElement.dataset.index;
    
    if (cellIndex) {
        console.log(`Grid cell ${cellIndex} keyup`);
        switch (this.app.getModule("disk").mode) {
            case MODE_WRITE:
                this.modeWrite.handleGridKeyup(cellIndex);
                break;
            case MODE_ARRANGE:
                console.log("keyup ignored in mode arrange");
                break;
            default:
                console.warn("Unhandled mode:", this.app.mode);
        }
    }
}

  handleMarkerClick(event, markerType) {
    console.log("detected marker click");
    const markerClass = `${markerType}-marker`;
    const markerArray = markerType === "start" ? this.startMarkers : this.endMarkers;

    const markerElement = event.target.closest(`.${markerClass}`);
    if (markerElement) {
      const index = markerArray.indexOf(markerElement);
      if (index !== -1) {
        console.log(`${markerType} marker ${index} clicked`);
        if (markerType === "start") {
          this.app.getModule("disk").startMarkerPosition = index;
        } else {
          this.app.getModule("disk").endMarkerPosition = index;
        }
      } else {
        console.error(`Could not find index for the clicked ${markerType} marker.`);
      }
    } else {
      console.log(`No ${markerType} marker found for the clicked element.`);
    }
  }


  updateMarker(markerType, index, startMarkerPosition, endMarkerPosition) {
    const activeClass = `${markerType}-marker-active`;
    const markerArray = markerType === "start" ? this.startMarkers : this.endMarkers;
    let lastMarker = markerType === "start" ? this.lastStartMarker : this.lastEndMarker;

    if (index >= 0 && index < markerArray.length) {
      if (lastMarker) {
        lastMarker.classList.remove(activeClass);
      }

      const markerElement = markerArray[index];
      markerElement.classList.add(activeClass);

      if (markerType === "start") {
        this.lastStartMarker = markerElement;
      } else {
        this.lastEndMarker = markerElement;
      }

      console.log(`${markerType} marker ${index} is now active (via updateMarker).`);
    } else {
      console.error(`Invalid index ${index} for ${markerType} marker.`);
    }
    for (let i = 0; i < GRID_CELL_COUNT; i++){
      const cell = this.cells[i];
      if (i < startMarkerPosition * 16 || i > (endMarkerPosition * 16) + 15){
        cell.isPlayable = false;
      }else{
        cell.isPlayable = true;
      }
    }
   }
  getWord() {
    const cell = this.cells[this.app.getModule("disk").currentCell];
    console.log("current cell: " + cell);
    return cell.gridCell.textContent; // Return the current cell's content
}

setCellSyllable(index, syllable) {
    const cell = this.cells[index];
    cell.syllable = syllable; // Update the internal syllable property
}

getCurrentCellSyllable(){
    return this.cells[this.currentCell]?.syllable || "";
}

moveToNextCell() {
    this.currentCell++;
    if (this.currentCell >= this.cells.length) {
        this.currentCell = 0; // Loop back to the first cell
    this.focusCurrentCell();
}
}
moveToPreviousCell() {
    this.currentCell--;
    if (this.currentCell < 0) {
        this.currentCell = this.cells.length - 1; // Loop back to the last cell
    }
    this.focusCurrentCell();
}

moveToNextRow() {
    const nextRow = Math.floor(this.currentCell / 16) + 1;
    this.currentCell = nextRow * 16;
}
  
}