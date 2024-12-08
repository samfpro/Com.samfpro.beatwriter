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

    // Set up event listeners if elements exist
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

  // Save the current project
  saveProject() {
    const diskModule = this.app.getModule("disk");
    if (diskModule) {
      console.log(`Saving project: ${diskModule.projectName}`);
      // Add save functionality here
    } else {
      console.warn("DiskModule is not available to save the project.");
    }
  }

  // Create a new project
  createNewProject() {
    const diskModule = this.app.getModule("disk");
    if (diskModule) {
      console.log("Creating a new project.");
      diskModule.projectName = "Untitled Project";
      diskModule.projectUrl = "";
      diskModule.beatTrackUrl = "beatTrack/Turtletuck_83BPM.mp3";
      diskModule.BPM = 120;
      diskModule.startMarkerPosition = 0;
      diskModule.endMarkerPosition = 0;
      diskModule.currentCell = null;
      diskModule.mode = "default";
      diskModule.updatePropertiesDisplay();
    } else {
      console.warn("DiskModule is not available to create a new project.");
    }
  }

  // Open the file picker
  openFilePicker() {
    if (window.Android) {
      window.Android.showFilePicker("application/json", "fileManagerModule");
    } else {
      console.warn("File picker not available in this environment.");
    }
  }
}