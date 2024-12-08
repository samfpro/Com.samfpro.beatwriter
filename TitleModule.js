class TitleModule extends Module {
  constructor(app, titleText, styleName, htmlFile, parentElement) {
    super(app, titleText, styleName, htmlFile, parentElement);
    
  }
  
  setupDOM() {
    super.setupDOM();
    this.moduleContent.id = "title-module-content";
    console.log("Setup DOM for TitleModuleModule");
  }
}


