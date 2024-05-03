let state = {
  gameType: 'gba',
  orientation: 'portrait',
  type: 'e2e',
}


//Constants
let gbaSkin, snesSkin, gbcSkin, ndsSkin;
const gameTypes = ['gba', 'snes', 'gbc', 'ds'];
const screenInputs = { gba: [240, 160], snes: [256, 224], gbcSkin: [160, 144], ds: [256, 192], ds2: [256, 192], nes: [256, 250], snes: [256, 224] }


let backgroundColor = "navy";
let skinNameTextBox = document.querySelector("#skinName");
let skinIDTextBox = document.querySelector("#skinID");
/**@type HTMLSelectElement */
let gameTypeChoice = document.querySelector("#gameTypeChoice");
let chkStdPortrait = document.querySelector("#chkStdPortrait");
let chkEtePortrait = document.querySelector("#chkEtePortrait");
let chkStdLandscape = document.querySelector("#chkStdLandscape");
let chkEteLandscape = document.querySelector("#chkEteLandscape");
/**@type HTMLSelectElement */
let canvasSelection = document.querySelector("#canvasToShow");
let phoneCanvas = document.querySelector("#phoneCanvas");
let screen1Div = document.querySelector("#screen1");
let screen1Box = document.querySelector("#screen1Box");
let screen2Div = document.querySelector("#screen2");
let screen2Box = document.querySelector("#screen2Box");
let mainAreaDiv = document.querySelector("#mainArea");
let controlArea = document.querySelector("#controlMapping");
let buttonBox = document.querySelector("#buttonBox");
let downloadPDFButton = document.querySelector("#downloadButton");
let downloadJSONButton = document.querySelector("#downloadJSON");
let downloadSkinButton = document.querySelector("#downloadSkin");
let bgColorInput = document.querySelector("#bgColor");
/* set up listeners */

skinIDTextBox.addEventListener("change", updateSkinObject);
skinNameTextBox.addEventListener("change", updateSkinObject);
gameTypeChoice.addEventListener("change", updateSkinObject);
canvasSelection.addEventListener("change", updateSkinObject);
controlArea.addEventListener("dragover", allowDrop);
buttonBox.addEventListener("dragover", allowDrop);
controlArea.addEventListener("drop", dropInControlArea);
buttonBox.addEventListener("drop", dropInButtonBox);
downloadPDFButton.addEventListener("click", downloadPDF);
downloadJSONButton.addEventListener("click", downloadJSON);
bgColorInput.addEventListener("change", changeBGColor);
downloadSkinButton.addEventListener("click", downloadSkin);

document.querySelectorAll(".buttonBorder").forEach(
  (el) => {
    el.setAttribute("draggable", "true");
    el.addEventListener("mousedown", selectButton);
    el.addEventListener("dragstart", startButtonDrag);
  });

document.querySelectorAll(".button").forEach(
  (el) => {
    el.setAttribute("draggable", "false");
  });

document.querySelectorAll(".corner").forEach((el) => {
  el.setAttribute("draggable", "true");
  el.addEventListener("dragstart", startResizeButton);
  el.addEventListener("drag", doResizeButton);
  el.addEventListener("dragend", endResize);
});

let resizeData = {};

function selectButton(ev) {
  let el = ev.target;
  while (!el.classList.contains("buttonBorder")) {
    el = el.parentNode;
  }
  document.querySelectorAll(".buttonBorder").forEach(
    (btn) => btn.classList.remove("selected"));
  if (el.parentNode === buttonBox) return;
  el.classList.add("selected");
}
function startResizeButton(/** @type DragEvent */ev) {
  if (!ev.target.parentNode.classList.contains("buttonBorder")) return;
  ev.stopPropagation();
  console.log("drag starts");
  let currentX = ev.offsetX;
  let currentY = ev.offsetY;
  let t = ev.target;
  while (t != phoneCanvas) {
    currentX += t.offsetLeft;
    currentY += t.offsetTop;
    t = t.parentNode;
  }
  resizeData.startx = currentX;
  resizeData.starty = currentY;
  resizeData.originalheight = ev.target.parentNode.clientHeight;
  resizeData.originalwidth = ev.target.parentNode.clientWidth;
  resizeData.originalTop = ev.target.parentNode.offsetTop;
  resizeData.originalLeft = ev.target.parentNode.offsetLeft;
  ev.dataTransfer.setDragImage(new Image(0, 0), 0, 0);


}

function doResizeButton(/** @type DragEvent */ev) {
  ev.preventDefault();
  let button = ev.target.parentNode;
  if (!button || !(button.classList.contains("buttonBorder") || button.classList.contains("screenBox"))) {
    resizeData = {}; return;
  }
  let maintainAR = ev.ctrlKey || button.classList.contains("screenBox");
  if (resizeData.startx === undefined) return;
  let oldHeight = resizeData.originalheight;
  let oldWidth = resizeData.originalwidth;
  let originalTop = resizeData.originalTop;
  let originalLeft = resizeData.originalLeft;
  if (ev.offsetX < -50 || ev.offsetX > 50 || ev.offsetY < -50 || ev.offsetY > 50) return;
  let currentX = ev.offsetX;
  let currentY = ev.offsetY;
  let t = ev.target;
  while (t != phoneCanvas) {
    currentX += t.offsetLeft;
    currentY += t.offsetTop;
    t = t.parentNode;
  }
  if (currentX < 0) currentX = 0;
  if (currentY < 0) currentY = 0;
  if (currentY > controlArea.clientHeight) currentY = controlArea.clientHeight;
  if (currentX > controlArea.clientWidth) currentX = controlArea.clientWidth;
  console.log(currentX);
  let ar;
  if (button.classList.contains("screenBox")) {
    //get ar from official values
    ar = screenInputs[state.gameType][1] / screenInputs[state.gameType][0];
  } else {
    ar = oldHeight / oldWidth;
  }

  let newHeight, newWidth, newTop, newLeft;
  if (ev.target.classList.contains("upperLeftCorner")) {
    newHeight = originalTop + oldHeight - currentY;
    newWidth = originalLeft + oldWidth - currentX;
    if (newHeight < 10) newHeight = 10;
    if (newWidth < 10) newWidth = 10;
    if (maintainAR) {
      if (newHeight > newWidth * ar) {
        newHeight = newWidth * ar;
      } else {
        newWidth = newHeight / ar;
      }
    }
    newLeft = originalLeft + oldWidth - newWidth;
    newTop = originalTop + oldHeight - newHeight;

  } else if (ev.target.classList.contains("upperRightCorner")) {
    newHeight = originalTop + oldHeight - currentY;
    newWidth = currentX - originalLeft;
    if (newHeight < 10) newHeight = 10;
    if (newWidth < 10) newWidth = 10
    if (maintainAR) {
      if (newHeight > newWidth * ar) {
        newHeight = newWidth * ar;
      } else {
        newWidth = newHeight / ar;
      }
    }
    newLeft = originalLeft;
    newTop = originalTop + oldHeight - newHeight;
  } else if (ev.target.classList.contains("lowerLeftCorner")) {
    newHeight = currentY - originalTop;
    if (newHeight < 10) newHeight = 10;
    if (newWidth < 10) newWidth = 10;
    newWidth = originalLeft + oldWidth - currentX;
    if (maintainAR) {
      if (newHeight > newWidth * ar) {
        newHeight = newWidth * ar;
      } else {
        newWidth = newHeight / ar;
      }
    }
    newTop = originalTop;
    newLeft = originalLeft + oldWidth - newWidth;
  } else {
    newHeight = currentY - originalTop;
    newWidth = currentX - originalLeft;
    if (newHeight < 10) newHeight = 10;
    if (newWidth < 10) newWidth = 10;
    if (maintainAR) {
      if (newHeight > newWidth * ar) {
        newHeight = newWidth * ar;
      } else {
        newWidth = newHeight / ar;
      }
    }
    newTop = originalTop;
    newLeft = originalLeft;
  }
  if (newLeft < 0) newLeft = 0;
  if (newTop < 0) newTop = 0;
  console.log(newLeft, newTop, newWidth, newHeight);

  button.style.height = newHeight + "px";
  button.style.width = newWidth + "px";
  button.style.top = newTop + "px";
  button.style.left = newLeft + "px";
}
function endResize(ev) {
  let button = ev.target.parentNode;
  resizeData = {};
  if (!button || !(button.classList.contains("buttonBorder") || button.classList.contains("screenBox"))) {
    return;
  }
  editSkinButton(button);
}

