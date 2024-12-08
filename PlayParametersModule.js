class PlayParametersModule extends Module {
  constructor(app, titleText, styleName, htmlFile, parentElement) {
   super(app, titleText, styleName, htmlFile, parentElement);
    
    this.valueSelectorContainer = null;
  }

  // Override setupDOM to handle the DOM elements and event listeners
  setupDOM() {
    super.setupDOM();
    this.valueSelectorContainer = this.moduleContent.querySelector("#play-parameters-value-selector");
  }
  
  async loadValueSelector(){
      const htmlLoader = new HTMLFileLoader();
      const content = await htmlLoader.loadHtmlFromFile(VALUE_SELECTOR_URL);
      this.valueSelectorContainer.innerHTML = content;
      this.parameterValues = this.app.getModule("disk").playParameterValues;
      this.valueSelector = new ValueSelector(this, this.parameterValues);

  }
}
