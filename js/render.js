// const Phaser = require('phaser');
const { dialog, app, BrowserWindow } = require('electron').remote;

win = remote.getCurrentWindow();

/************************/
/*    Event Listeners   */
/************************/



let folderBtn = document.getElementById('newFolderBtn');
folderBtn.addEventListener('click', () => {
  let folderName = document.getElementById('newFolderName').value;
  newFolder(folderName)
})

let fileBtn = document.getElementById('newFileBtn');
fileBtn.addEventListener('click', () => {
  let fileName = document.getElementById('newFileName').value;
  newFile(fileName)
})

/************************/
/*    Directory code    */
/************************/

// root for production
//process.chdir('/')

// root for Testing
process.chdir('C:\\Users\\runin\\Documents\\TestDir')
let CurrentDirectory = process.cwd();
fs.readdir(CurrentDirectory, (err, files) => {
  if(err){
    alert('Error getting sub directories')
  }
  currSubDir = files;
  document.getElementById('currDirectory').innerText = CurrentDirectory;
})
// Point where file system tree will be built
const root = process.cwd();
let currSubDir;

// moves cwd up or down a folder
function changeDirectory(direction, folder){
  if(direction == 'up'){
    let filePath = path.dirname(CurrentDirectory)
    process.chdir(filePath)
    CurrentDirectory = process.cwd();
  }else if(direction == 'down'){
    let filePath = path.join(CurrentDirectory, folder)
    process.chdir(filePath)
    CurrentDirectory = process.cwd();
  }

  document.getElementById('currDirectory').innerText = CurrentDirectory;

  fs.readdir(CurrentDirectory, (err, files) => {
    if(err){
      alert('Error getting sub directories')
    }
    currSubDir = files;
    console.log(currSubDir);
  })

}

// returns object with file info
function getFileInfo(fileName){
  try {
    let filePath = path.join(CurrentDirectory, fileName)
    let stats = fs.statSync(filePath);

    // gets file size, creation time, last modification, and absolute path
    let size = stats.size;
    let creationTime = stats.birthtime.toLocaleString('en-US');
    let modTime = stats.mtime.toLocaleString('en-US');
    let absolutePath = filePath;
    
    const obj = {
      size: size,
      creationTime: creationTime,
      modTime: modTime,
      absolutePath: absolutePath
    }

    return obj;    
  } 
  catch (err) {
    console.error(err)
  }
}

// deletes file or directory
async function remover(fileName){  
  try {
    let filePath = path.join(CurrentDirectory, fileName)
    await fs.remove(filePath)
    alert('Removed')
  } catch (err) {
    console.error(err)
  }
}

// creates new empty file at cwd
async function newFile (fileName) {
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
async function newFolder (folderName) {
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
async function moveFile (src) {
  const options = {
      title : "Select New Directory",
      defaultPath : CurrentDirectory,
      buttonLabel : "Select Directory",
      properties : ["openDirectory"]
  }
  let filePath = path.join(CurrentDirectory, src)
  dialog.showOpenDialog( options, async (dest) => {
      try {
          let filename = path.parse(src)
          let destPath = path.join(dest[0], filename.base)
          await fs.move(filePath, destPath)
          alert('File moved to ' + destPath  + '!')
        } catch (err) {
          console.error(err)
        }
  })
  
}

// copies file to specified directory
async function copyFile(src) {
  const options = {
      title: "Select New Directory",
      defaultPath : CurrentDirectory,
      buttonLabel : "Select Directory",
      properties : ["openDirectory"]
  }

  let filePath = path.join(CurrentDirectory, src)
  dialog.showOpenDialog(win ,options, async (dest) => {
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

function openOption() {
  console.log("hello")
}