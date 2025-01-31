class ProjectManagerModule extends Module {
  constructor(app, titleText, styleName, htmlFile, parentElement) {
    super(app, titleText, styleName, htmlFile, parentElement);
    this._projectName = "<untitled>";
    this._projectUrl = "";
    this.autosaveKey = "autosaveData";
    this.hasManuallyLoadedProject = false;
    this.propertiesDisplay = null;
    this.projectNameInput = null;
    this.saveButton = null;
    this.loadButton = null;
    this.newButton = null;
    this.autosaveInterval = null;
    this.updatePropertiesDisplay = this.updatePropertiesDisplay.bind(this);
    window.projectManager = this;
  }

  setupDOM() {
    super.setupDOM();

    this.projectNameInput = this.moduleContent.querySelector("#project-name-input");
    this.saveButton = this.moduleContent.querySelector("#save-button");
    this.loadButton = this.moduleContent.querySelector("#load-button");
    this.newButton = this.moduleContent.querySelector("#new-button");
    this.propertiesDisplay = this.moduleContent.querySelector("#properties-display");

    if (!this.projectNameInput) console.warn("Project Name Input not found.");
    if (!this.saveButton) console.warn("Save Button not found.");
    if (!this.loadButton) console.warn("Load Button not found.");
    if (!this.newButton) console.warn("New Button not found.");

    this.projectNameInput?.addEventListener("input", (event) => {
      this.projectName = event.target.value;
    });

    this.saveButton?.addEventListener("click", () => this.saveProject());
    this.loadButton?.addEventListener("click", () => this.openFilePicker());
    this.newButton?.addEventListener("click", () => this.createNewProject());

    setTimeout(() => {
      if (!this.hasManuallyLoadedProject) {
        this.loadAutosave();
      }
    }, 100);
  }

  autosaveProject() {
    const serializedData = this.compileProject();
    localStorage.setItem(this.autosaveKey, serializedData);
    console.log("Project autosaved.");
  }

  loadAutosave() {
    const autosavedData = localStorage.getItem(this.autosaveKey);
    if (autosavedData) {
      this.loadFromSerializedData(autosavedData);
      console.log("Autosave data loaded.");
    } else {
      console.log("No autosave data found.");
    }
  }

  createNewProject() {
    const defaultProject = new Project();
    this.loadFromSerializedData(JSON.stringify(defaultProject));
    localStorage.removeItem(this.autosaveKey);
    this.hasManuallyLoadedProject = true;
  }

  saveProject() {
    if (!this._projectName.trim()) {
      alert("Please enter a project name before saving.");
      return;
    }

    const serializedData = this.compileProject();
    if (window.Android) {
      window.Android.saveFileWithName(serializedData, this._projectName.trim());
    } else {
      console.warn("Save functionality is not available in this environment.");
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
    this.loadFromSerializedData(fileData);
    this.hasManuallyLoadedProject = true;
    alert("Project loaded successfully!");
  }

  loadFromSerializedData(serializedData) {
    try {
      const data = JSON.parse(serializedData);

      this.projectName = data.projectName || "<untitled>";
      this.projectUrl = data.projectUrl || "";

      const gridView = this.app.getModule("gridView");
      const mixer = this.app.getModule("mixer");

      gridView?.loadGridData(data.cells || []);
      mixer?.loadMixerSettings(data.mixer || {});

      this.updateUI();
    } catch (error) {
      console.error("Failed to load project: " + error);
    }
  }

  compileProject() {
    const projMgr = this.app.getModule("projectManager");
    const gridView = this.app.getModule("gridView");
    const mixer = this.app.getModule("mixer");
    const beatTrack = this.app.getModule("beatTrack");
    const playParams = this.app.getModule("playParameters");
    const mode = this.app.getModule("mode");

    const project = new Project(this._projectUrl);
    return project.compileProject(
      beatTrack, gridView, mixer, mode, playParams, projMgr
    );
  }

  updateUI() {
    if (this.projectNameInput) this.projectNameInput.value = this._projectName;
  }

  updatePropertiesDisplay = () => {
    const proj = new Project();
    const serializedData = this.compileProject();
    this.propertiesDisplay.textContent = serializedData;
  };

  get projectName() {
    return this._projectName;
  }

  set projectName(value) {
    this._projectName = value;
    if (this.projectNameInput) this.projectNameInput.value = value;
    this.updateUI();
  }

  get projectUrl() {
    return this._projectUrl;
  }

  set projectUrl(value) {
    this._projectUrl = value;
  }

  static getCircularReplacer() {
    const seen = new WeakSet();
    return (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return "[Circular]";
        }
        seen.add(value);
      }
      return value;
    };
  }
}