async function downloadSkin(ev) {
  let pdfs = [];
  let pdfNames = [];
  let thumbPDF = await createThumbPDF();
  let ourOption = canvasSelection.selectedOptions[0];
  // change to each choice one at a time
  for (let option of canvasSelection.options) {
    option.selected = true;
    updateSkinObject();
    let pdf = await createPDF(phoneCanvas);
    pdfs.push(pdf);
    pdfNames.push(currentRep.assets.resizable);
  }
  var zip = new JSZip();
  zip.file("thumbstick.pdf",thumbPDF.output("blob"));
  for (let i = 0; i < pdfs.length; i++) {
    zip.file(pdfNames[i], pdfs[i].output("blob"));
  }
  zip.file("info.json", createJSONBlob());
  zip.generateAsync({ type: "blob" })
    .then(function (content) {
      // see FileSaver.js
      saveAs(content, skinObject.name + ".deltaskin");
    });

  ourOption.selected = true;
  updateSkinObject();
}

async function downloadPDF(ev) {
  let currentPDF = await createPDF(phoneCanvas);
  let name = currentRep.assets.resizable;
  currentPDF.save(name);
}

function downloadJSON(ev) {
  saveAs(createJSONBlob(), "info.json");
}

function createJSONBlob() {
  let json = JSON.stringify(skinObject);
  let blob = new Blob([json], { type: "text/plan;charset=utf-8" });
  return blob;
}

function changeBGColor(ev) {
  let newColor = bgColorInput.value;
  if (CSS.supports("color", newColor)) {
    backgroundColor = newColor;
    bgColorInput.style.color = "";
  } else {
    bgColorInput.style.color = "darkred";
  }
  rebuildBG();
}

/** parses the skin and updates the canvas to fit */
function updateCanvas() {

  //update skin name
  skinNameTextBox.value = skinObject.name;
  //update skin ID
  skinIDTextBox.value = skinObject.identifier;
  //update  game type
  let gtype = skinObject.gameTypeIdentifier.split(".");
  gtype = gtype[gtype.length - 1];
  state.gameType = gtype;
  screen1Box.classList.remove(gameTypes);
  screen2Box.classList.remove(gameTypes);
  screen1Box.classList.add(gtype);
  screen2Box.classList.add(gtype);

  //screen
  if (currentRep.screens) {
    let w = currentRep.screens[0].outputFrame.width;
    let h = currentRep.screens[0].outputFrame.height;
    let l = currentRep.screens[0].outputFrame.x;
    let t = currentRep.screens[0].outputFrame.y;
    screen1Box.style.width = w + "px";
    screen1Box.style.height = h + "px";
    screen1Box.style.left = l + "px";
    screen1Box.style.top = t + "px";
    if (currentRep.screens.length > 1) {
      let w = currentRep.screens[1].outputFrame.width;
      let h = currentRep.screens[1].outputFrame.height;
      let l = currentRep.screens[1].outputFrame.x;
      let t = currentRep.screens[1].outputFrame.y;
      screen2Box.style.width = w + "px";
      screen2Box.style.height = h + "px";
      screen2Box.style.left = l + "px";
      screen2Box.style.top = t + "px";
    }else{
      screen2Box.style.width=0;
      screen2Box.style.height=0;
    }

  }

  let ourOption = gameTypeChoice.options.namedItem(gtype);
  ourOption.selected = true;
  // read the currentRep and put the buttons in the right place
  /** @type HTMLDivElement */
  let img;

  document.querySelectorAll(".buttonBorder").forEach((e) => {
    if (e.classList.contains("screenBox")) return;
    let nw = e.clientWidth;
    if (nw < 40) nw = 40; else if (nw > 120) nw = 120;


    e.style.height = "";
    e.style.width = nw + "px";
    buttonBox.appendChild(e)
  });
  for (let button of currentRep.items) {
    if (button.thumbstick) {
      //thumbstick
      img = document.querySelector("#stick");
    } else if (button.inputs["up"]) {
      //dpad
      img = document.querySelector("#dpad");
    } else if (button.inputs) {
      img = document.querySelector("#" + button.inputs[0] + "Button");

    }
    if (img) {
      img = img.parentElement;
      controlArea.appendChild(img);
      img.style.width = button.frame.width + "px";
      img.style.height = "" + button.frame.height + "px";
      img.style.top = (button.frame.y) + "px";
      img.style.left = (button.frame.x) + "px";
    }
  }
  rebuildBG();
}





/** updates the skin object to fit whatever is input */
function updateSkinObject(ev) {
  let g = gameTypeChoice.selectedOptions.item(0).id;
  if (ev && ev.target === gameTypeChoice) {


    if (g === "ds") {
      skinObject = ndsSkin;
    } else if (g === "gba") {
      skinObject = gbaSkin;
    } else if (g === "snes") {
      skinObject = snesSkin;
    } else if (g === "gbc") {
      skinObject = gbcSkin;
    }
    skinNameTextBox.value = skinObject.name;
    skinIDTextBox.value = skinObject.identifier;
  }

  //name
  skinObject.name = skinNameTextBox.value;
  //id
  skinObject.identifier = skinIDTextBox.value;
  //game type
  skinObject.gameTypeIdentifier = "com.rileytestut.delta.game." + g;
  // canvas type
  let ctype = canvasSelection.selectedOptions.item(0).id;
  if (ctype === "eteLandscape") {
    mainAreaDiv.classList.remove("portrait");
    mainAreaDiv.classList.add("landscape");
    currentRep = skinObject.representations.iphone.edgeToEdge.landscape;
  } else if (ctype == "etePortrait") {
    mainAreaDiv.classList.remove("landscape");
    mainAreaDiv.classList.add("portrait");
    currentRep = skinObject.representations.iphone.edgeToEdge.portrait;
  } else if (ctype === "stdLandscape") {
    mainAreaDiv.classList.remove("portrait");
    mainAreaDiv.classList.add("landscape");
    currentRep = skinObject.representations.iphone.standard.landscape;
  } else if (ctype == "stdPortrait") {
    mainAreaDiv.classList.remove("landscape");
    mainAreaDiv.classList.add("portrait");
    currentRep = skinObject.representations.iphone.standard.portrait;
  }
  let phoneBorder = phoneCanvas.parentNode;
  phoneBorder.classList.remove('stdLandscape');
  phoneBorder.classList.remove('stdPortrait');
  phoneBorder.classList.remove('eteLandscape');
  phoneBorder.classList.remove('etePortrait');
  phoneBorder.classList.add(ctype);

  updateCanvas();
}


function allowDrop(ev) {
  ev.preventDefault();
}

function startButtonDrag(/** @type DragEvent */ ev) {
  ev.dataTransfer.setData("sourceID", ev.target.id);
  ev.dataTransfer.setData("offsetX", ev.offsetX);
  ev.dataTransfer.setData("offsetY", ev.offsetY);
}

/** enables moving to and within the control area */
function dropInControlArea(/**@type DragEvent*/ ev) {

  ev.preventDefault();
  ev.stopPropagation();
  let sourceID = ev.dataTransfer.getData("sourceID");
  if (!sourceID) return;
  let ox = Number(ev.dataTransfer.getData("offsetX"));
  let oy = Number(ev.dataTransfer.getData("offsetY"));
  let button = document.querySelector("#" + sourceID);
  if (!button || !button.classList.contains("buttonBorder")) return;
  // if coming from elsewhere, move it to the controlbox
  if (button.parentNode != controlArea) {
    controlArea.append(button);
  }
  let newx = Number(ev.offsetX);
  let newy = Number(ev.offsetY);
  let el = ev.target;
  while (el != controlArea) {
    newx += el.offsetLeft;
    newy += el.offsetTop;
    el = el.parentNode;
  }
  let newTop = (newy - oy);
  let newLeft = (newx - ox);
  if (newTop <= -button.offsetHeight + 5) newTop = -button.offsetHeight + 5;
  if (newTop >= controlArea.offsetHeight - 5) newTop = controlArea.offsetHeight - 5;
  if (newLeft <= -button.offsetWidth + 5) newLeft = -button.offsetWidth + 5;
  if (newLeft >= controlArea.offsetWidth - 5) newLeft = controlArea.offsetWidth - 5;
  button.style.top = newTop + "px";
  button.style.left = newLeft + "px";

  editSkinButton(button);
  updateCanvas();
}

