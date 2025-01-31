class ManagerModule extends Module {
  constructor(app, titleText, styleName, htmlFile, parentElement) {
    super(app, titleText, styleName, htmlFile, parentElement);
    window.fileManagerModule = this;
    this.projectNameInput = null;
    this.saveButton = null;
    this.loadButton = null;
    this.newButton = null;

    this.autosaveKey = "autosaveData"; // Key for local storage
    this.autosaveInterval = null; // To manage autosave timing
    this.hasManuallyLoadedProject = false; // Tracks manual file loading
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
      }
    });

    this.saveButton?.addEventListener("click", () => this.saveProject());
    this.loadButton?.addEventListener("click", () => this.openFilePicker());
    this.newButton?.addEventListener("click", () => this.createNewProject());

    // Start autosave and check for previous autosave
    

    // Delay autosave loading to allow for manual load check
    setTimeout(() => {
      if (!this.hasManuallyLoadedProject) {
        this.loadAutosave();
      }
    }, 100); // Small delay ensures manual load takes precedence
  }

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
    const disk = this.app.getModule("disk");
    const gridView = this.app.getModule("gridView");
    const mixer = this.app.getModule("mixer");

    if (this.projectNameInput?.value.trim() === "") {
      alert("Please enter a project name before saving.");
      return;
    }

    const projectName = this.projectNameInput.value.trim();
    if (disk && gridView && mixer) {
      const project = new Project(disk.projectUrl);
      const serializedData = project.compileProject(disk, gridView, mixer);

      if (window.Android) {
        window.Android.saveFileWithName(serializedData, projectName);
      } else {
        console.warn("Save functionality is not available in this environment.");
      }
    }
  }

  autosaveProject() {
    const disk = this.app.getModule("disk");
    const gridView = this.app.getModule("gridView");
    const mixer = this.app.getModule("mixer");

    if (disk && gridView && mixer) {
      const project = new Project(disk.projectUrl);
      const serializedData = project.compileProject(disk, gridView, mixer);
      localStorage.setItem(this.autosaveKey, serializedData); // Save to local storage
    }
  }
  
  loadAutosave() {
    if (this.hasManuallyLoadedProject) return; // Skip if a manual project is loaded

    const autosavedData = localStorage.getItem(this.autosaveKey);
    if (autosavedData) {
      try {
        const project = new Project();
        project.loadFromSerializedProject(
          autosavedData,
          this.app.getModule("disk"),
          this.app.getModule("gridView"),
          this.app.getModule("mixer")
        );

        const diskModule = this.app.getModule("disk");
        if (diskModule) {
          diskModule.projectUrl = window.Android
            ? window.Android.getCurrentProjectUrl()
            : "";
        }

        console.log("Autosave loaded successfully.");
      } catch (error) {
        console.error("Error loading autosave data: ", error);
      }
    } else {
      console.log("No autosave data found.");
    }
  }

  openFilePicker() {
    if (window.Android) {
      window.Android.openFilePicker("json");
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

      const diskModule = this.app.getModule("disk");
      if (diskModule) {
        diskModule.projectUrl = window.Android.getCurrentProjectUrl();
      }

      this.hasManuallyLoadedProject = true; // Mark manual load
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

      // Clear autosave data
      localStorage.removeItem(this.autosaveKey);
    }
    this.hasManuallyLoadedProject = true; // Prevent autosave overwrite
  }

  updateProjectUrl(projectUrl) {
    const disk = this.app.getModule("disk");
    if (disk) disk.projectUrl = projectUrl;
  }

  unloadModule() {
    this.stopAutosave();
    super.unloadModule();
  }
}