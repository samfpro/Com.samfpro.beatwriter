class ProjectManagerModule extends Module {
  constructor(app, titleText, styleName, htmlFile, parentElement) {
    super(app, titleText, styleName, htmlFile, parentElement);
    this.project = new Project(app);
    this.fileHandle = null;
    this.autosaveKey = "autosaveData";
    this.autosaveProject = this.debounce(this._autosaveProject.bind(this), 1000);
  }

  setupDOM() {
    super.setupDOM();

    // Map of element IDs to property names
    const elements = [
      ['save-button', 'saveButton'],
      ['save-as-button', 'saveAsButton'],
      ['load-button', 'loadButton'],
      ['new-button', 'newButton'],
      ['import-button', 'importButton'],
      ['export-button', 'exportButton'],
      ['project-name-display', 'projectNameDisplay'],
      ["properties-display", "propertiesDisplay"]
    ];

    // Assign elements to instance properties
    elements.forEach(([id, prop]) => {
      this[prop] = this.moduleContent.querySelector(`#${id}`);
    });

    // Event listeners
    this.saveButton?.addEventListener('click', () => this.saveProject());
    this.saveAsButton?.addEventListener('click', () => this.saveProjectAs());
    this.loadButton?.addEventListener('click', () => this.openFilePicker());
    this.newButton?.addEventListener('click', () => this.createNewProject());
    this.importButton?.addEventListener('click', () => this.importText());
    this.exportButton?.addEventListener('click', () => this.exportText());

    // Listen to grid changes
    this.app.gridView?.addEventListener('cell-updated', () => this.autosaveProject());
  }

  get projectName() {
    return this.projectNameDisplay.textContent;
  }

  set projectName(value) {
    this.projectNameDisplay.textContent = value;
    this.autosaveProject(); // Trigger debounced autosave
  }

  async saveProject() {
    if (!this.fileHandle) {
      return this.saveProjectAs();
    }

    try {
      const writable = await this.fileHandle.createWritable();
      await writable.write(this.project.compileProject());
      await writable.close();
      console.log('Project saved successfully.');
      this.projectNameDisplay.textContent = this.fileHandle;
    } catch (error) {
      console.error('Error saving project:', error);
      const fileName = `${this.projectName || 'untitled'}.json`;
      this.downloadFile(this.project.compileProject(), fileName);
    }
  }

  async saveProjectAs() {
    const fileName = `${this.projectName || 'untitled'}.json`;
    try {
      this.fileHandle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [{
          accept: {'application/json': ['.json']}
        }]
      });
      await this.saveProject();
    } catch {
      this.downloadFile(this.project.compileProject(), fileName);
    }
  }

  async openFilePicker() {
    try {
      const [fileHandle] = await window.showOpenFilePicker({
        types: [{
          accept: {'application/json': ['.json']}
        }]
      });
      this.fileHandle = fileHandle;
      this.project.loadFromSerializedProject(await (await fileHandle.getFile()).text());
      this.projectName = (await fileHandle.getFile()).name.replace('.json', '');
    } catch (error) {
      console.error('File picker canceled or failed:', error);
    }
  }

  downloadFile(data, fileName) {
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  importText() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'text/plain';
    input.onchange = e => {
      const file = e.target.files[0];
      new FileReader().readAsText(file).onload = e => 
        this.app.gridView.importText(e.target.result);
      input.remove(); // Clean up
    };
    input.click();
  }

  exportText() {
    const text = this.app.gridView.exportText();
    const blob = new Blob([text], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.projectName || 'export'}.txt`;
    a.click();
  }

  createNewProject() {
    this.project = new Project(this.app);
    this.fileHandle = null;
    this.projectName = 'untitled';
  }

  loadAutosave() {
    const data = localStorage.getItem(this.autosaveKey);
    if (data) {
      this.project.loadFromSerializedProject(data);
      this.projectName = this.project.name || 'untitled'; // Update UI
    }
  }

  // Debounce utility function
  debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Actual autosave implementation
  _autosaveProject() {
    if (!this.project) return;
    const data = this.project.compileProject();
    localStorage.setItem(this.autosaveKey, data);
    console.log('Project autosaved');
  }
  updatePropertiesDisplay(data){
    this.propertiesDisplay.textContent= data;
  }
}