function dropInButtonBox(/**@type DrageVent */ ev) {
  ev.preventDefault();
  ev.stopPropagation();
  let sourceID = ev.dataTransfer.getData("sourceID");
  let button = document.querySelector("#" + sourceID);
  if (button.classList.contains("screenBox")) return;
  if (button.parentNode !== buttonBox) buttonBox.appendChild(button);
  button.style.position = "";
  button.style.top = "";
  button.style.left = "";
  button.classList.remove("selected");
  editSkinButton(button);
  updateCanvas();
}

/** When a button moves, call this to update the skin to match */
function editSkinButton(button) {
  if (button.classList.contains("screenBox")) {
    editScreen(button);
    return;
  }
  let itemIndex = 0;
  for (itemIndex = 0; itemIndex < currentRep.items.length; itemIndex++) {
    let item = currentRep.items[itemIndex];
    if (button.id === "dpadbox" && !item.thumbstick && item.inputs.up) {
      break;
    } else if (button.id === "stickbox" && item.thumbstick) {
      break;
    } else if (item.inputs.length === 1 && button.id.substring(0, button.id.length - 3) == item.inputs[0]) {
      break;
    }
  }
  let item;
  if (itemIndex < currentRep.items.length) {
    item = currentRep.items[itemIndex];
  } else {
    item = {}
    currentRep.items.push(item);
  }
  if (button.parentElement !== controlArea && itemIndex < currentRep.items.length) {
    //oops, removed a button from the control area, delete it!
    currentRep.items.splice(itemIndex, 1);
  }

  if (button.parentElement === controlArea) {
    let gtype = state.gameType;

    item.frame = {};
    item.frame.x = button.offsetLeft;
    item.frame.y = button.offsetTop;
    item.frame.width = button.clientWidth;
    item.frame.height = button.clientHeight;
    if (button.id === "dpadbox") {
      item.extendedEdges = { top: 15, bottom: 15, left: 15, right: 15 }
      item.inputs = { up: "up", down: "down", left: "left", right: "right" }
    } else if (button.id === "stickbox") {
      item.thumbstick = {};
      item.thumbstick.width = button.clientWidth * 0.75;
      item.thumbstick.height = button.clientHeight * 0.75;
      item.thumbstick.name = "thumbstick.pdf";
      item.extendedEdges = { top: 20, bottom: 20, left: 20, right: 20 }
      item.inputs = { up: "up", down: "down", left: "left", right: "right" }
    } else {
      item.extendedEdges = { top: 5, bottom: 5, left: 5, right: 5 }
      item.inputs = [button.id.substring(0, button.id.length - 3)];
    }
  }

}

function editScreen(screenBox) {
  let screens = currentRep.screens;
  let gtype = state.gameType;
  if (!screens) {
    if (state.gameType === 'ds') {
      screens = [{ inputFrame: {}, outputFrame: {} }, { inputFrame: {}, outputFrame: {} }];
      currentRep.screens = screens;
    } else {
      screens = [{ inputFrame: {}, outputFrame: {} }];
      currentRep.screens = screens;
    }
  }
  let screen = screens[0];
  if (screenBox.id == "screen2Box" && gtype === "ds") {
    gtype = "ds2";
    screen = screens[1];
  }
  screen.inputFrame.x = 0;
  screen.inputFrame.y = 0;
  screen.inputFrame.width = screenInputs[gtype][0];
  screen.inputFrame.height = screenInputs[gtype][1];

  screen.outputFrame.height = screenBox.clientHeight;
  screen.outputFrame.width = screenBox.clientWidth;
  screen.outputFrame.x = screenBox.offsetLeft;
  screen.outputFrame.y = screenBox.offsetTop;
  rebuildBG();
}
async function createThumbPDF() {
  let img = new Image();
  img.src="media/innerstick.png";
  let doc = new jsPDF({orientation:"p",unit:"px",format:[250,250]});

  doc.addImage(img,'png',0,0,doc.internal.pageSize.width,doc.internal.pageSize.height);
  return doc;
}
async function createPDF(area) {
  let canvas;
  area.classList.add("print");
  canvas = await html2canvas(area, { scale: 3, backgroundColor: null });
  area.classList.remove("print");


  var imgData = canvas.toDataURL('img/png');
  let or = canvas.width > canvas.height ? "l" : "p";
  var doc = new jsPDF({ orientation: or, unit: "px", format: [canvas.width, canvas.height] });
  doc.addImage(imgData, 'PNG', 0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height);
  return doc;
}

function rebuildBG() {
  /** @type HTMLCanvasElement */
  let c = document.getElementById("bg");
  c.width = phoneCanvas.clientWidth;
  c.height = phoneCanvas.clientHeight;
  c.style.width = phoneCanvas.clientWidth + "px";
  c.style.height = phoneCanvas.clientHeith + "px";
  let ctx = c.getContext("2d");

  ctx.fillStyle = "#000";
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, c.width, c.height)
  ctx.clearRect(screen1Box.offsetLeft, screen1Box.offsetTop, screen1Box.offsetWidth, screen1Box.offsetHeight);
  if (screen2Box.offsetWidth > 0) {
    ctx.clearRect(screen2Box.offsetLeft, screen2Box.offsetTop, screen2Box.offsetWidth, screen2Box.offsetHeight)
  }
}



/** Default Skin Object */

