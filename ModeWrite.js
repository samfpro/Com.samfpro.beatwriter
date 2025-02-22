function getSyllables(word) {
    console.log("Fetching syllables for word: " + word);
    
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'src/Syllables.txt', true); // Corrected path
        
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
                console.error('Error fetching the text file:' + xhr.statusText);
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
  constructor(gridView) {
    this.gridView = gridView;
    this.isProcessing = false; // Add flag
  }
    
  async handleGridClick(cellIndex) {
      console.log("Grid cell clicked: " + cellIndex);
      const lastWord = this.gridView.getWord();
      const lastCell = this.gridView.currentCell;
      if (lastWord != ""){
         this.processWord(lastWord, lastCell);
      }
      this.gridView.currentCell = cellIndex;
      const word = this.gridView.getWord();
      if (word != ""){
          const range = document.createRange();
          const selection = window.getSelection();
          selection.removeAllRanges();
          range.selectNodeContents(this.gridView.cells[cellIndex].gridCell);
          selection.addRange(range);

            console.log("Text selected in clicked cell.");
      }
  }

  async handleGridKeyup(event) {
    const currentWord = this.gridView.getWord(); // Get the current word
    const lastCell = this.gridView.currentCell;
      console.log("Current cell content: " + currentWord);

    if (event.key === "Enter") {
      if (currentWord !== "") {
          this.processWord(currentWord, lastCell);
      }
      this.moveToNextRow();
        return;
    } 
      if (event.key == "Backspace" && currentWord === ""){
            this.gridView.currentCell--;
          return
    }

    if (/[a-zA-Z']$/.test(currentWord)) {
      console.log("Last character is a letter or an apostrophe, continuing typing in the cell.");
      return;
    }else if(currentWord!= ""){
        this.processWord(currentWord, lastCell);
        return;
        
    }else{
        this.gridView.currentCell++;
    }
  }

  async processWord(word, startCell) {
    console.log("Processing word: " + word);
    let sc = startCell;
    const syllables = await getSyllables(word);
 
    for(let i = 0; i < syllables.length; i++){
        if (this.gridView.currentCell == sc){
            this.gridView.cells[this.gridView.currentCell].syllable = syllables[i];
            this.gridView.currentCell++;
            sc++;
        }else{
            this.gridView.cells[sc].syllable = syllables[i];
            sc++;
        }
        
    }
  }

  async moveToNextRow() {
    const nextRowStartIndex =
      Math.floor(this.gridView.currentCell / 16) * 16; // Calculate start of next row
     
  }
}
