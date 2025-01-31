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
    this.modeWrite = new ModeWrite(this); // Pass `this` (GridViewModule) to ModeWrite
    this.modeArrange = new ModeArrange(app);
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
    this.app.getModule("projectManager").updatePropertiesDisplay();
  }

  get startMarkerPosition() {
    return this._startMarkerPosition;
  }

  set startMarkerPosition(value) {
    if (value >= 0 && value < MARKER_COUNT) {
      this._startMarkerPosition = value;
      this.updateMarker("start", value);
      this.app.getModule("projectManager").updatePropertiesDisplay();
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
      this.app.getModule("projectManager").updatePropertiesDisplay();
    } else {
      console.error(`Invalid endMarkerPosition: ${value}`);
    }
  }

  get currentCell() {
    return this._currentCell;
  }

  set currentCell(value) {
    if (value >= 0 && value < GRID_CELL_COUNT) {
      this._currentCell = value;
      this.makeCellCurrent(value);
      this.app.getModule("projectManager").updatePropertiesDisplay();
    } else {
      console.error(`Invalid currentCell: ${value}`);
    }
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
      "Auto Syllables:  ", // Label text
      (newState) => { // Callback for state changes
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
      const cell = new Cell(this.gridContainer, i);
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
    this.startMarkerPosition = 1;
    this.endMarkerPosition = 5;
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
    const startCell = this._startMarkerPosition * 16; // Start marker maps to the beginning of the row
    const endCell = (this._endMarkerPosition + 1) * 16 - 1; // End marker maps to the end of the row

    console.log(`Setting playable cells from ${startCell} to ${endCell}`);

    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i].isPlayable = i >= startCell && i <= endCell;
    }
  }

  getWord() {
    const cell = this.cells[this.currentCell];
    console.log("current cell: " + cell);
    return cell.gridCell.textContent; // Return the current cell's content
  }

  setCellSyllable(index, syllable) {
    const cell = this.cells[index];
    cell.syllable = syllable; // Update the internal syllable property
  }

  getCurrentCellSyllable() {
    return this.cells[this.currentCell]?.syllable || "";
  }

  moveToNextCell() {
    this.currentCell++;
    if (this.currentCell >= this.cells.length) {
      this.currentCell = 0; // Loop back to the first cell
    }
    this.focusCurrentCell();
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

  loadGridData(cells) {
    // Implementation for loading grid data
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
    cell.syllable = data.syllable || "";
    cell.isPlayable = !!data.isPlayable;
    cell.isCandidate = !!data.isCandidate;
    cell.stepPlaying = !!data.stepPlaying;
    cell.mode = data.mode || MODE_WRITE;

    return cell;
  }
}