gbaSkin = {
  "name": "GBA Sample",
  "identifier": "com.novamaker.sample.gba.black",
  "gameTypeIdentifier": "com.rileytestut.delta.game.gba",
  "debug": false,
  "representations": {
    "iphone": {
      "standard": {
        "portrait": {
          "assets": {
            "resizable": "iphone-portrait.pdf"
          },
          "items": [
            {
              "inputs": {
                "up": "up",
                "down": "down",
                "left": "left",
                "right": "right"
              },
              "frame": {
                "x": 11,
                "y": 464,
                "width": 164,
                "height": 164
              },
              "extendedEdges": {
                "top": 15,
                "bottom": 15,
                "left": 15,
                "right": 15
              }
            },
            {
              "inputs": [
                "a"
              ],
              "frame": {
                "x": 312,
                "y": 478,
                "width": 75,
                "height": 75
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "b"
              ],
              "frame": {
                "x": 235,
                "y": 547,
                "width": 75,
                "height": 75
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "l"
              ],
              "frame": {
                "x": -1,
                "y": 384,
                "width": 94,
                "height": 58
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "r"
              ],
              "frame": {
                "x": 320,
                "y": 387,
                "width": 94,
                "height": 58
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "start"
              ],
              "frame": {
                "x": 220,
                "y": 392,
                "width": 36,
                "height": 36
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "select"
              ],
              "frame": {
                "x": 146,
                "y": 394,
                "width": 36,
                "height": 36
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "menu"
              ],
              "frame": {
                "x": 15,
                "y": 680,
                "width": 33,
                "height": 33
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "toggleFastForward"
              ],
              "frame": {
                "x": 365,
                "y": 683,
                "width": 33,
                "height": 33
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "frame": {
                "x": 123,
                "y": 677,
                "width": 40,
                "height": 44
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              },
              "inputs": [
                "quickSave"
              ]
            },
            {
              "frame": {
                "x": 247,
                "y": 677,
                "width": 40,
                "height": 44
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              },
              "inputs": [
                "quickLoad"
              ]
            }
          ],
          "mappingSize": {
            "width": 414,
            "height": 736
          },
          "screens": [
            {
              "inputFrame": {
                "x": 0,
                "y": 0,
                "width": 240,
                "height": 160
              },
              "outputFrame": {
                "x": 27,
                "y": 93,
                "width": 360,
                "height": 240
              }
            }
          ],
          "extendedEdges": {
            "top": 10,
            "bottom": 10,
            "left": 10,
            "right": 10
          }
        },
        "landscape": {
          "assets": {
            "resizable": "iphone-landscape.pdf"
          },
          "items": [
            {
                "inputs": {
                    "up": "up",
                    "down": "down",
                    "left": "left",
                    "right": "right"
                },
                "frame": {
                    "x": -1,
                    "y": 115,
                    "width": 194,
                    "height": 187
                },
                "extendedEdges": {
                    "top": 15,
                    "bottom": 15,
                    "left": 15,
                    "right": 15
                }
            },
            {
                "inputs": [
                    "a"
                ],
                "frame": {
                    "x": 649,
                    "y": 123,
                    "width": 78,
                    "height": 78
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "b"
                ],
                "frame": {
                    "x": 580,
                    "y": 192,
                    "width": 78,
                    "height": 78
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "l"
                ],
                "frame": {
                    "x": 6,
                    "y": 0,
                    "width": 122,
                    "height": 73
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "r"
                ],
                "frame": {
                    "x": 614,
                    "y": -2,
                    "width": 118,
                    "height": 71
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "start"
                ],
                "frame": {
                    "x": 608,
                    "y": 354,
                    "width": 49,
                    "height": 49
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "select"
                ],
                "frame": {
                    "x": 74,
                    "y": 354,
                    "width": 48,
                    "height": 50
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "menu"
                ],
                "frame": {
                    "x": 252,
                    "y": 5,
                    "width": 39,
                    "height": 39
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "toggleFastForward"
                ],
                "frame": {
                    "x": 429,
                    "y": 4,
                    "width": 43,
                    "height": 43
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "frame": {
                    "x": 241,
                    "y": 365,
                    "width": 40,
                    "height": 44
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                },
                "inputs": [
                    "quickSave"
                ]
            },
            {
                "frame": {
                    "x": 445,
                    "y": 365,
                    "width": 40,
                    "height": 44
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                },
                "inputs": [
                    "quickLoad"
                ]
            }
        ],
          "mappingSize": {
            "width": 736,
            "height": 414
          },
          "extendedEdges": {
            "top": 12,
            "bottom": 12,
            "left": 12,
            "right": 12
          },
          "screens": [
            {
              "inputFrame": {
                "x": 0,
                "y": 0,
                "width": 240,
                "height": 160
              },
              "outputFrame": {
                "x": 128,
                "y": 47,
                "width": 480,
                "height": 320
              }
            }
          ],
          "extendedEdges": {
            "top": 10,
            "bottom": 10,
            "left": 10,
            "right": 10
          },
          "translucent": true
        }
      },
      "edgeToEdge": {
        "portrait": {
          "assets": {
            "resizable": "iphone-e2e-portrait.pdf"
          },
          "items": [
            {
              "inputs": {
                "up": "up",
                "down": "down",
                "left": "left",
                "right": "right"
              },
              "frame": {
                "x": 7,
                "y": 567,
                "width": 164,
                "height": 164
              },
              "extendedEdges": {
                "top": 15,
                "bottom": 15,
                "left": 15,
                "right": 15
              }
            },
            {
              "inputs": [
                "a"
              ],
              "frame": {
                "x": 316,
                "y": 570,
                "width": 75,
                "height": 75
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "b"
              ],
              "frame": {
                "x": 235,
                "y": 648,
                "width": 75,
                "height": 75
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "l"
              ],
              "frame": {
                "x": 0,
                "y": 458,
                "width": 94,
                "height": 58
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "r"
              ],
              "frame": {
                "x": 317,
                "y": 461,
                "width": 94,
                "height": 58
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "start"
              ],
              "frame": {
                "x": 220,
                "y": 469,
                "width": 40,
                "height": 40
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "select"
              ],
              "frame": {
                "x": 148,
                "y": 470,
                "width": 40,
                "height": 40
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "menu"
              ],
              "frame": {
                "x": 22,
                "y": 820,
                "width": 32,
                "height": 32
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "toggleFastForward"
              ],
              "frame": {
                "x": 344,
                "y": 815,
                "width": 39,
                "height": 39
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "frame": {
                "x": 133,
                "y": 814,
                "width": 40,
                "height": 44
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              },
              "inputs": [
                "quickSave"
              ]
            },
            {
              "frame": {
                "x": 239,
                "y": 814,
                "width": 40,
                "height": 44
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              },
              "inputs": [
                "quickLoad"
              ]
            }
          ],
          "mappingSize": {
            "width": 414,
            "height": 896
          },
          "screens": [
            {
              "inputFrame": {
                "x": 0,
                "y": 0,
                "width": 240,
                "height": 160
              },
              "outputFrame": {
                "x": 27,
                "y": 93,
                "width": 360,
                "height": 240
              }
            }
          ],
          "extendedEdges": {
            "top": 10,
            "bottom": 10,
            "left": 10,
            "right": 10
          }
        },
        "landscape": {
          "assets": {
            "resizable": "iphone-e2e-landscape.pdf"
          },
          "items": [
            {
              "inputs": {
                "up": "up",
                "down": "down",
                "left": "left",
                "right": "right"
              },
              "frame": {
                "x": 15,
                "y": 111,
                "width": 172,
                "height": 172
              },
              "extendedEdges": {
                "top": 15,
                "bottom": 15,
                "left": 15,
                "right": 15
              }
            },
            {
              "inputs": [
                "a"
              ],
              "frame": {
                "x": 781,
                "y": 112,
                "width": 78,
                "height": 78
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "b"
              ],
              "frame": {
                "x": 705,
                "y": 184,
                "width": 78,
                "height": 78
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "l"
              ],
              "frame": {
                "x": 7,
                "y": 5,
                "width": 131,
                "height": 81
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "r"
              ],
              "frame": {
                "x": 752,
                "y": 2,
                "width": 131,
                "height": 81
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "start"
              ],
              "frame": {
                "x": 695,
                "y": 341,
                "width": 54,
                "height": 54
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "select"
              ],
              "frame": {
                "x": 140,
                "y": 345,
                "width": 51,
                "height": 51
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "menu"
              ],
              "frame": {
                "x": 353,
                "y": 3,
                "width": 37,
                "height": 37
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "toggleFastForward"
              ],
              "frame": {
                "x": 484,
                "y": 2,
                "width": 44,
                "height": 42
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "frame": {
                "x": 347,
                "y": 366,
                "width": 41,
                "height": 41
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              },
              "inputs": [
                "quickSave"
              ]
            },
            {
              "frame": {
                "x": 495,
                "y": 366,
                "width": 40,
                "height": 44
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              },
              "inputs": [
                "quickLoad"
              ]
            }
          ], "screens": [
            {
              "inputFrame": {
                "x": 0,
                "y": 0,
                "width": 240,
                "height": 160
              },
              "outputFrame": {
                "x": 208,
                "y": 47,
                "width": 480,
                "height": 320
              }
            }
          ],
          "mappingSize": {
            "width": 896,
            "height": 414
          },
          "extendedEdges": {
            "top": 12,
            "bottom": 12,
            "left": 12,
            "right": 12
          },
          "translucent": true
        }
      }
    }
  }
}

gbcSkin = {
  "name": "GBC Sample",
  "identifier": "com.novamaker.sample.gbc.navy",
  "gameTypeIdentifier": "com.rileytestut.delta.game.gbc",
  "debug": false,
  "representations": {
    "iphone": {
      "standard": {
        "portrait": {
          "assets": {
            "resizable": "iphone-portrait.pdf"
          },
          "items": [
            {
              "inputs": {
                "up": "up",
                "down": "down",
                "left": "left",
                "right": "right"
              },
              "frame": {
                "x": 11,
                "y": 464,
                "width": 164,
                "height": 164
              },
              "extendedEdges": {
                "top": 15,
                "bottom": 15,
                "left": 15,
                "right": 15
              }
            },
            {
              "inputs": [
                "a"
              ],
              "frame": {
                "x": 312,
                "y": 478,
                "width": 75,
                "height": 75
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "b"
              ],
              "frame": {
                "x": 235,
                "y": 547,
                "width": 75,
                "height": 75
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "l"
              ],
              "frame": {
                "x": -1,
                "y": 384,
                "width": 94,
                "height": 58
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "r"
              ],
              "frame": {
                "x": 320,
                "y": 387,
                "width": 94,
                "height": 58
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "start"
              ],
              "frame": {
                "x": 220,
                "y": 392,
                "width": 36,
                "height": 36
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "select"
              ],
              "frame": {
                "x": 146,
                "y": 394,
                "width": 36,
                "height": 36
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "menu"
              ],
              "frame": {
                "x": 15,
                "y": 680,
                "width": 33,
                "height": 33
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "toggleFastForward"
              ],
              "frame": {
                "x": 365,
                "y": 683,
                "width": 33,
                "height": 33
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "frame": {
                "x": 123,
                "y": 677,
                "width": 40,
                "height": 44
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              },
              "inputs": [
                "quickSave"
              ]
            },
            {
              "frame": {
                "x": 247,
                "y": 677,
                "width": 40,
                "height": 44
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              },
              "inputs": [
                "quickLoad"
              ]
            }
          ],
          "mappingSize": {
            "width": 414,
            "height": 736
          },
          "screens": [
            {
              "inputFrame": {
                "x": 0,
                "y": 0,
                "width": 160,
                "height": 144
              },
              "outputFrame": {
                "x": 7,
                "y": 20,
                "width": 400,
                "height": 360
              }
            }
          ],
          "extendedEdges": {
            "top": 10,
            "bottom": 10,
            "left": 10,
            "right": 10
          }
        },
        "landscape": {
          "assets": {
            "resizable": "iphone-landscape.pdf"
          },
          "items": [
            {
                "inputs": {
                    "up": "up",
                    "down": "down",
                    "left": "left",
                    "right": "right"
                },
                "frame": {
                    "x": -1,
                    "y": 115,
                    "width": 194,
                    "height": 187
                },
                "extendedEdges": {
                    "top": 15,
                    "bottom": 15,
                    "left": 15,
                    "right": 15
                }
            },
            {
                "inputs": [
                    "a"
                ],
                "frame": {
                    "x": 649,
                    "y": 123,
                    "width": 78,
                    "height": 78
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "b"
                ],
                "frame": {
                    "x": 580,
                    "y": 192,
                    "width": 78,
                    "height": 78
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "l"
                ],
                "frame": {
                    "x": 6,
                    "y": 0,
                    "width": 122,
                    "height": 73
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "r"
                ],
                "frame": {
                    "x": 614,
                    "y": -2,
                    "width": 118,
                    "height": 71
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "start"
                ],
                "frame": {
                    "x": 608,
                    "y": 354,
                    "width": 49,
                    "height": 49
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "select"
                ],
                "frame": {
                    "x": 74,
                    "y": 354,
                    "width": 48,
                    "height": 50
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "menu"
                ],
                "frame": {
                    "x": 252,
                    "y": 5,
                    "width": 39,
                    "height": 39
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "toggleFastForward"
                ],
                "frame": {
                    "x": 429,
                    "y": 4,
                    "width": 43,
                    "height": 43
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "frame": {
                    "x": 241,
                    "y": 365,
                    "width": 40,
                    "height": 44
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                },
                "inputs": [
                    "quickSave"
                ]
            },
            {
                "frame": {
                    "x": 445,
                    "y": 365,
                    "width": 40,
                    "height": 44
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                },
                "inputs": [
                    "quickLoad"
                ]
            }
        ],
          "mappingSize": {
            "width": 736,
            "height": 414
          },
          "extendedEdges": {
            "top": 12,
            "bottom": 12,
            "left": 12,
            "right": 12
          },
          "screens": [
            {
              "inputFrame": {
                "x": 0,
                "y": 0,
                "width": 160,
                "height": 144
              },
              "outputFrame": {
                "x": 168,
                "y": 27,
                "width": 400,
                "height": 360
              }
            }
          ],
          "extendedEdges": {
            "top": 10,
            "bottom": 10,
            "left": 10,
            "right": 10
          },
          "translucent": true
        }
      },
      "edgeToEdge": {
        "portrait": {
          "assets": {
            "resizable": "iphone-e2e-portrait.pdf"
          },
          "items": [
            {
              "inputs": {
                "up": "up",
                "down": "down",
                "left": "left",
                "right": "right"
              },
              "frame": {
                "x": 7,
                "y": 567,
                "width": 164,
                "height": 164
              },
              "extendedEdges": {
                "top": 15,
                "bottom": 15,
                "left": 15,
                "right": 15
              }
            },
            {
              "inputs": [
                "a"
              ],
              "frame": {
                "x": 316,
                "y": 570,
                "width": 75,
                "height": 75
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "b"
              ],
              "frame": {
                "x": 235,
                "y": 648,
                "width": 75,
                "height": 75
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "l"
              ],
              "frame": {
                "x": 0,
                "y": 458,
                "width": 94,
                "height": 58
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "r"
              ],
              "frame": {
                "x": 317,
                "y": 461,
                "width": 94,
                "height": 58
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "start"
              ],
              "frame": {
                "x": 220,
                "y": 469,
                "width": 40,
                "height": 40
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "select"
              ],
              "frame": {
                "x": 148,
                "y": 470,
                "width": 40,
                "height": 40
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "menu"
              ],
              "frame": {
                "x": 22,
                "y": 820,
                "width": 32,
                "height": 32
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "toggleFastForward"
              ],
              "frame": {
                "x": 344,
                "y": 815,
                "width": 39,
                "height": 39
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "frame": {
                "x": 133,
                "y": 814,
                "width": 40,
                "height": 44
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              },
              "inputs": [
                "quickSave"
              ]
            },
            {
              "frame": {
                "x": 239,
                "y": 814,
                "width": 40,
                "height": 44
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              },
              "inputs": [
                "quickLoad"
              ]
            }
          ],
          "mappingSize": {
            "width": 414,
            "height": 896
          },
          "screens": [
            {
              "inputFrame": {
                "x": 0,
                "y": 0,
                "width": 160,
                "height": 144
              },
              "outputFrame": {
                "x": 7,
                "y": 45,
                "width": 400,
                "height": 360
              }
            }
          ],
          "extendedEdges": {
            "top": 10,
            "bottom": 10,
            "left": 10,
            "right": 10
          }
        },
        "landscape": {
          "assets": {
            "resizable": "iphone-e2e-landscape.pdf"
          },
          "items": [
            {
              "inputs": {
                "up": "up",
                "down": "down",
                "left": "left",
                "right": "right"
              },
              "frame": {
                "x": 15,
                "y": 111,
                "width": 172,
                "height": 172
              },
              "extendedEdges": {
                "top": 15,
                "bottom": 15,
                "left": 15,
                "right": 15
              }
            },
            {
              "inputs": [
                "a"
              ],
              "frame": {
                "x": 781,
                "y": 112,
                "width": 78,
                "height": 78
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "b"
              ],
              "frame": {
                "x": 705,
                "y": 184,
                "width": 78,
                "height": 78
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "l"
              ],
              "frame": {
                "x": 7,
                "y": 5,
                "width": 131,
                "height": 81
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "r"
              ],
              "frame": {
                "x": 752,
                "y": 2,
                "width": 131,
                "height": 81
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "start"
              ],
              "frame": {
                "x": 695,
                "y": 341,
                "width": 54,
                "height": 54
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "select"
              ],
              "frame": {
                "x": 140,
                "y": 345,
                "width": 51,
                "height": 51
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "menu"
              ],
              "frame": {
                "x": 353,
                "y": 3,
                "width": 37,
                "height": 37
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "inputs": [
                "toggleFastForward"
              ],
              "frame": {
                "x": 484,
                "y": 2,
                "width": 44,
                "height": 42
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              }
            },
            {
              "frame": {
                "x": 347,
                "y": 366,
                "width": 41,
                "height": 41
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              },
              "inputs": [
                "quickSave"
              ]
            },
            {
              "frame": {
                "x": 495,
                "y": 366,
                "width": 40,
                "height": 44
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              },
              "inputs": [
                "quickLoad"
              ]
            }
          ], "screens": [
            {
              "inputFrame": {
                "x": 0,
                "y": 0,
                "width": 160,
                "height": 144
              },
              "outputFrame": {
                "x": 248,
                "y": 27,
                "width": 400,
                "height": 360
              }
            }
          ],
          "mappingSize": {
            "width": 896,
            "height": 414
          },
          "extendedEdges": {
            "top": 12,
            "bottom": 12,
            "left": 12,
            "right": 12
          },
          "translucent": true
        }
      }
    }
  }
}

snesSkin = {
  "name": "SNES Sample",
  "identifier": "com.novamaker.sample.snes.navy",
  "gameTypeIdentifier": "com.rileytestut.delta.game.snes",
  "debug": false,
  "representations": {
    "iphone": {
      "standard": {
        "portrait": {
          "assets": {
            "resizable": "iphone-portrait.pdf"
          },
          "items": [
            {
                "inputs": {
                    "up": "up",
                    "down": "down",
                    "left": "left",
                    "right": "right"
                },
                "frame": {
                    "x": 15,
                    "y": 462,
                    "width": 164,
                    "height": 164
                },
                "extendedEdges": {
                    "top": 15,
                    "bottom": 15,
                    "left": 15,
                    "right": 15
                }
            },
            {
                "inputs": [
                    "a"
                ],
                "frame": {
                    "x": 330,
                    "y": 515,
                    "width": 60,
                    "height": 60
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "b"
                ],
                "frame": {
                    "x": 270,
                    "y": 575,
                    "width": 60,
                    "height": 60
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "x"
                ],
                "frame": {
                    "x": 270,
                    "y": 455,
                    "width": 60,
                    "height": 60
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "y"
                ],
                "frame": {
                    "x": 210,
                    "y": 515,
                    "width": 60,
                    "height": 60
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "l"
                ],
                "frame": {
                    "x": 1,
                    "y": 362,
                    "width": 94,
                    "height": 58
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "r"
                ],
                "frame": {
                    "x": 318,
                    "y": 365,
                    "width": 94,
                    "height": 58
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "start"
                ],
                "frame": {
                    "x": 223,
                    "y": 381,
                    "width": 32,
                    "height": 32
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "select"
                ],
                "frame": {
                    "x": 147,
                    "y": 381,
                    "width": 33,
                    "height": 33
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "menu"
                ],
                "frame": {
                    "x": 15,
                    "y": 682,
                    "width": 31,
                    "height": 31
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "toggleFastForward"
                ],
                "frame": {
                    "x": 370,
                    "y": 684,
                    "width": 29,
                    "height": 29
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "frame": {
                    "x": 134,
                    "y": 678,
                    "width": 40,
                    "height": 44
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                },
                "inputs": [
                    "quickSave"
                ]
            },
            {
                "frame": {
                    "x": 232,
                    "y": 677,
                    "width": 40,
                    "height": 44
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                },
                "inputs": [
                    "quickLoad"
                ]
            }
        ],
          "mappingSize": {
            "width": 414,
            "height": 736
          },
          "screens": [
            {
              "inputFrame": {
                "x": 0,
                "y": 0,
                "width": 256,
                "height": 224
              },
              "outputFrame": {
                "x": 15,
                "y": 24,
                "width": 384,
                "height": 336
              }
            }
          ],
          "extendedEdges": {
            "top": 10,
            "bottom": 10,
            "left": 10,
            "right": 10
          }
        },
        "landscape": {
          "assets": {
            "resizable": "iphone-landscape.pdf"
          },
          "items": [
            {
                "inputs": {
                    "up": "up",
                    "down": "down",
                    "left": "left",
                    "right": "right"
                },
                "frame": {
                    "x": -4,
                    "y": 87,
                    "width": 172,
                    "height": 172
                },
                "extendedEdges": {
                    "top": 15,
                    "bottom": 15,
                    "left": 15,
                    "right": 15
                }
            },
            {
                "inputs": [
                    "a"
                ],
                "frame": {
                    "x": 669,
                    "y": 142,
                    "width": 63,
                    "height": 63
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "b"
                ],
                "frame": {
                    "x": 609,
                    "y": 204,
                    "width": 62,
                    "height": 62
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "l"
                ],
                "frame": {
                    "x": 24,
                    "y": 2,
                    "width": 106,
                    "height": 58
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "r"
                ],
                "frame": {
                    "x": 594,
                    "y": 4,
                    "width": 112,
                    "height": 62
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "start"
                ],
                "frame": {
                    "x": 593,
                    "y": 291,
                    "width": 47,
                    "height": 47
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "select"
                ],
                "frame": {
                    "x": 97,
                    "y": 284,
                    "width": 48,
                    "height": 48
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "menu"
                ],
                "frame": {
                    "x": 611,
                    "y": 370,
                    "width": 30,
                    "height": 30
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "toggleFastForward"
                ],
                "frame": {
                    "x": 666,
                    "y": 367,
                    "width": 34,
                    "height": 34
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "frame": {
                    "x": 610,
                    "y": 85,
                    "width": 63,
                    "height": 66
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                },
                "inputs": [
                    "x"
                ]
            },
            {
                "frame": {
                    "x": 550,
                    "y": 137,
                    "width": 68,
                    "height": 71
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                },
                "inputs": [
                    "y"
                ]
            },
            {
                "frame": {
                    "x": 23,
                    "y": 362,
                    "width": 34,
                    "height": 37
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                },
                "inputs": [
                    "quickSave"
                ]
            },
            {
                "frame": {
                    "x": 92,
                    "y": 361,
                    "width": 38,
                    "height": 40
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                },
                "inputs": [
                    "quickLoad"
                ]
            }
        ],
          "mappingSize": {
            "width": 736,
            "height": 414
          },
          "extendedEdges": {
            "top": 12,
            "bottom": 12,
            "left": 12,
            "right": 12
          },
          "screens": [
            {
              "inputFrame": {
                "x": 0,
                "y": 0,
                "width": 256,
                "height": 224
              },
              "outputFrame": {
                "x": 144,
                "y": 11,
                "width": 448,
                "height": 392
              }
            }
          ],
          "extendedEdges": {
            "top": 10,
            "bottom": 10,
            "left": 10,
            "right": 10
          },
          "translucent": true
        }
      },
      "edgeToEdge": {
        "portrait": {
          "assets": {
            "resizable": "iphone-e2e-portrait.pdf"
          },
          "items": [
            {
                "inputs": {
                    "up": "up",
                    "down": "down",
                    "left": "left",
                    "right": "right"
                },
                "frame": {
                    "x": 7,
                    "y": 537,
                    "width": 164,
                    "height": 164
                },
                "extendedEdges": {
                    "top": 15,
                    "bottom": 15,
                    "left": 15,
                    "right": 15
                }
            },
            {
                "inputs": [
                    "a"
                ],
                "frame": {
                    "x": 331,
                    "y": 583,
                    "width": 60,
                    "height": 60
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "b"
                ],
                "frame": {
                    "x": 267,
                    "y": 637,
                    "width": 60,
                    "height": 60
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "x"
                ],
                "frame": {
                    "x": 267,
                    "y": 528,
                    "width": 60,
                    "height": 60
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "y"
                ],
                "frame": {
                    "x": 210,
                    "y": 580,
                    "width": 60,
                    "height": 60
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "l"
                ],
                "frame": {
                    "x": -1,
                    "y": 419,
                    "width": 106,
                    "height": 65
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "r"
                ],
                "frame": {
                    "x": 314,
                    "y": 423,
                    "width": 98,
                    "height": 60
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "start"
                ],
                "frame": {
                    "x": 217,
                    "y": 435,
                    "width": 38,
                    "height": 38
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "select"
                ],
                "frame": {
                    "x": 147,
                    "y": 436,
                    "width": 38,
                    "height": 38
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "menu"
                ],
                "frame": {
                    "x": 13,
                    "y": 792,
                    "width": 34,
                    "height": 34
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "toggleFastForward"
                ],
                "frame": {
                    "x": 365,
                    "y": 793,
                    "width": 35,
                    "height": 35
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "frame": {
                    "x": 128,
                    "y": 790,
                    "width": 40,
                    "height": 44
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                },
                "inputs": [
                    "quickSave"
                ]
            },
            {
                "frame": {
                    "x": 248,
                    "y": 792,
                    "width": 40,
                    "height": 44
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                },
                "inputs": [
                    "quickLoad"
                ]
            }
        ],
          "mappingSize": {
            "width": 414,
            "height": 896
          },
          "screens": [
            {
              "inputFrame": {
                "x": 0,
                "y": 0,
                "width": 256,
                "height": 224
              },
              "outputFrame": {
                "x": 15,
                "y": 54,
                "width": 384,
                "height": 336
              }
            }
          ],
          "extendedEdges": {
            "top": 10,
            "bottom": 10,
            "left": 10,
            "right": 10
          }
        },
        "landscape": {
          "assets": {
            "resizable": "iphone-e2e-landscape.pdf"
          },
          "items": [
            {
                "inputs": {
                    "up": "up",
                    "down": "down",
                    "left": "left",
                    "right": "right"
                },
                "frame": {
                    "x": 21,
                    "y": 90,
                    "width": 172,
                    "height": 172
                },
                "extendedEdges": {
                    "top": 15,
                    "bottom": 15,
                    "left": 15,
                    "right": 15
                }
            },
            {
                "inputs": [
                    "a"
                ],
                "frame": {
                    "x": 814,
                    "y": 146,
                    "width": 63,
                    "height": 63
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "b"
                ],
                "frame": {
                    "x": 758,
                    "y": 201,
                    "width": 62,
                    "height": 62
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "l"
                ],
                "frame": {
                    "x": 24,
                    "y": 2,
                    "width": 106,
                    "height": 58
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "r"
                ],
                "frame": {
                    "x": 761,
                    "y": 3,
                    "width": 112,
                    "height": 62
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "start"
                ],
                "frame": {
                    "x": 680,
                    "y": 263,
                    "width": 47,
                    "height": 47
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "select"
                ],
                "frame": {
                    "x": 173,
                    "y": 260,
                    "width": 48,
                    "height": 48
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "menu"
                ],
                "frame": {
                    "x": 750,
                    "y": 370,
                    "width": 30,
                    "height": 30
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "toggleFastForward"
                ],
                "frame": {
                    "x": 829,
                    "y": 369,
                    "width": 34,
                    "height": 34
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "frame": {
                    "x": 757,
                    "y": 85,
                    "width": 63,
                    "height": 66
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                },
                "inputs": [
                    "x"
                ]
            },
            {
                "frame": {
                    "x": 695,
                    "y": 146,
                    "width": 64,
                    "height": 64
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                },
                "inputs": [
                    "y"
                ]
            },
            {
                "frame": {
                    "x": 30,
                    "y": 365,
                    "width": 34,
                    "height": 37
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                },
                "inputs": [
                    "quickSave"
                ]
            },
            {
                "frame": {
                    "x": 137,
                    "y": 363,
                    "width": 38,
                    "height": 40
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                },
                "inputs": [
                    "quickLoad"
                ]
            }
        ], "screens": [
          {
            "inputFrame": {
              "x": 0,
              "y": 0,
              "width": 256,
              "height": 224
            },
            "outputFrame": {
              "x": 228,
              "y": 11,
              "width": 448,
              "height": 392
            }
          }],
          "mappingSize": {
            "width": 896,
            "height": 414
          },
          "extendedEdges": {
            "top": 12,
            "bottom": 12,
            "left": 12,
            "right": 12
          },
          "translucent": true
        }
      }
    }
  }
}

ndsSkin = {
  "name": "DS Sample",
  "identifier": "com.novamaker.sample.nds.navy",
  "gameTypeIdentifier": "com.rileytestut.delta.game.nds",
  "debug": false,
  "representations": {
    "iphone": {
      "standard": {
        "portrait": {
          "assets": {
            "resizable": "iphone-portrait.pdf"
          },
          "items": [
            {
                "inputs": {
                    "up": "up",
                    "down": "down",
                    "left": "left",
                    "right": "right"
                },
                "frame": {
                    "x": 21,
                    "y": 510,
                    "width": 164,
                    "height": 164
                },
                "extendedEdges": {
                    "top": 15,
                    "bottom": 15,
                    "left": 15,
                    "right": 15
                }
            },
            {
                "inputs": [
                    "a"
                ],
                "frame": {
                    "x": 345,
                    "y": 557,
                    "width": 60,
                    "height": 60
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "b"
                ],
                "frame": {
                    "x": 282,
                    "y": 607,
                    "width": 60,
                    "height": 60
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "x"
                ],
                "frame": {
                    "x": 284,
                    "y": 500,
                    "width": 60,
                    "height": 60
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "y"
                ],
                "frame": {
                    "x": 224,
                    "y": 554,
                    "width": 60,
                    "height": 60
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "l"
                ],
                "frame": {
                    "x": 0,
                    "y": 398,
                    "width": 44,
                    "height": 94
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "r"
                ],
                "frame": {
                    "x": 367,
                    "y": 399,
                    "width": 48,
                    "height": 91
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "start"
                ],
                "frame": {
                    "x": 210,
                    "y": 670,
                    "width": 41,
                    "height": 41
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "select"
                ],
                "frame": {
                    "x": 152,
                    "y": 670,
                    "width": 41,
                    "height": 41
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "menu"
                ],
                "frame": {
                    "x": 18,
                    "y": 689,
                    "width": 31,
                    "height": 31
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "toggleFastForward"
                ],
                "frame": {
                    "x": 364,
                    "y": 690,
                    "width": 29,
                    "height": 29
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "frame": {
                    "x": 1,
                    "y": 129,
                    "width": 40,
                    "height": 44
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                },
                "inputs": [
                    "quickSave"
                ]
            },
            {
                "frame": {
                    "x": 369,
                    "y": 130,
                    "width": 40,
                    "height": 44
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                },
                "inputs": [
                    "quickLoad"
                ]
            }
        ],
          "mappingSize": {
            "width": 414,
            "height": 736
          },
          "screens": [
            {
                "inputFrame": {
                    "x": 0,
                    "y": 0,
                    "width": 256,
                    "height": 192
                },
                "outputFrame": {
                    "x": 47,
                    "y": 5,
                    "width": 320,
                    "height": 240
                }
            },
            {
                "inputFrame": {
                    "x": 0,
                    "y": 0,
                    "width": 256,
                    "height": 192
                },
                "outputFrame": {
                    "x": 47,
                    "y": 250,
                    "width": 320,
                    "height": 240
                }
            }
        ],
          "extendedEdges": {
            "top": 10,
            "bottom": 10,
            "left": 10,
            "right": 10
          }
        },
        "landscape": {
          "assets": {
            "resizable": "iphone-landscape.pdf"
          },
          "items": [
            {
                "inputs": {
                    "up": "up",
                    "down": "down",
                    "left": "left",
                    "right": "right"
                },
                "frame": {
                    "x": 57,
                    "y": 245,
                    "width": 167,
                    "height": 167
                },
                "extendedEdges": {
                    "top": 15,
                    "bottom": 15,
                    "left": 15,
                    "right": 15
                }
            },
            {
                "inputs": [
                    "a"
                ],
                "frame": {
                    "x": 643,
                    "y": 293,
                    "width": 58,
                    "height": 58
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "b"
                ],
                "frame": {
                    "x": 591,
                    "y": 347,
                    "width": 56,
                    "height": 56
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "l"
                ],
                "frame": {
                    "x": 0,
                    "y": 164,
                    "width": 41,
                    "height": 103
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "r"
                ],
                "frame": {
                    "x": 695,
                    "y": 146,
                    "width": 37,
                    "height": 116
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "start"
                ],
                "frame": {
                    "x": 416,
                    "y": 268,
                    "width": 47,
                    "height": 47
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "select"
                ],
                "frame": {
                    "x": 283,
                    "y": 266,
                    "width": 48,
                    "height": 48
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "menu"
                ],
                "frame": {
                    "x": 423,
                    "y": 371,
                    "width": 30,
                    "height": 30
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "toggleFastForward"
                ],
                "frame": {
                    "x": 290,
                    "y": 364,
                    "width": 34,
                    "height": 34
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "frame": {
                    "x": 587,
                    "y": 235,
                    "width": 56,
                    "height": 59
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                },
                "inputs": [
                    "x"
                ]
            },
            {
                "frame": {
                    "x": 530,
                    "y": 287,
                    "width": 59,
                    "height": 62
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                },
                "inputs": [
                    "y"
                ]
            },
            {
                "frame": {
                    "x": 4,
                    "y": 54,
                    "width": 34,
                    "height": 37
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                },
                "inputs": [
                    "quickSave"
                ]
            },
            {
                "frame": {
                    "x": 696,
                    "y": 57,
                    "width": 38,
                    "height": 40
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                },
                "inputs": [
                    "quickLoad"
                ]
            }
        ],
          "mappingSize": {
            "width": 736,
            "height": 414
          },
          "extendedEdges": {
            "top": 12,
            "bottom": 12,
            "left": 12,
            "right": 12
          },
          "screens": [
            {
              "inputFrame": {
                "x": 0,
                "y": 0,
                "width": 256,
                "height": 192
              },
              "outputFrame": {
                "x": 40,
                "y": 24,
                "width": 320,
                "height": 240
              }
            },
            {
              "inputFrame": {
                "x": 0,
                "y": 192,
                "width": 256,
                "height": 192
              },
              "outputFrame": {
                "x": 376,
                "y": 24,
                "width": 320,
                "height": 240
              }
            }
          ],
          "extendedEdges": {
            "top": 10,
            "bottom": 10,
            "left": 10,
            "right": 10
          },
          "translucent": true
        }
      },
      "edgeToEdge": {
        "portrait": {
          "assets": {
            "resizable": "iphone-e2e-portrait.pdf"
          },
          "items": [
            {
                "inputs": {
                    "up": "up",
                    "down": "down",
                    "left": "left",
                    "right": "right"
                },
                "frame": {
                    "x": 6,
                    "y": 684,
                    "width": 164,
                    "height": 164
                },
                "extendedEdges": {
                    "top": 15,
                    "bottom": 15,
                    "left": 15,
                    "right": 15
                }
            },
            {
                "inputs": [
                    "a"
                ],
                "frame": {
                    "x": 342,
                    "y": 728,
                    "width": 60,
                    "height": 60
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "b"
                ],
                "frame": {
                    "x": 281,
                    "y": 781,
                    "width": 60,
                    "height": 60
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "x"
                ],
                "frame": {
                    "x": 280,
                    "y": 671,
                    "width": 60,
                    "height": 60
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "y"
                ],
                "frame": {
                    "x": 227,
                    "y": 725,
                    "width": 60,
                    "height": 60
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "l"
                ],
                "frame": {
                    "x": 0,
                    "y": 619,
                    "width": 76,
                    "height": 50
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "r"
                ],
                "frame": {
                    "x": 341,
                    "y": 617,
                    "width": 73,
                    "height": 49
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "start"
                ],
                "frame": {
                    "x": 217,
                    "y": 625,
                    "width": 38,
                    "height": 38
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "select"
                ],
                "frame": {
                    "x": 146,
                    "y": 624,
                    "width": 38,
                    "height": 38
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "menu"
                ],
                "frame": {
                    "x": 210,
                    "y": 856,
                    "width": 34,
                    "height": 34
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "toggleFastForward"
                ],
                "frame": {
                    "x": 155,
                    "y": 855,
                    "width": 35,
                    "height": 35
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "frame": {
                    "x": 11,
                    "y": 863,
                    "width": 27,
                    "height": 32
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                },
                "inputs": [
                    "quickSave"
                ]
            },
            {
                "frame": {
                    "x": 370,
                    "y": 857,
                    "width": 31,
                    "height": 31
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                },
                "inputs": [
                    "quickLoad"
                ]
            }
        ],
          "mappingSize": {
            "width": 414,
            "height": 896
          },
          "screens": [
            {
                "inputFrame": {
                    "x": 0,
                    "y": 0,
                    "width": 256,
                    "height": 192
                },
                "outputFrame": {
                    "x": 15,
                    "y": 33,
                    "width": 384,
                    "height": 288
                }
            },
            {
                "inputFrame": {
                    "x": 0,
                    "y": 0,
                    "width": 256,
                    "height": 192
                },
                "outputFrame": {
                    "x": 15,
                    "y": 333,
                    "width": 384,
                    "height": 288
                }
            }
        ],
          "extendedEdges": {
            "top": 10,
            "bottom": 10,
            "left": 10,
            "right": 10
          }
        },
        "landscape": {
          "assets": {
            "resizable": "iphone-e2e-landscape.pdf"
          },
          "items": [
            {
                "inputs": {
                    "up": "up",
                    "down": "down",
                    "left": "left",
                    "right": "right"
                },
                "frame": {
                    "x": 23,
                    "y": 231,
                    "width": 172,
                    "height": 172
                },
                "extendedEdges": {
                    "top": 15,
                    "bottom": 15,
                    "left": 15,
                    "right": 15
                }
            },
            {
                "inputs": [
                    "a"
                ],
                "frame": {
                    "x": 812,
                    "y": 292,
                    "width": 54,
                    "height": 54
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "b"
                ],
                "frame": {
                    "x": 760,
                    "y": 347,
                    "width": 55,
                    "height": 55
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "l"
                ],
                "frame": {
                    "x": 0,
                    "y": 59,
                    "width": 41,
                    "height": 135
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "r"
                ],
                "frame": {
                    "x": 853,
                    "y": 62,
                    "width": 39,
                    "height": 124
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "start"
                ],
                "frame": {
                    "x": 594,
                    "y": 309,
                    "width": 47,
                    "height": 47
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "select"
                ],
                "frame": {
                    "x": 260,
                    "y": 303,
                    "width": 48,
                    "height": 48
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "menu"
                ],
                "frame": {
                    "x": 264,
                    "y": 375,
                    "width": 30,
                    "height": 30
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "inputs": [
                    "toggleFastForward"
                ],
                "frame": {
                    "x": 600,
                    "y": 377,
                    "width": 34,
                    "height": 34
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                }
            },
            {
                "frame": {
                    "x": 758,
                    "y": 238,
                    "width": 55,
                    "height": 58
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                },
                "inputs": [
                    "x"
                ]
            },
            {
                "frame": {
                    "x": 707,
                    "y": 290,
                    "width": 58,
                    "height": 58
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                },
                "inputs": [
                    "y"
                ]
            },
            {
                "frame": {
                    "x": 380,
                    "y": 316,
                    "width": 34,
                    "height": 37
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                },
                "inputs": [
                    "quickSave"
                ]
            },
            {
                "frame": {
                    "x": 484,
                    "y": 313,
                    "width": 38,
                    "height": 40
                },
                "extendedEdges": {
                    "top": 5,
                    "bottom": 5,
                    "left": 5,
                    "right": 5
                },
                "inputs": [
                    "quickLoad"
                ]
            }
        ], "screens": [
          {
            "inputFrame": {
              "x": 0,
              "y": 0,
              "width": 256,
              "height": 192
            },
            "outputFrame": {
              "x": 45,
              "y": 24,
              "width": 384,
              "height": 288
            }
          },
          {
            "inputFrame": {
              "x": 0,
              "y": 192,
              "width": 256,
              "height": 192
            },
            "outputFrame": {
              "x": 470,
              "y": 24,
              "width": 384,
              "height": 288
            }
          }
        ],
          "mappingSize": {
            "width": 896,
            "height": 414
          },
          "extendedEdges": {
            "top": 12,
            "bottom": 12,
            "left": 12,
            "right": 12
          },
          "translucent": true
        }
      }
    }
  }
}



let skinObject = gbaSkin;
let currentRep = skinObject.representations.iphone.edgeToEdge.portrait;

updateCanvas();

