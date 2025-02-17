
// This script uses p5js noise as an activation function for the cellular automata

let cellsRed = [];
let cellsGreen = [];
let cellsBlue = [];
let bufferRed = [];
let bufferGreen = [];
let bufferBlue = [];
let currRow = 0;
let gradient, centralDark, centralLight;
let xDim, yDim;
let ruleCoord;

const NEIGHBORHOOD = 200;
const SCALING = 1 / NEIGHBORHOOD;
const RATE_OF_CHANGE = 0.02;
const RULE_SHIFT = 0.00005;

function setup() {
    createCanvas(screen.width, screen.height);
    noStroke();
    noiseDetail(3,.5);
    colorMode(RGB, 1,1,1);

    xDim = pixelDensity() * width;
    yDim = pixelDensity() * height;

    for (let i = 0; i < xDim; i++) {
        cellsRed.push(i / xDim);
        cellsGreen.push(i / xDim);
        cellsBlue.push(i / xDim);

        bufferRed.push(0);
        bufferGreen.push(0);
        bufferBlue.push(0);
    }

    gradient = [
        [color("black"), 0],
        [color("white"), 1]
    ]
}

function draw() {
    for (let i = 0; i < xDim; i++) {
        fill(color(punchUp(cellsRed[i]), punchUp(cellsGreen[i]), punchUp(cellsBlue[i])));
        rect(i,currRow,1,1);
    }
    
    if (currRow < yDim - 1) {
        currRow++;
    } else {
        let currentCanvas = get();
        image(currentCanvas, 0, -1);
    }

    for (let i = 0; i < xDim; i++) {
        let sum = cellsRed[i] + cellsGreen[i] + cellsBlue[i];

        for (let x = 1; x <= NEIGHBORHOOD; x++) {
            sum += (cellsRed[(i - x + xDim) % xDim] + cellsRed[(i + x) % xDim]
                    + cellsGreen[(i - x + xDim) % xDim] + cellsGreen[(i + x) % xDim]
                    + cellsBlue[(i - x + xDim) % xDim] + cellsBlue[(i + x) % xDim]) * min(x, NEIGHBORHOOD - x) * SCALING;
        }
        bufferRed[i] = lerp(cellsRed[i], noise(sum, (millis() * RULE_SHIFT), 1), RATE_OF_CHANGE);
        bufferGreen[i] = lerp(cellsGreen[i], noise(sum, (millis() * RULE_SHIFT), 2), RATE_OF_CHANGE);
        bufferBlue[i] = lerp(cellsBlue[i], noise(sum, (millis() * RULE_SHIFT), 3), RATE_OF_CHANGE);
    }

    for (let i = 0; i < xDim; i++) {
        cellsRed[i] = bufferRed[i];
        cellsGreen[i] = bufferGreen[i];
        cellsBlue[i] = bufferBlue[i];
    }
}

function punchUp(v) {
    return v * .2
    + constrain(v * 2 - 0.5,0,1)  * .2
    + constrain(v * 3 - 1,0,1)  * .2
    + constrain(v * 4 - 1.5,0,1)  * .2
    + constrain(v * 5 - 2.5,0,1)  * .2
}