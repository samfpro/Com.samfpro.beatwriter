function getSyllables(word) {
    console.log("Fetching syllables for word: " + word);
    
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'Src/Syllables.txt', true); // Corrected path
        
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                const text = xhr.responseText;
                const lines = text.split('\n');

                // Log the first few lines of the text file
                console.log("First few lines of the text file:");
                for (let i = 0; i < Math.min(5, lines.length); i++) {
                    console.log(lines[i]);
                }

                let trimmedWord = word.trim().toLowerCase(); // Trim and lowercase the word for case-insensitive comparison
                console.log("Searching for word: " + trimmedWord);

                for (const line of lines) {
                    const [fileWord, syllableStr] = line.split('=');
                    if (fileWord && syllableStr) {
                        const trimmedFileWord = fileWord.trim().toLowerCase(); // Trim and lowercase the file word
                        if (trimmedFileWord === trimmedWord) {
                            const syllableArray = syllableStr.trim().split(/[^a-zA-Z]+/);
                            console.log("Word found in file: " + word + " with syllables: " + syllableArray);
                            return resolve(syllableArray);
                        }
                    }
                }

                // If word ends with 's', remove the 's' and look it up again
                if (trimmedWord.endsWith('s')) {
                    trimmedWord = trimmedWord.slice(0, -1); // Remove the last character ('s')
                   console.log("Word ends with 's', retrying without 's': " + trimmedWord);
                    getSyllables(trimmedWord).then((syllableArray) => {
                        if (syllableArray.length > 0) {
                            syllableArray[syllableArray.length - 1] += 's'; // Add 's' to the last syllable
                        }
                        return resolve(syllableArray);
                    });
                } else {
                    console.log("Word not found in file: " + word);
                    resolve([word]);
                }
            } else {
                console.error('Error fetching the text file:', xhr.statusText);
                resolve([word]); // Return the original word if there’s an error
            }
        };

        xhr.onerror = function() {
            console.error('Network error occurred while fetching the text file.');
            resolve([word]); // Return the original word in case of network error
        };

        xhr.send();
    });
}


class ModeWrite {
    constructor(app) {
        this.app = app; // Use GridViewModule instance directly
    }

    async handleGridClick(cellIndex) {
        console.log("Grid cell clicked: " + cellIndex);
        
        const currentWord = this.app.getModule("gridView").getWord(); // Get the word from the current cell
        if (currentWord !== '') {
            console.log("Processing word...");
            await this.processWord(currentWord);
        } else {
            this.app.getModule("gridView").setCellSyllable(this.app.getModule("disk").currentCell, ""); // Clear the syllable if no word is found
            console.log("No word found. Clearing syllable.");
        }

        this.app.getModule("disk").currentCell = cellIndex; // Update the current cell
    }

    async handleGridKeyup(event) {
        const gridView = this.app.getModule("gridView");
        const currentWord = gridView.getWord(); // Get the current word
        console.log("Current cell content: " + currentWord);

        if (event.key === "Enter") {
            if (currentWord !== "") {
                await this.processWord();
            }
            this.moveToNextRow();
        } else if (event.key === "Backspace" && currentWord === "") {
            this.gridView.moveToPreviousCell(); // Move to the previous cell
            this.selectTextIfPresent();
        }

        if (/[a-zA-Z']$/.test(currentWord)) {
           console.log("Last character is a letter or an apostrophe, continuing typing in the cell.");
           return;
        }

        console.log("Non-letter detected at the end. Processing word...");
        await this.processWord(currentWord);
    }

 async processWord(word) {
    console.log("Processing word: " + word);

    const syllables = await getSyllables(word);
    const gridView = this.app.getModule("gridView");
    const diskModule = this.app.getModule("disk");

    syllables.forEach((syllable, index) => {
        console.log("Setting syllable: " + syllable + " at cell " + diskModule.currentCell);
        
        gridView.setCellSyllable(diskModule.currentCell, syllable);
        diskModule.currentCell++; // Directly update the disk's currentCell property
    });
}

    selectTextIfPresent() {
        if (this.gridView.getCurrentCellSyllable()) {
            console.log("Selecting text at cell " + this.gridView.currentCell);
            this.gridView.selectTextInCurrentCell();
        }
    }

    moveToNextRow() {
        this.gridView.moveToNextRow();
        console.log("Moved to the next row. Current cell is now " + this.gridView.currentCell);
        this.gridView.focusCurrentCell();
    }
}

