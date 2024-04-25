/* Input Variables */

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
let screenDiv = document.querySelector("#screen");
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
downloadSkinButton.addEventListener("click",downloadSkin);

document.querySelectorAll(".buttonBorder").forEach(
  (el) => {
    el.setAttribute("draggable", "true");
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
});


function startResizeButton(/** @type DragEvent */ev) {
  if (!ev.target.parentNode.classList.contains("buttonBorder")) return;
  console.log("drag starts");
  ev.dataTransfer.setDragImage(new Image(0, 0), 0, 0);


}

function doResizeButton(/** @type DragEvent */ev) {
  let button = ev.target.parentNode;
  if (!button || !button.classList.contains("buttonBorder")) return;
  //mouse offset from upperleft corner of button
  let mouseOffsetTop = ev.offsetY + ev.target.offsetTop;
  let mouseOffsetLeft = ev.offsetX + ev.target.offsetLeft;
  // to catch weird issues with drag events?
  console.log(mouseOffsetTop);
  let oldHeight = button.offsetHeight;
  let oldWidth = button.offsetWidth;
  let oldTop = button.offsetTop;
  let oldLeft = button.offsetLeft;
  //pull up
  if (ev.target.classList.contains("upperLeftCorner") || ev.target.classList.contains("upperRightCorner")) {
    //move the top up, change the height.
    let newHeight = oldHeight - mouseOffsetTop;
    if (Math.abs(newHeight - oldHeight) > 20 || newHeight < 5) return;
    button.style.height = newHeight + "px";
    button.style.top = oldTop + mouseOffsetTop + "px";
  } else {
    let newHeight = mouseOffsetTop;
    if (Math.abs(newHeight - oldHeight) > 20 || newHeight < 5) return;
    button.style.height = newHeight + "px";
  }
  if (ev.target.classList.contains("upperLeftCorner") || ev.target.classList.contains("lowerLeftCorner")) {
    //move the left up, change the width.
    let newWidth = oldWidth - mouseOffsetLeft;
    if (Math.abs(newWidth - oldWidth) > 20 || newWidth < 5) return;
    button.style.width = newWidth + "px";
    button.style.left = oldLeft + mouseOffsetLeft + "px";
  } else {
    let newWidth = mouseOffsetLeft;
    if (Math.abs(newWidth - oldWidth) > 20 || newWidth < 5) return;
    button.style.width = newWidth + "px";
  }
  editSkinButton(button);
}

async function downloadSkin(ev) {
  let pdfs = [];
  let pdfNames = [];
  let ourOption = canvasSelection.selectedOptions[0];
  // change to each choice one at a time
  for (let option of canvasSelection.options ) {
    option.selected = true;
    updateSkinObject();
    let pdf = await createPDF(controlArea);
    pdfs.push(pdf);
    pdfNames.push(currentRep.assets.resizable);
  }
  var zip = new JSZip();
  for (let i = 0; i < pdfs.length; i++) {
    zip.file(pdfNames[i],pdfs[i].output("blob"));
  }
  zip.file("info.json",createJSONBlob());
  zip.generateAsync({type:"blob"})
    .then(function(content) {
        // see FileSaver.js
        saveAs(content, skinObject.name + ".deltaskin");
    });

  ourOption.selected=true;
  updateSkinObject();
}

async function downloadPDF(ev) {
  let currentPDF = await createPDF(controlArea);
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
    document.documentElement.style.setProperty("--portrait-bg", newColor);
    bgColorInput.style.color = "";
  } else {
    bgColorInput.style.color = "darkred";
  }
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
  screenDiv.className = gtype;
  //mapping area
  let yOffset = 0;
  if (gtype === "ds" && mainAreaDiv.classList.contains("portrait")) {
    mappingOffset = (-phoneCanvas.clientHeight + currentRep.mappingSize.height) + screenDiv.offsetHeight + screenDiv.offsetTop;
  } else {
    mappingOffset = 0;
  }

  controlArea.style.width = currentRep.mappingSize.width + "px";
  controlArea.style.height = currentRep.mappingSize.height - mappingOffset + "px";

  let ourOption = gameTypeChoice.options.namedItem(gtype);
  ourOption.selected = true;
  // read the currentRep and put the buttons in the right place
  /** @type HTMLDivElement */
  let img;

  document.querySelectorAll(".buttonBorder").forEach((e) => {
    let nw = e.offsetWidth;
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
      img.style.top = (button.frame.y - mappingOffset) + "px";
      img.style.left = (button.frame.x) + "px";
    }

  }
}





