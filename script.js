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
let downloadButton = document.querySelector("#downloadButton");
let downloadJSONButton = document.querySelector("#downloadJSON");
/* set up listeners */

gameTypeChoice.addEventListener("change", updateSkinObject);
canvasSelection.addEventListener("change", updateSkinObject);
controlArea.addEventListener("dragover", allowDrop);
buttonBox.addEventListener("dragover", allowDrop);
controlArea.addEventListener("drop", dropInControlArea);
buttonBox.addEventListener("drop",dropInButtonBox);
downloadButton.addEventListener("click",downloadPDF);
downloadJSONButton.addEventListener("click",downloadJSON);
document.querySelectorAll(".buttonBorder").forEach(
  (el) => {
    el.setAttribute("draggable", "true");
    el.addEventListener("dragstart", startButtonDrag);
  });

document.querySelectorAll(".button").forEach(
  (el) => {
    el.setAttribute("draggable", "false");
  });

async function downloadPDF(ev) {
  let currentPDF = await createPDF(controlArea);
  let name = currentRep.assets.resizable;
  currentPDF.save(name);
}

function downloadJSON(ev) {
  let json = JSON.stringify(skinObject);
  let blob = new Blob([json],{type:"text/plan;charset=utf-8"});
  saveAs(blob,"info.json");
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
  let ourOption = gameTypeChoice.options.namedItem(gtype);
  ourOption.selected = true;
  // read the currentRep and put the buttons in the right place
  /** @type HTMLDivElement */
  let img;
  for (let button of currentRep.items) {
    if (button.thumbstick) {
      //thumbstick
      img = document.querySelector("#stick").parentElement;
    } else if (button.inputs["up"]) {
      //dpad
      img = document.querySelector("#dpad").parentElement;
    } else {
      img = document.querySelector("#" + button.inputs[0] + "Button").parentElement;
    }
    controlArea.appendChild(img);
    img.style.position = "absolute";
    img.style.width = button.frame.width + "px";
    img.style.height = "" + button.frame.height + "px";
    img.style.top = (button.frame.y) + "px";
    img.style.left = (button.frame.x) + "px";
  }

  //mapping area
  controlArea.style.width = currentRep.mappingSize.width + "px";
  controlArea.style.height = currentRep.mappingSize.height + "px";

}

/** updates the skin object to fit whatever is input */
function updateSkinObject() {
  //name
  skinObject.name = skinNameTextBox.value;
  //id
  skinObject.identifier = skinIDTextBox.value;
  //game type
  let g = gameTypeChoice.selectedOptions.item(0).id;
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
  let ox = Number(ev.dataTransfer.getData("offsetX"));
  let oy = Number(ev.dataTransfer.getData("offsetY"));
  let button = document.querySelector("#" + sourceID);
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
  button.style.top="";
  button.style.left="";
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
    item.frame = {};
    item.frame.x = button.offsetLeft;
    item.frame.y = button.offsetTop;
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
  area.classList.add("print");
  const canvas = await html2canvas(area);
    var imgData = canvas.toDataURL('img/png');
    var doc = new jsPDF({orientation:'l',unit:'px',format:[area.offsetWidth,area.offsetHeight]});
    doc.addImage(imgData,'PNG',0,0);
    area.classList.remove("print");
    return doc;
}






/** Default Skin Object */

let skinObject = {
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
                width: 106,
                height: 40
              }
            },
            {
              inputs: [
                "r"
              ],
              frame: {
                x: 612,
                y: 18,
                width: 106,
                height: 40
              }
            },
            {
              inputs: [
                "start"
              ],
              frame: {
                x: 381,
                y: 372,
                width: 76,
                height: 24
              }
            },
            {
              inputs: [
                "select"
              ],
              frame: {
                x: 279,
                y: 372,
                width: 76,
                height: 24
              }
            },
            {
              inputs: [
                "menu"
              ],
              frame: {
                x: 279,
                y: 18,
                width: 76,
                height: 24
              }
            },
            {
              inputs: [
                "toggleFastForward"
              ],
              frame: {
                x: 381,
                y: 18,
                width: 76,
                height: 24
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
                width: 106,
                height: 40
              }
            },
            {
              inputs: [
                "r"
              ],
              frame: {
                x: 750,
                y: 18,
                width: 106,
                height: 40
              }
            },
            {
              inputs: [
                "start"
              ],
              frame: {
                x: 461,
                y: 372,
                width: 76,
                height: 24
              }
            },
            {
              inputs: [
                "select"
              ],
              frame: {
                x: 359,
                y: 372,
                width: 76,
                height: 24
              }
            },
            {
              inputs: [
                "menu"
              ],
              frame: {
                x: 359,
                y: 18,
                width: 76,
                height: 24
              }
            },
            {
              inputs: [
                "toggleFastForward"
              ],
              frame: {
                x: 461,
                y: 18,
                width: 76,
                height: 24
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

let backupItems = {

}
let currentRep = skinObject.representations.iphone.edgeToEdge.portrait;

updateCanvas();
