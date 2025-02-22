const GRID_CELL_COUNT = 288;
const MARKER_COUNT = 18;

class GridViewModule extends Module {
  constructor(app, titleText, styleName, htmlFile, parentElement) {
    super(app, titleText, styleName, htmlFile, parentElement);
    this.gridViewDisplay = null;
    this.cellEditorContainer = null;
    this.gridContainer = null;
    this.cells = [];
    this.startMarkers = [];
    this.lastStartMarker = null;
    this.endMarkers = [];
    this.lastEndMarker = null; // Add a reference for the last active end marker
    this.startMarkerContainer = null;
    this.endMarkerContainer = null;
    this.rowLabelContainer = null;
    this.modeWrite = new ModeWrite(this); // Pass `this` (GridViewModule) to ModeWrite
    this.modeArrange = new ModeArrange(this);
    this.syllableSwitchContainer = null;
    this.syllableSwitch = null;
    this._autoSyllables = true;
    this._startMarkerPosition = 0;
    this._endMarkerPosition = 0;
    this._currentCell = 0;
  }

  // Getters and Setters
  get autoSyllables() {
    return this._autoSyllables;
  }

  set autoSyllables(value) {
    this._autoSyllables = value;
    this.app.getModule("projectManager").autosaveProject();
  }

  get startMarkerPosition() {
    return this._startMarkerPosition;
  }

  set startMarkerPosition(value) {
    if (value >= 0 && value < MARKER_COUNT) {
      this._startMarkerPosition = value;
      this.updateMarker("start", value);
    } else {
      console.error(`Invalid startMarkerPosition: ${value}`);
    }
  }

  get endMarkerPosition() {
    return this._endMarkerPosition;
  }

  set endMarkerPosition(value) {
    if (value >= 0 && value < MARKER_COUNT) {
      this._endMarkerPosition = value;
      this.updateMarker("end", value);
    } else {
      console.error(`Invalid endMarkerPosition: ${value}`);
    }
  }

    get currentCell() {
    return this._currentCell;
  }

  set currentCell(value) {
    if (this._currentCell === value) {
        return; // Prevent redundant reassignments
    }
    if (value >= 0 && value < GRID_CELL_COUNT) {
      console.log("current cell is: " + this._currentCell);
      this.cells[this._currentCell].isCurrentCell = false;
      this._currentCell = value;
      console.log("current cell is: " + this._currentCell);
  
      this.cells[value].isCurrentCell = true;
      // Only focus the cell here
      this.cells[value].gridCell.focus();
      console.log("focused on cell" + value);
    } else {
      console.error(`Invalid currentCell: ${value}`);
    }
  }

