class FileManagerModule extends Module {
  constructor(app, titleText, styleName, htmlFile, parentElement) {
    super(app, titleText, styleName, htmlFile, parentElement);
    
    this.projectNameInput = null;
    this.saveButton = null;
    this.loadButton = null;
    this.newButton = null;
  }

  setupDOM() {
    super.setupDOM();

    // Get DOM elements
    this.projectNameInput = this.moduleContent.querySelector("#project-name-input");
    this.saveButton = this.moduleContent.querySelector("#save-button");
    this.loadButton = this.moduleContent.querySelector("#load-button");
    this.newButton = this.moduleContent.querySelector("#new-button");

    // Validate that required elements are found
    if (!this.projectNameInput) console.warn("Project Name Input not found.");
    if (!this.saveButton) console.warn("Save Button not found.");
    if (!this.loadButton) console.warn("Load Button not found.");
    if (!this.newButton) console.warn("New Button not found.");

    // Set up event listeners
    this.projectNameInput?.addEventListener("input", (event) => {
      const diskModule = this.app.getModule("disk");
      if (diskModule) {
        diskModule.projectName = event.target.value;
      } else {
        console.warn("DiskModule is not available.");
      }
    });

    this.saveButton?.addEventListener("click", () => this.saveProject());
    this.loadButton?.addEventListener("click", () => this.openFilePicker());
    this.newButton?.addEventListener("click", () => this.createNewProject());
  }

  saveProject() {
    const diskModule = this.app.getModule("disk");
    const gridViewModule = this.app.getModule("gridView");

    if (diskModule && gridViewModule) {
      console.log(`Saving project: ${diskModule.projectName}`);
      const saveData = {
        projectName: diskModule.projectName,
        projectUrl: diskModule.projectUrl,
        beatTrackUrl: diskModule.beatTrackUrl,
        BPM: diskModule.BPM,
        startMarkerPosition: diskModule.startMarkerPosition,
        endMarkerPosition: diskModule.endMarkerPosition,
        mode: diskModule.mode,
        cells: gridViewModule.cells.map(cell => cell.toJSON()), // Assuming Cell class has a `toJSON` method
      };

      const saveDataString = JSON.stringify(saveData);

      if (window.Android) {
        window.Android.saveFile("fileManagerModuleSave"); 
      } else {
        console.warn("Save functionality is not available in this environment.");
      }
    } else {
      console.warn("Modules not available to save the project.");
    }
  }

  openFilePicker() {
    if (window.Android) {
      window.Android.openFilePicker("fileManagerModuleLoad");
    } else {
      console.warn("Load functionality is not available in this environment.");
    }
  }

  // Method to handle the loaded file and load data into the app
  handleLoadedFile(fileData) {
    try {
      const parsedData = JSON.parse(fileData);
      this.loadProject(parsedData);
      alert("Project loaded successfully!");
    } catch (error) {
      console.error("Error parsing loaded file: ", error);
      alert("Failed to load the project.");
    }
  }

  loadProject(parsedData) {
    const diskModule = this.app.getModule("disk");
    const gridViewModule = this.app.getModule("gridView");

    if (diskModule && parsedData) {
      diskModule.projectName = parsedData.projectName || "Untitled Project";
      diskModule.projectUrl = parsedData.projectUrl;
      diskModule.beatTrackUrl = parsedData.beatTrackUrl;
      diskModule.BPM = parsedData.BPM;
      diskModule.startMarkerPosition = parsedData.startMarkerPosition;
      diskModule.endMarkerPosition = parsedData.endMarkerPosition;
      diskModule.mode = parsedData.mode;

      // Assuming that parsedData.cells is an array of cell data
      if (gridViewModule) {
        gridViewModule.loadCells(parsedData.cells);
      }
    }
  }

  createNewProject() {
    const diskModule = this.app.getModule("disk");
    const gridViewModule = this.app.getModule("gridView");

    if (diskModule && gridViewModule) {
      console.log("Creating a new project.");
      diskModule.projectName = "Untitled Project";
      diskModule.projectUrl = "";
      diskModule.beatTrackUrl = "";
      gridViewModule.resetCells();
    }
  }
}
