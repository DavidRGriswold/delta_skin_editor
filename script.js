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


/* set up listeners */

gameTypeChoice.addEventListener("change",changeGameType);
canvasSelection.addEventListener("change",changeCanvasType);






/* Event listener functions */

function changeGameType(e) {
    let g = gameTypeChoice.selectedOptions.item(0).id;
    screenDiv.className = g;
}

function changeCanvasType(e) {
    let g = canvasSelection.selectedOptions.item(0).id;
    phoneCanvas.className = g;
}