  setupDOM() {
    super.setupDOM();

    this.gridViewDisplay = this.moduleContent.querySelector("#grid-view-display");
    this.cellEditorContainer = this.moduleContent.querySelector("#cell-editor-container");
    this.gridContainer = this.gridViewDisplay.querySelector("#grid-container");
    this.startMarkerContainer = this.gridViewDisplay.querySelector("#start-marker-container");
    this.endMarkerContainer = this.gridViewDisplay.querySelector("#end-marker-container");
    this.syllableSwitchContainer = this.moduleContent.querySelector("#syllable-switch-container");
    this.cellSyllableSwitchContainer = this.moduleContent.querySelector("#syllable-override-switch");
    this.cellEmphasizeSwitchContainer = this.moduleContent.querySelector("#emphasize-switch");
    console.log("attempting to build syllable switch with container: " + this.syllableSwitchContainer);
    
    this.syllableSwitch = new BoolSwitch(
      this.syllableSwitchContainer,
      this.autoSyllables, // Initial state
      "Auto Syllables:  ", // Label text
      (newState) => { // Callback for state changes
        this.autoSyllables = newState;
        console.log(`autoSyllables is now: ${newState}`);
      }
    );
    this.cellSyllableSwitch = new BoolSwitch(
      this.cellSyllableSwitchContainer,
      this.cellAutoSyllables, // Initial state
      "", // Label text
      (newState) => { // Callback for state changes
        this.cellAutoSyllables = newState;
        console.log(`cellAutoSyllables is now: ${newState}`);
      }
    );
    this.emphasizeSwitch = new BoolSwitch(
      this.cellEmphasizeSwitchContainer,
      this.cellEmphasize, // Initial state
      "", // Label text
      (newState) => { // Callback for state changes
        this.cellEmphasize = newState;
        console.log(`cellEmphasize is now: ${newState}`);
      }
    );
    this.timeOffsetDisplay = this.moduleContent.querySelector("#time-offset-display");
    this.voiceRateDisplay = this.moduleContent.querySelector("#time-offset-display");
    

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
  
  generateGrid() {
    this.gridContainer.innerHTML = "";
    const rowLabelContainers = this.gridViewDisplay.querySelectorAll(".row-label-container");
    const columnLabelContainers = this.gridViewDisplay.querySelectorAll(".column-label-container");

    for (let i = 0; i < GRID_CELL_COUNT; i++) {
      const cell = new Cell(this.app, this.gridContainer, this.cellEditorContainer, i);
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
      this.startMarkers.push(new StartMarker(this.startMarkerContainer, i).startMarkerCell);
      this.endMarkers.push(new EndMarker(this.endMarkerContainer, i).endMarkerCell);
    }
    
  }

  handleGridCellClick(event) {
    console.log("Detected click in grid");
    const cellElement = event.target.closest(".grid-cell");
    if (!cellElement) return; // Ignore clicks outside cells

    const cellIndex = cellElement.dataset.index;

    if (cellIndex) {
      console.log(`Grid cell ${cellIndex} clicked`);
      switch (this.app.getModule("mode").mode) {
        case MODE_WRITE:
          this.modeWrite.handleGridClick(cellIndex);
          break;
        case MODE_ARRANGE:
          this.modeArrange.handleGridCellClick(cellIndex);
          break;
        default:
          console.warn("Unhandled mode:", this.app.getModule("mode").mode);
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
      switch (this.app.getModule("mode").mode) {
        case MODE_WRITE:
          this.modeWrite.handleGridKeyup(event);
          break;
        case MODE_ARRANGE:
          console.log("keyup ignored in mode arrange");
          break;
        default:
          console.warn("Unhandled mode:", this.app.getModule("mode").mode);
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
          // Check if the clicked marker is the currently active start marker
          if (index === this._startMarkerPosition) {
            console.log("Active start marker clicked. Starting transport.");
            this.app.getModule("transport").start();
          } else {
            // Update the startMarkerPosition to the new marker
            this.startMarkerPosition = index;
          }
        } else {
          this.endMarkerPosition = index;
        }
      } else {
        console.error(`Could not find index for the clicked ${markerType} marker.`);
      }
    } else {
      console.log(`No ${markerType} marker found for the clicked element.`);
    }
  }

  updateMarker(markerType, index) {
    const activeClass = `${markerType}-marker-active`;
    const markerArray = markerType === "start" ? this.startMarkers : this.endMarkers;
    let lastMarker = markerType === "start" ? this.lastStartMarker : this.lastEndMarker;

    console.log(`Updating ${markerType} marker at index ${index}`);

    if (index >= 0 && index < markerArray.length) {
      if (lastMarker) {
        console.log(`Removing active class from previous ${markerType} marker`);
        lastMarker.classList.remove(activeClass);
      }

      const markerElement = markerArray[index];
      console.log(`Adding active class to ${markerType} marker at index ${index}`, markerElement);
      markerElement.classList.add(activeClass);

      if (markerType === "start") {
        this.lastStartMarker = markerElement;
        this._startMarkerPosition = index; // Update internal state
      } else {
        this.lastEndMarker = markerElement;
        this._endMarkerPosition = index; // Update internal state
      }

      // Update the playable cells based on start and end marker positions
      this.updatePlayableCells();
      this.app.getModule("waveFormView").updateMarkers();
    } else {
      console.error(`Invalid index ${index} for ${markerType} marker.`);
    }
  }

  updatePlayableCells() {
    console.log("updating Playable Cells");
    const startCell = this._startMarkerPosition * 16;
    const endCell = (this._endMarkerPosition + 1) * 16 - 1;

 for (let i = 0; i < this.cells.length; i++){
   if (i < startCell || i > endCell){
     this.cells[i].isPlayable = false;
   }else{
     this.cells[i].isPlayable = true;
   }
 }
}

  getWord() {
  const cell = this.cells[this.currentCell];
  if (!cell || !cell.gridCell) {
    console.error("Current cell not found");
    return "";
  }
  return cell.gridCell.textContent;
}

  getCurrentCellSyllable() {
    return this.cells[this.currentCell]?.syllable || "";
  }

  moveToNextRow() {
    const nextRow = Math.floor(this.currentCell / 16) + 1;
    this.currentCell = nextRow * 16;
  }

  loadGridData(cells) {
  // Clear existing cell states while preserving DOM elements
  this.cells.forEach(cell => {
    cell.syllable = "";
    cell.isPlayable = false;
    cell.isCandidate = false;
  });

  // Update cells with loaded data
  cells.forEach(cellData => {
    const cell = this.cells[cellData.index];
    if (cell) {
      cell.syllable = cellData.syllable || "";
      cell.isPlayable = cellData.isPlayable || false;
      cell.isCandidate = cellData.isCandidate || false;
    }
  });

  // Restore marker positions and playable states
  this.updatePlayableCells();
  this.currentCell = this._currentCell; // Refresh current cell focus
}

  createCellFromData(data) {
    const existingCell = this.cells.find(cell => cell.index === data.index);
    let cell;
    if (existingCell) {
      // Update the existing cell
      cell = existingCell;
    } else {
      // Create a new cell if none exists for this index
      cell = new Cell(this.gridContainer, data.index);
      this.cells[data.index] = cell; // Ensure the cell is added at the correct index
    }

    // Restore properties from the serialized data
    cell._syllable = data.syllable || "";
    cell._isPlayable = !!data.isPlayable;
    cell._isCandidate = !!data.isCandidate;
    cell._stepPlaying = !!data.stepPlaying;
    cell._mode = data.mode || MODE_WRITE;

    return cell;
  }
  
  switchMode(mode) {
    if (mode === MODE_ARRANGE) {
        this.cells.forEach(cell => {
            cell.mode = MODE_ARRANGE;
            cell.isPlayable = false;
        });
    } else {
        this.cells.forEach(cell => {
            cell.mode = MODE_WRITE;
            cell.isPlayable = true;
        });
    }
    const pm = this.app.getModule("projectManager");
    if (pm){
      pm.autosaveProject();
    }
}
}