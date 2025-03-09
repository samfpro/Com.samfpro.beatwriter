class ProjectManagerModule extends Module {
  constructor(app, titleText, styleName, htmlFile, parentElement) {
    super(app, titleText, styleName, htmlFile, parentElement);
    this.app = app;
    this._projectName = "untitled";
    this.projectUri = null; // Store the file path
    this.autosaveKey = "autosaveData";
    window.projectManager = this;
    // Try to load autosave on startup
  }

  setupDOM() {
    super.setupDOM();

    const elementMap = {
      saveButton: "save-button",
      saveAsButton: "save-as-button",
      loadButton: "load-button",
      newButton: "new-button",
      importButton: "import-button",
      exportButton: "export-button",
      projectNameDisplay: "project-name-display",
      propertiesDisplay: "properties-display"
    };

    Object.entries(elementMap).forEach(([prop, id]) => {
      this[prop] = this.moduleContent.querySelector(`#${id}`);
    });

    this._addEventListeners();
  }

  _addEventListeners() {
    const buttonActions = {
      saveAsButton: () => this.saveProjectAs(),
      saveButton: () => this.saveProject(),
      loadButton: () => this.loadProject(),
      newButton: () => this.createNewProject(),
      importButton: () => this.importText(),
      exportButton: () => this.exportText()
    };

    Object.entries(buttonActions).forEach(([button, action]) => {
      if (this[button]) {
        this[button].addEventListener("click", action);
      }
    });
  }

  get projectName() {
    return this._projectName;
  }

  set projectName(value) {
    if (!value || value === this._projectName) return;

    console.log("Setting project name:", value);
    this._projectName = value;
    if (this.projectNameDisplay) {
      this.projectNameDisplay.textContent = value;
      console.log("Updated project name display:", this.projectNameDisplay.textContent);
    }
  }

  async saveProject() {
    if (!this.projectUri) {
      return this.saveProjectAs();
    }

    const projectData = this.project.compileProject();
    this.propertiesDisplay.textContent = projectData;
    if (window.AndroidInterface?.saveFile) {
      window.AndroidInterface.saveFile(this.projectUri, projectData);
      console.log("Project saved:", this.projectUri);
    } else {
      console.error("Android interface not available for saving.");
    }
  }

  async saveProjectAs() {
    if (window.AndroidInterface?.saveFileAs) {
      const projectData = this.project.compileProject();
      window.AndroidInterface.saveFileAs(projectData);
    } else {
      console.error("Android interface not available for save as.");
    }
  }

  async loadProject() {
    if (window.AndroidInterface?.loadFile) {
      window.AndroidInterface.loadFile();
    } else {
      console.error("Android interface not available for loading.");
    }
  }

  autosaveProject() {
    try {
      const data = this.project.compileProject();
      localStorage.setItem(this.autosaveKey, data);
      this.propertiesDisplay.textContent = data;
      console.log("Project autosaved.");
    } catch (error) {
      console.error("Failed to autosave project:", error);
    }
  }

  loadAutosave() {
    try {
      const data = localStorage.getItem(this.autosaveKey);
      if (data) {
        this.project = new Project(this.app);
        this.project.loadFromSerializedProject(data);
        console.log("Autosaved project loaded successfully.");
      } else {
        console.log("No autosaved project found.");
        this.createNewProject();
      }
    } catch (error) {
      console.error("Failed to load autosaved project:", error);
      this.createNewProject();
      localStorage.removeItem(this.autosaveKey);
    }
  }

  createNewProject() {
    this.project = new Project(this.app);
    this.projectName = "untitled";
    this.projectUri = null;
    this.project.createNewProject();
    console.log("New project created.");
  }

  handleAndroidSaveAsResult(fileName, fileUri) {
    if (fileName && fileUri) {
      console.log("Save As selected: " + fileName);
      console.log("File URI: " + fileUri);

      this.projectName = fileName.replace(/\.json$/, "");
      this.projectUri = fileUri;

      const compiledData = this.project.compileProject();
      if (window.AndroidInterface) {
        window.AndroidInterface.saveFile(fileUri, compiledData);
      } else {
        console.warn("Android interface not available.");
      }
    }
  }

  handleAndroidSaveResult(fileName, fileUri) {
    console.log("File saved successfully: " + fileName);
    console.log("File URI: " + fileUri);
    this.propertiesDisplay.textContent = this.project.compileProject();
    this.projectNameDisplay.textContent = fileName;
    alert("Project saved as: " + fileName);
  }

  handleAndroidLoadResult(serializedProject) {
    this.project = new Project(this.app);
    this.project.loadFromSerializedProject(serializedProject);
    console.log("Project loaded successfully.");
  }
}