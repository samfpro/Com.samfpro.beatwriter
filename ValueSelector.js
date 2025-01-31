const VALUE_SELECTOR_URL = "html/valueSelector.html";

class ParameterValue {
  constructor(propertyName, labelAbbv, minValue, maxValue, initialValue, dataType, onChangeCallback = null) {
    this.propertyName = propertyName;
    this.labelAbbv = labelAbbv;
    this.minValue = minValue;
    this.maxValue = maxValue;
    this._currentValue = initialValue; // Use a private variable for the current value
    this.dataType = dataType;
    this.onChangeCallback = onChangeCallback; // Function to execute on value change
  }

  // Getter for currentValue
  get currentValue() {
    return this._currentValue;
  }

  // Setter for currentValue
  set currentValue(newValue) {
  if (newValue < this.minValue || newValue > this.maxValue) {
    throw new Error(`Value must be between ${this.minValue} and ${this.maxValue}`);
  }

  this._currentValue = newValue; // Store old value for comparison// Update to new value

  // Call the callback function if provided
  if (this.onChangeCallback && typeof this.onChangeCallback === 'function') {
    console.log("running callback");
    this.onChangeCallback(); // Pass both new and old values
  }
}
}


class ValueSelector {
  constructor(parentModule, parameterValues) {
    this.parentModule = parentModule;
    this.parameterValues = parameterValues;
    this.container = this.parentModule.moduleContent.querySelector(".value-selector");

    this.parameterValues.forEach((param, i) => {
      this.container.querySelector(`#label-${i + 1}`).textContent = param.labelAbbv;
    });

    this.lights = this.container.querySelectorAll(".light");
    this.branchLights = {
      top: this.container.querySelector("#branch-light-top"),
      bottom: this.container.querySelector("#branch-light-bottom")
    };
    this.toggleButton = this.container.querySelector(".value-selector-toggle-button");
    this.display = this.container.querySelector(".value-selector-display");

    this.incButton = this.container.querySelector(".svb-inc");
    this.decButton = this.container.querySelector(".svb-dec");

    this.currentParameterIndex = 0;

    this.toggleButton.addEventListener("click", () => this.toggleSelector());
    this.incButton.addEventListener("click", () => this.changeValue(1));
    this.decButton.addEventListener("click", () => this.changeValue(-1));

    this.updateValueSelectorUI(this.currentParameterIndex);
  }

  updateValueSelectorUI(index) {
    console.log("Updating value selector");

    // Update lights
    this.lights.forEach((light, i) => light.classList.toggle("light-active", i === index));

    // Reset branch lights
    Object.values(this.branchLights).forEach(light => light.classList.remove("active"));

    // Activate the correct branch light
    if (index === 0) {
      this.branchLights.bottom.style.borderBottomWidth = "2px";
      this.branchLights.bottom.style.borderRightWidth = "2px";
      this.branchLights.top.style.borderBottomWidth = "2px";
      this.branchLights.bottom.style.borderBottomWidth = "2px";
      this.branchLights.bottom.style.borderRightWidth = "2px";
      this.branchLights.top.style.borderBottomWidth = "black";
      this.branchLights.bottom.style.borderBottomColor = "black";
      this.branchLights.bottom.style.borderRightWColor = "black";
      this.branchLights.top.style.borderBottomColor = "black";
      this.branchLights.bottom.style.borderBottomColor = "black";
      this.branchLights.bottom.style.borderRightColor= "black";
      this.branchLights.top.style.borderBottomColor = "black";
      
      this.branchLights.top.style.borderTopWidth = "2px";
      this.branchLights.top.style.borderRightWidth = "2px";
      this.branchLights.top.style.borderTopColor = "greenyellow";
      this.branchLights.top.style.borderRightColor = "greenyellow";
    } else if (index === 1) {
      this.branchLights.top.style.borderTopColor = "black";
      this.branchLights.top.style.borderRightColor = "black";
      this.branchLights.top.style.borderBottomColor = "greenyellow";
    } else if (index === 2) {
      this.branchLights.top.style.borderBottomColor = "black";
      this.branchLights.bottom.style.borderBottomColor = "greenyellow";
      this.branchLights.bottom.style.borderRightColor = "greenyellow";
    }

    // Update display
    this.display.textContent = this.parameterValues[index].currentValue;
    this.currentParameterIndex = index;
    const pm = this.parentModule.app.getModule("projectManager");
    if (pm){
     pm.updatePropertiesDisplay();
    }  
  }

  toggleSelector() {
    console.log("Toggling value selector");
    this.currentParameterIndex = (this.currentParameterIndex + 1) % this.parameterValues.length;
    this.updateValueSelectorUI(this.currentParameterIndex);
  }

  changeValue(delta) {
    const currentParam = this.parameterValues[this.currentParameterIndex];
    const newValue = currentParam.currentValue + delta;

    if (newValue >= currentParam.minValue && newValue <= currentParam.maxValue) {
      currentParam.currentValue = newValue;
      this.updateValueSelectorUI(this.currentParameterIndex);
    }
  }
}


