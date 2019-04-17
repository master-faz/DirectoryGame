const fs = require('fs-extra');
const path = require('path');
const { shell, remote, BrowserWindow } = require("electron");
const { dialog } = require('electron').remote

const root = fs.readdirSync('C:\\TestDir')



function getCurrentFilePath(currentPath, filename){
    if (filename = null){
        return currentPath;
    }
    
    let path = path.join(currentPath, filename)

    return path
}

// gets information on file
async function getFileInfo(filePath){
    try {
        let stats = await fs.stat(filePath);

        let size = stats.size;
        let creationTime = stats.birthtime;
        let modTime = stats.mtime;
        let absolutePath;
    } catch (error) {
        console.error(err)
    }
    
}

// deletes file or directory
async function remover(path){
    var typecheck = fs.stat(path);
    var type;
    if(typecheck.isFile()){
        type = 1;
    }else if(typecheck.isDirectory()){
        type = 0;
    }else{
        console.log('Invalid Type. Can\'t Remove')
        return
    }

    try {
        await fs.remove(path);
        if(type = 1){
            console.log('File Removed!')
        }else if(type = 0){
            console.log('Folder Removed!')
        }
        
    } catch (err) {
        console.error(err)
    }
}

// moves file from one directory to another
async function moveFile (src, dest) {
    const options = {
        title: "Select New Directory",
        buttonLabel : "Select Directory",
        properties : "openDirectory"
    }

    dialog.showOpenDialog(BrowserWindow, options, async (dstpath) => {
        try {
            await fs.move(srcpath, dstpath)
            console.log('File moved to ' + dstpath  + '!')
          } catch (err) {
            console.error(err)
          }
    })
    
}

// creates new empty file at cwd
async function newFile (fileName) {
    try {
        await fs.writeFile(fileName, "");
        console.log('New File created!')
    } catch (err) {
        console.error(err)
    }
}

// creates new folder at cwd
async function newFolder (folderName) {
    try {
        let path = path.join(currentPath, folderName)
        await fs.mkdir(path)
        console.log('New Folder created!')
    } catch (err) {
        console.error(err)
    }
}

// copies file to specified directory
async function copyFile(scr, dest) {
    const options = {
        title: "Select New Directory",
        buttonLabel : "Select Directory",
        properties : "openDirectory"
    }

    dialog.showOpenDialog(options, async (dest) => {
        try {
            await fs.copy(scr, dest)
            console.log('File Copied to ' + dest + '!')
        } catch (err) {
            console.error(err)
        }
    })
}

// opens file
async function openFile(path) {
    try {
        shell.openItem(path)
    } catch (err) {
        console.error(err)
    }
}