/** updates the skin object to fit whatever is input */
function updateSkinObject() {
  let g = gameTypeChoice.selectedOptions.item(0).id;
  if (g === "ds") {
    skinObject = ndsSkin;
  } else {
    skinObject = normalSkin;
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
    mainAreaDiv.className = "landscape";
    currentRep = skinObject.representations.iphone.edgeToEdge.landscape;
  } else if (ctype == "etePortrait") {
    mainAreaDiv.className = "portrait";
    currentRep = skinObject.representations.iphone.edgeToEdge.portrait;
  } else if (ctype === "stdLandscape") {
    mainAreaDiv.className = "landscape";
    currentRep = skinObject.representations.iphone.standard.landscape;
  } else if (ctype == "stdPortrait") {
    mainAreaDiv.className = "portrait";
    currentRep = skinObject.representations.iphone.standard.portrait;
  }
  phoneCanvas.className = ctype;

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
  buttonBox.appendChild(button);
  button.style.position = "";
  button.style.top = "";
  button.style.left = "";
  editSkinButton(button);
  updateCanvas();
}

/** When a button moves, call this to update the skin to match */
function editSkinButton(button) {
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
    let gtype = gameTypeChoice.selectedOptions.item(0).id;
    if (gtype === "ds" && mainAreaDiv.classList.contains("portrait")) {
      mappingOffset = (-phoneCanvas.clientHeight + currentRep.mappingSize.height) + screenDiv.offsetHeight + screenDiv.offsetTop;
    } else {
      mappingOffset = 0;
    }
    item.frame = {};
    item.frame.x = button.offsetLeft;
    item.frame.y = button.offsetTop + mappingOffset;
    item.frame.width = button.offsetWidth;
    item.frame.height = button.offsetHeight;
    if (button.id === "dpadbox") {
      item.extendedEdges = { top: 15, bottom: 15, left: 15, right: 15 }
      item.inputs = { up: "up", down: "down", left: "left", right: "right" }
    } else if (button.id === "stickbox") {
      item.thumbstick = {};
      item.thumbstick.width = button.offsetWidth * 0.75;
      item.thumbstick.height = button.offsetHeight * 0.75;
      item.thumbstick.name = "innerstick.pdf";
      item.extendedEdges = { top: 20, bottom: 20, left: 20, right: 20 }
      item.inputs = { up: "up", down: "down", left: "left", right: "right" }
    } else {
      item.extendedEdges = { top: 5, bottom: 5, left: 5, right: 5 }
      item.inputs = [button.id.substring(0, button.id.length - 3)];
    }
  }

}

async function createPDF(area) {
  let canvas;
  area.classList.add("print");
  let style = window.getComputedStyle(area);
  if (style.backgroundColor === "rgba(0, 0, 0, 0)") {
    canvas = await html2canvas(area, { scale: 3, backgroundColor: null });
  } else {
    canvas = await html2canvas(area, { scale: 3 });
  }
  area.classList.remove("print");


  var imgData = canvas.toDataURL('img/png');
  var doc = new jsPDF({ orientation: "l", unit: "px", format: [canvas.width, canvas.height] });
  doc.addImage(imgData, 'PNG', 0, 0,doc.internal.pageSize.width,doc.internal.pageSize.height);
  return doc;
}






/** Default Skin Object */

