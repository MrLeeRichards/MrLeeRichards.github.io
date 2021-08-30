let map = [];
let visibilityMap = [];
let exploredMap = [];
const MAP_X = 64;
const MAP_Y = 48;

let tileSet;

class Grass {
    draw(x,y) {
        var tileX = min(int(noise(x * 0.2,y * 0.2) * 3) + 5,7);
        var tileY = 0;
    
        blendMode(BLEND);
        drawTile(tileX, tileY, x, y);
    
        blendMode(MULTIPLY);
        fill(noise(x * 0.1, y * 0.1, 2) * 126 + 64, noise(x * 0.1, y * 0.1, 3) * 126 + 126, 50);
        rect(x * 16, y * 16, 16, 16);
        blendMode(LIGHTEST);
        fill(80,40,20);
        rect(x * 16, y * 16, 16, 16);
        blendMode(BLEND);
    }
}

class Wall {
    constructor(brick, mortar) {
        this.brick = brick;
        this.mortar = mortar;
        
        this.isBarrier = true;
        this.isObscure = true;
    }

    draw(x,y) {
        if (noise(x,y,5) > .3) {
            var tileX = 10;
            var tileY = 17;
        }
        else
        {
            var tileX = 6;
            var tileY = 13;
        }
    
        blendMode(BLEND);
        drawTile(tileX, tileY, x, y);

        blendMode(MULTIPLY);
        fill(this.brick);
        rect(x * 16, y * 16, 16, 16);
        blendMode(LIGHTEST);
        fill(this.mortar);
        rect(x * 16, y * 16, 16, 16);
        blendMode(BLEND);
    }
}

class Tree {
    constructor() {
        this.isObscure = true;
    }

    draw(x,y) {
        var tileX = min(int(noise(x,y) * 6),5);
        var tileY = 1;

        blendMode(BLEND);
        drawTile(tileX, tileY, x, y);

        blendMode(MULTIPLY);
        fill(noise(x, y, 2) * 126 + 64, noise(x, y, 3) * 126 + 126, 50);
        rect(x * 16, y * 16, 16, 16);
        blendMode(LIGHTEST);
        fill(80,40,20);
        rect(x * 16, y * 16, 16, 16);
        blendMode(BLEND);
    }
}

class Player {
    constructor() {
        this.x = int(random(0,MAP_X));
        this.y = int(random(0,MAP_Y));
    }

    draw() {
        drawTile(26, 0, this.x, this.y);
    }
}

let player;

function setup() {
    for (var x = 0; x < MAP_X; x++) {
        map[x] = [];
        visibilityMap[x] = [];
        exploredMap[x] = [];

        for (var y = 0; y < MAP_Y; y++) {
            if (noise(x * .2, y * .2, 10) > .4) {
                map[x][y] = new Grass();
            } else {
                map[x][y] = new Tree();
            }
            visibilityMap[x][y] = 0;
            exploredMap[x][y] = 0;
        }
    }

    testWalls();

    player = new Player();
    
    updateVisibility();

    noiseDetail(3, .75);
    tileSet = loadImage("monochrome_transparent_packed.png");
    noStroke();
    createCanvas(1024,768);
}

function drawTile(sheetX, sheetY, x, y) {
    image(tileSet,
        x * 16, y * 16, //placement
        16, 16, //size
        sheetX * 16, sheetY * 16, //source location
        16, 16 // source size
    ); 
}

function draw() {
    background(0);
    for(var x = 0; x < MAP_X; x++) {
        for(var y = 0; y < MAP_Y; y++) {
            map[x][y].draw(x,y);
        }
    }

    player.draw();
    drawFog();
}

function keyPressed() {
    if (key == 'w' && player.y - 1 >= 0 && !map[player.x][player.y - 1].isBarrier) {
        player.y += -1;
    }
    else if (key == 's' && player.y + 1 < MAP_Y && !map[player.x][player.y + 1].isBarrier) {
        player.y += 1;
    }
    else if (key == 'a' && player.x - 1 >= 0 && !map[player.x - 1][player.y].isBarrier) {
        player.x += -1;
    }
    else if (key == 'd' && player.x + 1 < MAP_X && !map[player.x + 1][player.y].isBarrier) {
        player.x += 1;
    }

    updateVisibility();
}

function testWalls() {
    for (var i = 0; i < 50; i++) {
        var x = int(random(0, MAP_X));
        var y = int(random(0, MAP_Y));
        var dx = random([1,0]) * random([1,-1]);
        var dy = dx ? 0 : random([1,-1]);

        for(var j = 0; j < 10; j++) {
            if (x >= 0 && x < MAP_X && y >= 0 && y < MAP_Y) {
                map[x][y] = new Wall(color(126), color(32));
            }
            
            x += dx;
            y += dy;
        }
    }
}

function updateVisibility() {
    const FALLOFF = 0.1;

    for (var x = 0; x < MAP_X; x++) {
        for (var y = 0; y < MAP_Y; y++) {
            visibilityMap[x][y] = 0;
        }
    }

    visibilityMap[player.x][player.y] = 1;
    visibilityMap[min(player.x + 1, MAP_X)][player.y] = 1;
    visibilityMap[max(player.x - 1, 0)][player.y] = 1;
    visibilityMap[player.x][min(player.y + 1, MAP_Y)] = 1;
    visibilityMap[player.x][max(player.y - 1, 0)] = 1;

    for (var i = 0; i < (1 / FALLOFF); i++) {
        for (var x = 0; x < MAP_X; x++) {
            for (var y = 0; y < MAP_Y; y++) {
                if (y + 1 < MAP_Y && !map[x][y+1].isObscure) {
                    visibilityMap[x][y] = max(visibilityMap[x][y], visibilityMap[x][y+1] - FALLOFF);
                }
                if (y - 1 >= 0 && !map[x][y-1].isObscure) {
                    visibilityMap[x][y] = max(visibilityMap[x][y], visibilityMap[x][y-1] - FALLOFF);
                }
                if (x + 1 < MAP_X && !map[x+1][y].isObscure) {
                    visibilityMap[x][y] = max(visibilityMap[x][y], visibilityMap[x+1][y] - FALLOFF);
                }
                if (x - 1 >= 0 && !map[x-1][y].isObscure) {
                    visibilityMap[x][y] = max(visibilityMap[x][y], visibilityMap[x-1][y] - FALLOFF);
                }
            }
        }
    }

    for (var x = 0; x < MAP_X; x++) {
        for (var y = 0; y < MAP_Y; y++) {
            exploredMap[x][y] = max(exploredMap[x][y], visibilityMap[x][y]);
        }
    }
}

function drawFog() {
    const HIDDEN = color(0);
    const SEEN = color(75, 20, 200);
    const VISIBLE = color(255);
    blendMode(MULTIPLY);
    for (var x = 0; x < MAP_X; x++) {
        for (var y = 0; y < MAP_Y; y++) {
            fill(lerpColor(lerpColor(HIDDEN, SEEN, exploredMap[x][y]), VISIBLE, visibilityMap[x][y]));
            rect(x * 16, y * 16, 16, 16);
        }
    }
}