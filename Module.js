class Module {
  constructor(app, titleText, styleName, htmlFile, parentElement) {
    this.app = app;
    this.titleText = titleText;
    this.styleName = styleName;
    this.htmlFile = htmlFile;
    this.parentElement = parentElement;

    console.log(`[${new Date().toISOString()}] Instantiating ${this.titleText}`);

    
  }
  

  async initialize() {
    try {
      await this.initUI();
      if (this.htmlFile) {
        await this.initializeWithHtml();
      }
      await this.setupDOM();
      console.log(`[${new Date().toISOString()}] ${this.titleText} fully initialized`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Initialization failed for ${this.titleText}:`, error);
    }
  }

  async initUI() {
    return new Promise((resolve) => {
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
      
      resolve();
    });
  }

  async initializeWithHtml() {
    const htmlLoader = new HTMLFileLoader();
    const content = await htmlLoader.loadHtmlFromFile(this.htmlFile);
    this.moduleContent.innerHTML = content;
  }

  async setupDOM() {
    // Base class implementation can stay empty
    console.log(`[${new Date().toISOString()}] Base setupDOM for ${this.titleText}`);
  }
}