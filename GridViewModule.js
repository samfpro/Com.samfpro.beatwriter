const GRID_CELL_COUNT = 288;
const MARKER_COUNT = 18;

class GridViewModule extends Module {
  constructor(app, titleText, styleName, htmlFile, parentElement) {
    super(app, titleText, styleName, htmlFile, parentElement);
    this.gridViewDisplay = null;
    this.gridContainer = null;
    this.cells = [];
    this.gridCells = [];
    this.startMarkers = [];
    this.lastStartMarker = null;
    this.endMarkers = [];
    this.lastEndMarker = null; // Add a reference for the last active end marker
    this.startMarkerContainer = null;
    this.endMarkerContainer = null;
    this.rowLabelContainer = null;
  }

  setupDOM() {
    super.setupDOM();

    this.gridViewDisplay = this.moduleContent.querySelector("#grid-view-display");
    this.gridContainer = this.gridViewDisplay.querySelector("#grid-container");
    this.startMarkerContainer = this.gridViewDisplay.querySelector("#start-marker-container");
    this.endMarkerContainer = this.gridViewDisplay.querySelector("#end-marker-container");

    // Add a click listener for the entire grid container
    this.gridContainer.addEventListener("click", (event) => {
      this.handleGridCellClick(event);
    });
    // Event listeners for marker containers
    this.startMarkerContainer.addEventListener("click", (event) => {
      this.handleMarkerClick(event, "start");
    });
    this.endMarkerContainer.addEventListener("click", (event) => {
      this.handleMarkerClick(event, "end");
    });
  }
  
  makeCellCurrent(index){
    const gridCell = this.cells[index].gridCell;
    gridCell.contentEditable = true;
    gridCell.focus();
  }
  
  
  generateGrid(cells) {
    this.cells = cells;
    for (let i = 0; i < GRID_CELL_COUNT; i++) {
      const cell = new Cell(this, i);
      this.cells.push(cell);
    }

    for (let i = 0; i < MARKER_COUNT; i++) {
      // Add row labels
      const rowLabelLeft = document.createElement("div");
      const rowLabelRight = document.createElement("div");
      rowLabelLeft.textContent = i;
      rowLabelRight.textContent = i;
      rowLabelLeft.classList.add("row-label");
      rowLabelRight.classList.add("row-label");
      this.gridViewDisplay.querySelectorAll(".row-label-container")[0].appendChild(rowLabelLeft);
      this.gridViewDisplay.querySelectorAll(".row-label-container")[1].appendChild(rowLabelRight);

      // Add column labels
      if (i < 16) {
        const colLabelTop = document.createElement("div");
        const colLabelBottom = document.createElement("div");
        colLabelTop.textContent = i + 1;
        colLabelBottom.textContent = i + 1;
        colLabelTop.classList.add("column-label");
        colLabelBottom.classList.add("column-label");
        this.gridViewDisplay.querySelectorAll(".column-label-container")[0].appendChild(colLabelTop);
        this.gridViewDisplay.querySelectorAll(".column-label-container")[1].appendChild(colLabelBottom);
      }

      // Create markers
      this.startMarkers.push(new StartMarker(this, i).startMarkerCell);
      this.endMarkers.push(new EndMarker(this, i).endMarkerCell);
    }
  }

  handleGridCellClick(event) {
    console.log("detected click in grid");
    const cellElement = event.target.closest(".grid-cell");
    if (!cellElement) return; // Ignore clicks outside cells

    const cellIndex = cellElement.dataset.index;
    if (cellIndex)
    {
      console.log(`Grid cell ${cellIndex} clicked`);

      // Pass the clicked cell index to the DiskModule
      const diskModule = this.app.getModule("disk");
      if (diskModule) {
        diskModule.currentCell = cellIndex;
      }
    }
  }

  handleMarkerClick(event, markerType) {
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
}