class PlayParametersModule extends Module {
  constructor(app, titleText, styleName, htmlFile, parentElement) {
    super(app, titleText, styleName, htmlFile, parentElement);

    this.valueSelectorContainer = null;
    this.valueSelector = null;

    this.parameterValues = [
      new ParameterValue("BPM", "MBPM", 0, 240, 83, "number", this.updateWaveFormMarkers),
      new ParameterValue("TtsVoice", "TTSV", 1, 27, 3, "number", this.updateWaveFormMarkers),
      new ParameterValue("TtsRate", "TTSR", 1, 4, 4, "number", this.updateWaveFormMarkers),
    ];
  }

  setupDOM() {
    super.setupDOM();
    this.valueSelectorContainer = this.moduleContent.querySelector("#play-parameters-value-selector");
    this.loadValueSelector();
  }

  async loadValueSelector() {
    const htmlLoader = new HTMLFileLoader();
    const content = await htmlLoader.loadHtmlFromFile(VALUE_SELECTOR_URL);
    this.valueSelectorContainer.innerHTML = content;
    this.valueSelector = new ValueSelector(this, this.parameterValues);
  }

  // Getter and setter for BPM
  get BPM() {
    return this.parameterValues[0].currentValue;
  }

  set BPM(value) {
    this.parameterValues[0].currentValue = value;

    if (this.valueSelector?.currentIndex === 0) {
      this.valueSelector.display.textContent = value;
    }

    // Custom logic for BPM
    this.app.getModule("waveFormView").bpm = value;
    this.app.getModule("transport").bpm = value;
    console.log(`BPM updated to ${value}`);
  }

  // Getter and setter for TtsVoice
  get TtsVoice() {
    return this.parameterValues[1].currentValue;
  }

  set TtsVoice(value) {
    this.parameterValues[1].currentValue = value;

    if (this.valueSelector?.currentIndex === 1) {
      this.valueSelector.display.textContent = value;
    }

    // Custom logic for TtsVoice
    this.refreshVoiceOptions();
    console.log(`TtsVoice updated to ${value}`);
  }

  // Getter and setter for TtsRate
  get TtsRate() {
    return this.parameterValues[2].currentValue;
  }

  set TtsRate(value) {
    this.parameterValues[2].currentValue = value;

    if (this.valueSelector?.currentIndex === 2) {
      this.valueSelector.display.textContent = value;
    }

    // Custom logic for TtsRate
    this.adjustSpeechRate();
    console.log(`TtsRate updated to ${value}`);
  }

  // Placeholder methods for custom logic
  updateWaveFormMarkers() {
    console.log("Updating waveform markers...");
    // Add actual update logic here
  }

  refreshVoiceOptions() {
    console.log("Refreshing voice options...");
    // Add logic for refreshing TTS voice options
  }

  adjustSpeechRate() {
    console.log("Adjusting speech rate...");
    // Add logic for adjusting TTS speech rate
  }
}