let normalSkin = {
  name: "GBA Sample",
  identifier: "com.novamaker.sample.gba.black",
  gameTypeIdentifier: "com.rileytestut.delta.game.gba",
  debug: false,
  representations: {
    iphone: {
      standard: {
        portrait: {
          assets: {
            resizable: "iphone-portrait.pdf"
          },
          items: [
            {
              inputs: {
                up: "up",
                down: "down",
                left: "left",
                right: "right"
              },
              frame: {
                x: 15,
                y: 75,
                width: 164,
                height: 164
              },
              extendedEdges: {
                top: 12,
                right: 12,
                bottom: 12,
                left: 12
              }
            },
            {
              inputs: [
                "a"
              ],
              frame: {
                x: 316,
                y: 84,
                width: 75,
                height: 75
              }
            },
            {
              inputs: [
                "b"
              ],
              frame: {
                x: 231,
                y: 161,
                width: 75,
                height: 75
              }
            },
            {
              inputs: [
                "l"
              ],
              frame: {
                x: 0,
                y: 0,
                width: 94,
                height: 58
              }
            },
            {
              inputs: [
                "r"
              ],
              frame: {
                x: 320,
                y: 0,
                width: 94,
                height: 58
              }
            },
            {
              inputs: [
                "start"
              ],
              frame: {
                x: 230,
                y: 268,
                width: 22,
                height: 22
              },
              extendedEdges: {
                bottom: 15
              }
            },
            {
              inputs: [
                "select"
              ],
              frame: {
                x: 162,
                y: 268,
                width: 22,
                height: 22
              },
              extendedEdges: {
                bottom: 15
              }
            },
            {
              inputs: [
                "menu"
              ],
              frame: {
                x: 15,
                y: 268,
                width: 22,
                height: 22
              },
              extendedEdges: {
                bottom: 15
              }
            },
            {
              inputs: [
                "toggleFastForward"
              ],
              frame: {
                x: 377,
                y: 268,
                width: 22,
                height: 22
              },
              extendedEdges: {
                bottom: 15
              }
            }
          ],
          mappingSize: {
            width: 414,
            height: 313
          },
          extendedEdges: {
            top: 10,
            bottom: 10,
            left: 10,
            right: 10
          }
        },
        landscape: {
          assets: {
            resizable: "iphone-landscape.pdf"
          },
          items: [
            {
              inputs: {
                up: "up",
                down: "down",
                left: "left",
                right: "right"
              },
              frame: {
                x: 18,
                y: 224,
                width: 172,
                height: 172
              },
              extendedEdges: {
                top: 15,
                right: 15,
                bottom: 15,
                left: 15
              }
            },
            {
              inputs: [
                "a"
              ],
              frame: {
                x: 640,
                y: 254,
                width: 78,
                height: 78
              },
              extendedEdges: {
                bottom: 0
              }
            },
            {
              inputs: [
                "b"
              ],
              frame: {
                x: 557,
                y: 318,
                width: 78,
                height: 78
              },
              extendedEdges: {
                right: 0
              }
            },
            {
              inputs: [
                "l"
              ],
              frame: {
                x: 18,
                y: 18,
                width: 98,
                height: 54
              }
            },
            {
              inputs: [
                "r"
              ],
              frame: {
                x: 612,
                y: 18,
                width: 98,
                height: 54
              }
            },
            {
              inputs: [
                "start"
              ],
              frame: {
                x: 381,
                y: 372,
                width: 40,
                height: 40
              }
            },
            {
              inputs: [
                "select"
              ],
              frame: {
                x: 279,
                y: 372,
                width: 40,
                height: 40
              }
            },
            {
              inputs: [
                "menu"
              ],
              frame: {
                x: 279,
                y: 18,
                width: 30,
                height: 30
              }
            },
            {
              inputs: [
                "toggleFastForward"
              ],
              frame: {
                x: 381,
                y: 18,
                width: 30,
                height: 30
              }
            }
          ],
          mappingSize: {
            width: 736,
            height: 414
          },
          extendedEdges: {
            top: 12,
            bottom: 12,
            left: 12,
            right: 12
          },
          translucent: true
        }
      },
      edgeToEdge: {
        portrait: {
          assets: {
            resizable: "iphone-e2e-portrait.pdf"
          },
          items: [
            {
              inputs: {
                up: "up",
                down: "down",
                left: "left",
                right: "right"
              },
              frame: {
                x: 15,
                y: 75,
                width: 164,
                height: 164
              },
              extendedEdges: {
                top: 12,
                right: 12,
                bottom: 12,
                left: 12
              }
            },
            {
              inputs: [
                "a"
              ],
              frame: {
                x: 316,
                y: 84,
                width: 75,
                height: 75
              }
            },
            {
              inputs: [
                "b"
              ],
              frame: {
                x: 231,
                y: 161,
                width: 75,
                height: 75
              }
            },
            {
              inputs: [
                "l"
              ],
              frame: {
                x: 0,
                y: 7,
                width: 94,
                height: 58
              }
            },
            {
              inputs: [
                "r"
              ],
              frame: {
                x: 320,
                y: 7,
                width: 94,
                height: 58
              }
            },
            {
              inputs: [
                "start"
              ],
              frame: {
                x: 230,
                y: 268,
                width: 40,
                height: 40
              },
              extendedEdges: {
                bottom: 15
              }
            },
            {
              inputs: [
                "select"
              ],
              frame: {
                x: 162,
                y: 268,
                width: 40,
                height: 40
              },
              extendedEdges: {
                bottom: 15
              }
            },
            {
              inputs: [
                "menu"
              ],
              frame: {
                x: 15,
                y: 280,
                width: 22,
                height: 22
              },
              extendedEdges: {
                bottom: 15
              }
            },
            {
              inputs: [
                "toggleFastForward"
              ],
              frame: {
                x: 377,
                y: 280,
                width: 22,
                height: 22
              },
              extendedEdges: {
                bottom: 15
              }
            }
          ],
          mappingSize: {
            width: 414,
            height: 354
          },
          extendedEdges: {
            top: 10,
            bottom: 10,
            left: 10,
            right: 10
          }
        },
        landscape: {
          assets: {
            resizable: "iphone-e2e-landscape.pdf"
          },
          items: [
            {
              inputs: {
                up: "up",
                down: "down",
                left: "left",
                right: "right"
              },
              frame: {
                x: 40,
                y: 224,
                width: 172,
                height: 172
              },
              extendedEdges: {
                top: 15,
                right: 15,
                bottom: 15,
                left: 15
              }
            },
            {
              inputs: [
                "a"
              ],
              frame: {
                x: 778,
                y: 254,
                width: 78,
                height: 78
              },
              extendedEdges: {
                bottom: 0
              }
            },
            {
              inputs: [
                "b"
              ],
              frame: {
                x: 695,
                y: 318,
                width: 78,
                height: 78
              },
              extendedEdges: {
                right: 0
              }
            },

            {
              inputs: [
                "l"
              ],
              frame: {
                x: 40,
                y: 18,
                width: 94,
                height: 58
              }
            },
            {
              inputs: [
                "r"
              ],
              frame: {
                x: 750,
                y: 18,
                width: 94,
                height: 58
              }
            },
            {
              inputs: [
                "start"
              ],
              frame: {
                x: 461,
                y: 372,
                width: 40,
                height: 40
              }
            },
            {
              inputs: [
                "select"
              ],
              frame: {
                x: 359,
                y: 372,
                width: 40,
                height: 40
              }
            },
            {
              inputs: [
                "menu"
              ],
              frame: {
                x: 359,
                y: 18,
                width: 30,
                height: 30
              }
            },
            {
              inputs: [
                "toggleFastForward"
              ],
              frame: {
                x: 461,
                y: 18,
                width: 30,
                height: 30
              }
            }
          ],
          mappingSize: {
            width: 896,
            height: 414
          },
          extendedEdges: {
            top: 12,
            bottom: 12,
            left: 12,
            right: 12
          },
          translucent: true
        }
      }
    }
  }
}

