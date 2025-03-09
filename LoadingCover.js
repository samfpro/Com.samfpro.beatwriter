class LoadingCover {
  constructor() {
    console.log("Initializing LoadingCover...");

    // Create the cover element
    this.cover = document.createElement("div");
    this.cover.id = "loadingCover";

    // Create a text container inside the cover
    this.textContainer = document.createElement("div");
    this.textContainer.style.position = "absolute"; // Make it independent of the main cover
    this.cover.appendChild(this.textContainer);

    // Append to the body
    document.body.appendChild(this.cover);

    // Counter for active operations
    this.operationCount = 0;

    // Flag to track visibility
    this.isVisible = false;

    // Adjust centering dynamically on scroll or resize
    window.addEventListener("resize", this.updatePosition.bind(this));
    window.addEventListener("scroll", this.updatePosition.bind(this));

    console.log("LoadingCover initialized successfully.");
  }

  // Update position to center text on the viewport
  updatePosition() {
    if (!this.isVisible) {
        return; // Skip position update if the cover is hidden
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Center the textContainer within the visible viewport
    this.textContainer.style.left = `${viewportWidth / 2}px`;
    this.textContainer.style.top = `${viewportHeight / 2}px`;
    this.textContainer.style.transform = "translate(-50%, -50%)";
    
  }

  // Show the cover with custom text
  show(text = "Loading...") {
    this.operationCount += 1; // Increment operation counter
    console.log(`show() called. Current operation count: ${this.operationCount}`);
    console.log(`Displaying text: "${text}"`);

    this.textContainer.textContent = text;
    this.updatePosition(); // Ensure correct position before displaying
    this.cover.style.visibility = "visible";
    this.cover.style.opacity = "1";
    this.isVisible = true; // Set visibility flag to true

    console.log("LoadingCover is now visible.");
  }

  // Hide the cover
  hide() {
    console.log("hide() called.");
    if (this.operationCount > 0) {
      this.operationCount -= 1; // Decrement operation counter
      console.log(`Decremented operation count. Current operation count: ${this.operationCount}`);
    }

    if (this.operationCount === 0) {
      this.cover.style.opacity = "0";
      this.cover.style.visibility = "hidden";
      this.isVisible = false; // Set visibility flag to false
      console.log("LoadingCover is now hidden.");
    } else {
      console.log("LoadingCover is still visible due to ongoing operations.");
    }
  }

  // Hide the cover after a specific callback or promise completes
  hideWhenReady(callback) {
    console.log("hideWhenReady() called.");

    Promise.resolve()
      .then(() => {
        if (typeof callback === "function") {
          console.log("Executing callback function...");
          return new Promise((resolve) => {
            callback();
            requestAnimationFrame(() => {
              console.log("Callback executed. Proceeding to hide.");
              resolve();
            });
          });
        } else if (callback instanceof Promise) {
          console.log("Waiting for promise to resolve...");
          return callback;
        } else {
          console.log("No valid callback or promise provided. Skipping...");
        }
      })
      .finally(() => {
        console.log("Finalizing hideWhenReady(). Calling hide()...");
        this.hide();
      });
  }
}