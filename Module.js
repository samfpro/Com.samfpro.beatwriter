class Module {
  constructor(app, titleText, styleName, htmlFile, parentElement) {
    this.app = app;
    this.titleText = titleText;
    this.styleName = styleName;
    this.htmlFile = htmlFile;
    this.parentElement = parentElement;

    console.log(`[${new Date().toISOString()}] Instantiating ${this.titleText}`);

    // Initialize UI
    this.initUI();
  }

  initUI() {
    // Create basic DOM elements
    this.moduleContainer = document.createElement("div");
    this.moduleTitle = document.createElement("div");
    this.moduleContent = document.createElement("div");

    this.moduleContainer.classList.add("module-container", "rusty-metal", "outset", this.styleName);
    this.moduleTitle.classList.add("module-title");
    this.moduleTitle.innerText = this.titleText;
    this.moduleContent.classList.add("module-content");

    this.moduleContainer.appendChild(this.moduleTitle);
    this.moduleContainer.appendChild(this.moduleContent);

    if (this.parentElement) {
      this.parentElement.appendChild(this.moduleContainer);
    }
  }

  async initializeWithHtml() {
    try {
      console.log(`[${new Date().toISOString()}] Loading HTML for ${this.titleText}`);
      const htmlLoader = new HTMLFileLoader();
      const content = await htmlLoader.loadHtmlFromFile(this.htmlFile);
      this.moduleContent.innerHTML = content;

      console.log(`[${new Date().toISOString()}] HTML loaded for ${this.titleText}`);
      this.setupDOM();
      console.log(`[${new Date().toISOString()}] ${this.titleText} initialized`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error initializing ${this.titleText}:`, error);
    }
  }

  setupDOM() {
    console.log(`[${new Date().toISOString()}] setupDOM called for ${this.titleText}`);
  }

 
}