let ndsSkin = {
  "name": "DS Sample",
  "identifier": "com.novamaker.sample.ds.black",
  "gameTypeIdentifier": "com.rileytestut.delta.game.ds",
  "debug": false,
  "representations": {
    "iphone": {
      "standard": {
        "portrait": {
          "assets": {
            "resizable": "iphone_portrait.pdf"
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
                "x": 20,
                "y": 606,
                "width": 110,
                "height": 110
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
                "x": 357,
                "y": 639,
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
                "b"
              ],
              "frame": {
                "x": 317,
                "y": 681,
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
                "l"
              ],
              "frame": {
                "x": 115,
                "y": 573,
                "width": 47,
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
              "inputs": [
                "r"
              ],
              "frame": {
                "x": 244,
                "y": 571,
                "width": 47,
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
              "inputs": [
                "start"
              ],
              "frame": {
                "x": 163,
                "y": 630,
                "width": 25,
                "height": 25
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
                "x": 222,
                "y": 630,
                "width": 25,
                "height": 25
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
                "x": 199,
                "y": 684,
                "width": 20,
                "height": 20
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
                "x": 275,
                "y": 639,
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
                "x"
              ],
              "frame": {
                "x": 314,
                "y": 598,
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
              "inputs": {
                "x": "touchScreenX",
                "y": "touchScreenY"
              },
              "frame": {
                "x": 50,
                "y": 252,
                "width": 275,
                "height": 206
              },
              "extendedEdges": {
                "top": 0,
                "bottom": 0,
                "left": 0,
                "right": 0
              }
            },
            {
              "frame": {
                "x": 197,
                "y": 577,
                "width": 22,
                "height": 22
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              },
              "inputs": [
                "toggleFastForward"
              ]
            },
            {
              "frame": {
                "x": 389,
                "y": 576,
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
                "save"
              ]
            }
          ],
          "screens": [
            {
              "inputFrame": {
                "x": 0,
                "y": 0,
                "width": 256,
                "height": 192
              },
              "outputFrame": {
                "x": 0,
                "y": 18,
                "width": 275,
                "height": 206
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
                "x": 50,
                "y": 252,
                "width": 275,
                "height": 206
              }
            }
          ],
          "mappingSize": {
            "width": 414,
            "height": 736
          },
          "extendedEdges": {
            "top": 7,
            "bottom": 7,
            "left": 7,
            "right": 7
          }
        },
        "landscape": {
          "assets": {
            "resizable": "iphone_landscape.pdf"
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
                "y": 235,
                "width": 123,
                "height": 123
              },
              "extendedEdges": {
                "top": 15,
                "bottom": 20,
                "left": 20,
                "right": 20
              }
            },
            {
              "inputs": [
                "a"
              ],
              "frame": {
                "x": 606,
                "y": 273,
                "width": 47,
                "height": 47
              },
              "extendedEdges": {
                "top": 0,
                "bottom": 0,
                "left": 0,
                "right": 30
              }
            },
            {
              "inputs": [
                "b"
              ],
              "frame": {
                "x": 562,
                "y": 318,
                "width": 47,
                "height": 47
              },
              "extendedEdges": {
                "top": 0,
                "left": 0,
                "right": 0
              }
            },
            {
              "inputs": [
                "l"
              ],
              "frame": {
                "x": 173,
                "y": 219,
                "width": 135,
                "height": 33
              },
              "extendedEdges": {
                "top": 0
              }
            },
            {
              "inputs": [
                "r"
              ],
              "frame": {
                "x": 359,
                "y": 219,
                "width": 135,
                "height": 33
              },
              "extendedEdges": {
                "top": 0
              }
            },
            {
              "inputs": [
                "start"
              ],
              "frame": {
                "x": 304,
                "y": 287,
                "width": 18,
                "height": 18
              },
              "extendedEdges": {
                "right": 50
              }
            },
            {
              "inputs": [
                "select"
              ],
              "frame": {
                "x": 410,
                "y": 288,
                "width": 18,
                "height": 18
              },
              "extendedEdges": {
                "right": 50
              }
            },
            {
              "inputs": [
                "menu"
              ],
              "frame": {
                "x": 195,
                "y": 288,
                "width": 18,
                "height": 18
              },
              "extendedEdges": {
                "right": 50
              }
            },
            {
              "inputs": [
                "x"
              ],
              "frame": {
                "x": 562,
                "y": 229,
                "width": 47,
                "height": 47
              },
              "extendedEdges": {
                "top": 8,
                "bottom": 0,
                "left": 0,
                "right": 0
              }
            },
            {
              "inputs": [
                "y"
              ],
              "frame": {
                "x": 517,
                "y": 273,
                "width": 47,
                "height": 47
              },
              "extendedEdges": {
                "top": 0,
                "bottom": 0,
                "right": 0
              }
            },
            {
              "inputs": {
                "x": "touchScreenX",
                "y": "touchScreenY"
              },
              "frame": {
                "x": 361,
                "y": 24,
                "width": 259,
                "height": 194
              },
              "extendedEdges": {
                "top": 0,
                "bottom": 0,
                "left": 0,
                "right": 0
              }
            },
            {
              "frame": {
                "x": 245,
                "y": 336,
                "width": 22,
                "height": 22
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              },
              "inputs": [
                "toggleFastForward"
              ]
            },
            {
              "frame": {
                "x": 457,
                "y": 341,
                "width": 22,
                "height": 22
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              },
              "inputs": [
                "load"
              ]
            },
            {
              "frame": {
                "x": 351,
                "y": 340,
                "width": 22,
                "height": 22
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              },
              "inputs": [
                "save"
              ]
            }
          ],
          "mappingSize": {
            "width": 667,
            "height": 375
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
                "y": 24,
                "width": 259,
                "height": 194
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
                "x": 361,
                "y": 24,
                "width": 259,
                "height": 194
              }
            }
          ],
          "extendedEdges": {
            "top": 15,
            "bottom": 15,
            "left": 15,
            "right": 15
          }
        }
      },
      "edgeToEdge": {
        "portrait": {
          "assets": {
            "resizable": "iphone_edgetoedge_portrait.pdf"
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
                "y": 666,
                "width": 165,
                "height": 165
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
                "x": 344,
                "y": 716,
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
                "x": 285,
                "y": 777,
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
                "y": 610,
                "width": 50,
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
              "inputs": [
                "r"
              ],
              "frame": {
                "x": 360,
                "y": 608,
                "width": 50,
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
              "inputs": [
                "start"
              ],
              "frame": {
                "x": 149,
                "y": 610,
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
                "select"
              ],
              "frame": {
                "x": 217,
                "y": 612,
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
                "menu"
              ],
              "frame": {
                "x": 52,
                "y": 859,
                "width": 20,
                "height": 20
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
                "x": 221,
                "y": 713,
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
                "y": 656,
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
              "inputs": {
                "x": "touchScreenX",
                "y": "touchScreenY"
              },
              "frame": {
                "x": 15,
                "y": 317,
                "width": 384,
                "height": 288
              },
              "extendedEdges": {
                "top": 0,
                "bottom": 0,
                "left": 0,
                "right": 0
              }
            },
            {
              "frame": {
                "x": 120,
                "y": 860,
                "width": 22,
                "height": 22
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              },
              "inputs": [
                "toggleFastForward"
              ]
            },
            {
              "frame": {
                "x": 190,
                "y": 861,
                "width": 22,
                "height": 22
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              },
              "inputs": [
                "save"
              ]
            },
            {
              "frame": {
                "x": 241,
                "y": 860,
                "width": 22,
                "height": 22
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              },
              "inputs": [
                "load"
              ]
            }
          ],
          "screens": [
            {
              "inputFrame": {
                "x": 0,
                "y": 0,
                "width": 256,
                "height": 384
              },
              "outputFrame": {
                "x": 15,
                "y": 33,
                "width": 384,
                "height": 576
              }
            }
          ],
          "mappingSize": {
            "width": 414,
            "height": 896
          },
          "extendedEdges": {
            "top": 7,
            "bottom": 7,
            "left": 7,
            "right": 7
          }
        },
        "landscape": {
          "assets": {
            "resizable": "iphone_edgetoedge_landscape.pdf"
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
                "x": 59,
                "y": 264,
                "width": 136,
                "height": 136
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
                "x": 777,
                "y": 302,
                "width": 51,
                "height": 51
              },
              "extendedEdges": {
                "top": 0,
                "bottom": 0,
                "left": 0,
                "right": 30
              }
            },
            {
              "inputs": [
                "b"
              ],
              "frame": {
                "x": 728,
                "y": 351,
                "width": 51,
                "height": 51
              },
              "extendedEdges": {
                "top": 0,
                "left": 0,
                "right": 0
              }
            },
            {
              "inputs": [
                "l"
              ],
              "frame": {
                "x": 69,
                "y": 65,
                "width": 40,
                "height": 148
              },
              "extendedEdges": {
                "left": 50,
                "right": 0
              }
            },
            {
              "inputs": [
                "r"
              ],
              "frame": {
                "x": 788,
                "y": 65,
                "width": 40,
                "height": 148
              },
              "extendedEdges": {
                "left": 0,
                "right": 50
              }
            },
            {
              "inputs": [
                "start"
              ],
              "frame": {
                "x": 418,
                "y": 313,
                "width": 20,
                "height": 20
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
                "x": 533,
                "y": 315,
                "width": 20,
                "height": 20
              },
              "extendedEdges": {
                "right": 50
              }
            },
            {
              "inputs": [
                "menu"
              ],
              "frame": {
                "x": 292,
                "y": 313,
                "width": 20,
                "height": 20
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
                "x": 728,
                "y": 253,
                "width": 51,
                "height": 51
              },
              "extendedEdges": {
                "bottom": 0,
                "left": 0,
                "right": 0
              }
            },
            {
              "inputs": [
                "y"
              ],
              "frame": {
                "x": 679,
                "y": 302,
                "width": 51,
                "height": 51
              },
              "extendedEdges": {
                "top": 0,
                "bottom": 0,
                "right": 0
              }
            },
            {
              "inputs": {
                "x": "touchScreenX",
                "y": "touchScreenY"
              },
              "frame": {
                "x": 500,
                "y": 27,
                "width": 286,
                "height": 214
              },
              "extendedEdges": {
                "top": 0,
                "bottom": 0,
                "left": 0,
                "right": 0
              }
            },
            {
              "frame": {
                "x": 296,
                "y": 370,
                "width": 22,
                "height": 22
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              },
              "inputs": [
                "toggleFastForward"
              ]
            },
            {
              "frame": {
                "x": 533,
                "y": 371,
                "width": 22,
                "height": 22
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              },
              "inputs": [
                "load"
              ]
            },
            {
              "frame": {
                "x": 416,
                "y": 369,
                "width": 22,
                "height": 22
              },
              "extendedEdges": {
                "top": 5,
                "bottom": 5,
                "left": 5,
                "right": 5
              },
              "inputs": [
                "save"
              ]
            }
          ],
          "mappingSize": {
            "width": 896,
            "height": 414
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
                "x": 110,
                "y": 27,
                "width": 286,
                "height": 214
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
                "x": 500,
                "y": 27,
                "width": 286,
                "height": 214
              }
            }
          ],
          "extendedEdges": {
            "top": 15,
            "bottom": 15,
            "left": 15,
            "right": 15
          }
        }
      }
    }
  }
}


let skinObject = normalSkin;
let currentRep = skinObject.representations.iphone.edgeToEdge.portrait;

updateCanvas();

