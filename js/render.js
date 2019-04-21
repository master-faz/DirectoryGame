// const Phaser = require('phaser');
const { dialog, app, BrowserWindow } = require('electron').remote;

win = remote.getCurrentWindow();

/************************/
/*    Event Listeners   */
/************************/

let selected = document.getElementById('currSelected');
setInterval(function(){ 
  selected.innerText = null;
  deleteBtn.disabled = false;
 }, 6000);
// listens for click event for buttons at bottom of table
let openBtn = document.getElementById('openFileBtn');
openBtn.addEventListener('click', () => {
  openFile(selected.innerText)
})

let infoBtn = document.getElementById('infoFileBtn');
infoBtn.addEventListener('click', () => {
  getFileInfo(selected.innerText)
})

let deleteBtn = document.getElementById('deleteFileBtn');
deleteBtn.addEventListener('click', () => {
  remover(selected.innerText)
})

let moveBtn = document.getElementById('moveFileBtn');
moveBtn.addEventListener('click', () => {
  moveFile(selected.innerText)
})

let copyBtn = document.getElementById('copyFileBtn');
copyBtn.addEventListener('click', () => {
  copyFile(selected.innerText)
})

// adds new folder when button is clicked
let folderBtn = document.getElementById('newFolderBtn');
folderBtn.addEventListener('click', () => {
  let folderName = document.getElementById('newFolderName').value;
  if (folderName != '' || folderName != null) {
    newFolder(folderName)
  }
})

// adds new file when button is clicked
let fileBtn = document.getElementById('newFileBtn');
fileBtn.addEventListener('click', () => {
  let fileName = document.getElementById('newFileName').value;
  if (fileName != '' || fileName != null) {
    newFile(fileName)
  }
})

/************************/
/*    Directory code    */
/************************/


// root for Testing
process.chdir('C:\\Users\\runin\\Documents\\TestDir')
let CurrentDirectory = process.cwd();
fs.readdir(CurrentDirectory, (err, files) => {
  if (err) {
    alert('Error getting sub directories')
  }
  currSubDir = files;
  document.getElementById('currDirectory').innerText = CurrentDirectory;
})
// Point where file system tree will be built
const root = process.cwd();
let currSubDir;
let hasChangedDir = false;

// moves cwd up or down a folder
function changeDirectory(direction, folder) {
  if (direction == 'up') {
    let filePath = path.dirname(CurrentDirectory)
    process.chdir(filePath)
    CurrentDirectory = process.cwd();
  } else if (direction == 'down') {
    let filePath = path.join(CurrentDirectory, folder)
    process.chdir(filePath)
    CurrentDirectory = process.cwd();
  }

  document.getElementById('currDirectory').innerText = CurrentDirectory;

  fs.readdir(CurrentDirectory, (err, files) => {
    if (err) {
      alert('Error getting sub directories');
      changeDirectory('up')
      return
    }
    currSubDir = files;
    console.log(currSubDir);
  })

  hasChangedDir = true;
}

// returns object with file info
function getFileInfo(fileName) {
  try {
    let filePath = path.join(CurrentDirectory, fileName)
    let stats = fs.statSync(filePath);

    // gets file size, creation time, last modification, and absolute path
    let size = formatBytes(stats.size);
    let creationTime = stats.birthtime.toLocaleString('en-US');
    let modTime = stats.mtime.toLocaleString('en-US');
    let absolutePath = filePath;

    const obj = {
      size: size,
      creationTime: creationTime,
      modTime: modTime,
      absolutePath: absolutePath
    }

    let output = `Size: ${obj.size}\n Creation Time: ${obj.creationTime}\n Modification Time: ${obj.modTime}\n Absolute Path: ${obj.absolutePath}`;

    alert(output);
  }
  catch (err) {
    console.error(err)
  }
}

// deletes file or directory
async function remover(fileName) {
  try {
    let filePath = path.join(CurrentDirectory, fileName)
    await fs.remove(filePath)
    alert('Removed')
  } catch (err) {
    console.error(err)
  }
}

// creates new empty file at cwd
async function newFile(fileName) {
  try {
    let filePath = path.join(CurrentDirectory, fileName);
    await fs.ensureFile(filePath);
    alert('New File created!')
  }
  catch (err) {
    console.error(err)
  }
}

// creates new folder at cwd
async function newFolder(folderName) {
  try {
    let filePath = path.join(CurrentDirectory, folderName)
    await fs.mkdir(filePath)
    alert('New Folder created!')
  } catch (err) {
    console.error(err)
  }
}

// opens file
async function openFile(fileName) {
  try {
    let filePath = path.join(CurrentDirectory, fileName)
    shell.openItem(filePath)
  }
  catch (err) {
    console.error(err)
  }
}

// moves file from one directory to another
async function moveFile(src) {
  const options = {
    title: "Select New Directory",
    defaultPath: CurrentDirectory,
    buttonLabel: "Select Directory",
    properties: ["openDirectory"]
  }
  let filePath = path.join(CurrentDirectory, src)
  dialog.showOpenDialog(options, async (dest) => {
    try {
      let filename = path.parse(src)
      let destPath = path.join(dest[0], filename.base)
      await fs.move(filePath, destPath)
      alert('File moved to ' + destPath + '!')
    } catch (err) {
      console.error(err)
    }
  })

}

// copies file to specified directory
async function copyFile(src) {
  const options = {
    title: "Select New Directory",
    defaultPath: CurrentDirectory,
    buttonLabel: "Select Directory",
    properties: ["openDirectory"]
  }

  let filePath = path.join(CurrentDirectory, src)
  dialog.showOpenDialog(win, options, async (dest) => {
    try {
      let filename = path.parse(src)
      let destPath = path.join(dest[0], filename.base)
      await fs.copy(filePath, destPath)
      alert('File Copied to ' + destPath + '!')
    } catch (err) {
      console.error(err)
    }
  })
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}