class HTMLFileLoader{
  constructor(){
  }
 
  async loadHtmlFromFile(filePath) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", filePath, true);

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            resolve(xhr.responseText);
          } else {
            reject(`Failed to load HTML file: ${filePath}`);
          }
        }
      };

      xhr.onerror = () => {
        reject(`Error loading HTML: ${xhr.statusText}`);
      };

      xhr.send();
    });
  }
}