// const Phaser = require('phaser');
const { dialog, app, BrowserWindow } = require('electron').remote;

win = remote.getCurrentWindow();

/************************/
/*    Event Listeners   */
/************************/

let selected = document.getElementById('currSelected');

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

// listens for click event for buttons at bottom of table
let openBtn = document.getElementById('openFileBtn');
openBtn.addEventListener('click', () => {
    openFile(selected.innerText)
})

let infoBtn = document.getElementById('infoFileBtn');
infoBtn.addEventListener('click', () => {
    if (selected.innerText != null) {
        getFileInfo(selected.innerText)
    }
})

let deleteBtn = document.getElementById('deleteFileBtn');
deleteBtn.addEventListener('click', () => {
    if (selected.innerText != null) {
        remover(selected.innerText)
    }
})

let moveBtn = document.getElementById('moveFileBtn');
moveBtn.addEventListener('click', () => {
    if (selected.innerText != null) {
        moveFile(selected.innerText)
    }
})

let copyBtn = document.getElementById('copyFileBtn');
copyBtn.addEventListener('click', () => {
    if (selected.innerText != null) {
        copyFile(selected.innerText)
    }
})

/************************/
/*   Global Variables   */
/************************/

// sets starting directory and assigns to global varaible
process.chdir('/')
//process.chdir('C:/Users/runin/Documents/TestDir') // for testing
let CurrentDirectory = process.cwd();
//gets sub-directories
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
let hasContentChanged = false;


/***************************/
/*    Directory methods    */
/***************************/


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
    } else if (direction == 'selected') {
        process.chdir(folder)
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
        //console.log(currSubDir);
        hasChangedDir = true;
    })

    hasChangedDir = true;
}

// creates alert with formatted file info
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
        hasContentChanged = true;
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
        hasContentChanged = true;
        alert('New File created!')
    }
    catch (err) {
        console.error(err)
    }
}

// creates new folder at cwd
async function newFolder(folderName) {
    try {
        let filePath = path.join(CurrentDirectory, folderName);
        await fs.mkdir(filePath);
        hasContentChanged = true;
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
            hasContentChanged = true;
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

function selectDirectory() {
    const options = {
        title: "Select New Directory",
        defaultPath: CurrentDirectory,
        buttonLabel: "Select Directory",
        properties: ["openDirectory"]
    }

    dialog.showOpenDialog(win, options, (dest) => {
        try {
            changeDirectory('selected', dest[0])
        } catch (err) {
            console.error(err)
        }
    })
}

/***********************/
/*  Utility Functions  */
/***********************/

// formats file size
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// sets selected file/folder to null and disables buttons
setInterval(function () {
    selected.innerText = null;
    deleteBtn.disabled = true;
    openBtn.disabled = true;
    copyBtn.disabled = true;
    moveBtn.disabled = true;
    infoBtn.disabled = true;
}, 4000);

// enables buttons
function enableButtons(goesUp) {
    if (!goesUp) {
        deleteBtn.disabled = false;
    }
    copyBtn.disabled = false;
    moveBtn.disabled = false;
    infoBtn.disabled = false;
    openBtn.disabled = false;
}