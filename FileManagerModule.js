class FileManagerModule extends Module {
  constructor(app, titleText, styleName, htmlFile, parentElement) {
    super(app, titleText, styleName, htmlFile, parentElement);
    window.fileManagerModule = this;
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

  // Helper function to handle circular references
  static getCircularReplacer() {
    const seenObjects = new WeakSet();
    return (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seenObjects.has(value)) {
          return "[Circular]"; // Replace circular reference with a placeholder
        }
        seenObjects.add(value);
      }
      return value;
    };
  }

  saveProject() {
    const disk= this.app.getModule("disk");
    const gridView = this.app.getModule("gridView");
    const mixer = this.app.getModule("mixer");

    if (disk && gridView && mixer) {
      const project = new Project(disk.projectUrl);
      
      // Compile the project and handle circular references
      const serializedData = project.compileProject(disk, gridView, mixer);
      console.log("serializedData: " + serializedData);

      if (window.Android) {
        window.Android.saveFile(serializedData);
      } else {
        console.warn("Save functionality is not available in this environment.");
      }
    } else {
      console.warn("Modules not available to save the project.");
    }
  }

  openFilePicker() {
    if (window.Android) {
      window.Android.openFilePicker();
    } else {
      console.warn("Load functionality is not available in this environment.");
    }
  }

  handleLoadedFile(fileData) {
    try {
      const project = new Project();
      project.loadFromSerializedProject(
        fileData,
        this.app.getModule("disk"),
        this.app.getModule("gridView"),
        this.app.getModule("mixer")
      );
      alert("Project loaded successfully!");
    } catch (error) {
      console.error("Error parsing loaded file: ", error);
      alert("Failed to load the project.");
    }
  }

  createNewProject() {
    const diskModule = this.app.getModule("disk");
    const gridView = this.app.getModule("gridView");

    if (diskModule && gridView) {
      console.log("Creating a new project.");
      const project = new Project();
      project.loadFromSerializedProject(
        JSON.stringify({
          projectName: "Untitled Project",
          projectUrl: "",
          cells: [],
        }),
        diskModule,
        gridView,
        this.app.getModule("mixer")
      );
    }
  }
}
