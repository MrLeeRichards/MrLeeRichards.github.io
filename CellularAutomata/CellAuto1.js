const GRID_SIZE = 80;
const CELL_SIZE = 10;
const CHANGE = .075;
const KERNEL_RADIUS = 10;
const RULE_COUNT = 20;

let neighborhood = [];
let rules = [];

let cellsCurrent = [];
let cellsNext = [];

let colors = {}

function setup() {
    let cnv = createCanvas(GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);
    cnv.parent("divCanvasContainer");
    noStroke();

    // Generate starting grid and buffer
    for (let x = 0; x < GRID_SIZE; x++) {
        cellsCurrent.push([]);
        cellsNext.push([]);

        for (let y = 0; y < GRID_SIZE; y++) {
            cellsCurrent[x].push(Math.random());
            cellsNext[x].push(0);
        }
    }

    newRules();
    newColors();

    // Calculate Neighborhood
    for (let x = -KERNEL_RADIUS + 1; x < KERNEL_RADIUS; x++) {
        for (let y = -KERNEL_RADIUS + 1; y < KERNEL_RADIUS; y++) {
            if(dist(x,y,0,0) <= KERNEL_RADIUS && dist(x,y,0,0) >= KERNEL_RADIUS * .5) {
                neighborhood.push({
                    x: x,
                    y: y,
                    coeff : (KERNEL_RADIUS - dist(x,y,0,0)) / KERNEL_RADIUS
                });
            }
        }
    }
}

function draw() {
    let sum = 0;

    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            fill(lerpColor(colors.begin, colors.end, cellsCurrent[x][y]));
            square(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE);
        }
    }

    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            sum = 0;

            for (cell of neighborhood) {
                sum += cellsCurrent[mod(x + cell.x, GRID_SIZE)][mod(y + cell.y, GRID_SIZE)] * cell.coeff;
            }

            cellsNext[x][y] = lerp(cellsCurrent[x][y], activation(sum * CHANGE % 1), CHANGE);
        }
    }

    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            cellsCurrent[x][y] = cellsNext[x][y];
        }
    }

    // noLoop();
}

// Created this because I hate how % works by default with negative numbers
function mod(value, modval) {
    return value == 0 ? 0 :
           ((value / abs(value)) // Get sign
            *  (abs(value) % modval) // Bring into range
            + modval) // Make positive
            % modval;
}

function activation(index) {
    return lerp(rules[floor(index * RULE_COUNT)],
                rules[(floor(index * RULE_COUNT) + 1) % RULE_COUNT],
                index * RULE_COUNT - floor(index * RULE_COUNT));
}

function newRules() {
    for (let i = 0; i < RULE_COUNT; i++) {
        rules[i] = Math.random();
    }
}

function newColors() {
    colorMode(HSB, 360, 100, 100);
    colors.end = color(floor(Math.random() * 360), 50, 100);
    colors.begin = color((hue(colors.end) + 60) % 360, 100, 50);
    colorMode(RGB, 255, 255, 255);
}

function randomize() {
    newColors();
    newRules();

    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            cellsCurrent[x][y] = Math.random();
        }
    }
}