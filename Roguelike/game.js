
const MAP_X = 64;
const MAP_Y = 48;
const SPRITE = 16;

class Building {
    static generate() {
        var map = [];

        for(var x = 0; x < MAP_X; x++){
            map[x] = [];

            for(var y = 0; y < MAP_Y; y++){
                map[x][y] = 0;
            }
        }

        var crawls = 5;
        
        var headX = int(MAP_X * 0.5);
        var headY = int(MAP_Y * 0.5);
        for(var i = 0; i < crawls; i++) {
            var trailLength = int(random(10, 30));
            var dx = random([random([1,-1]),0]);
            var dy = dx ? 0 : random([1,-1]);

            map[headX][headY] = int(random(4, 8));

            for(var j = 0; j < trailLength; j++) {
                headX = (headX + dx + MAP_X) % MAP_X;
                headY = (headY + dy + MAP_Y) % MAP_Y;

                map[headX][headY] = 3;
            }

            map[headX][headY] = int(random(7, 11));
        }

        for (var i = 0; i < 10; i++) {
            for(var x = 0; x < MAP_X; x++){
                for(var y = 0; y < MAP_Y; y++){
                    if (x + 1 < MAP_X && y + 1 < MAP_Y){
                        map[x][y] = max(map[x][y], map[x+1][y+1] - 1);
                    }
                    if (y + 1 < MAP_Y){
                        map[x][y] = max(map[x][y], map[x][y+1] - 1);
                    }
                    if (x + 1 < MAP_X){
                        map[x][y] = max(map[x][y], map[x+1][y] - 1);
                    }
                    if (x + 1 < MAP_X && y - 1 >= 0){
                        map[x][y] = max(map[x][y], map[x+1][y-1] - 1);
                    }
                    if (y - 1 >= 0){
                        map[x][y] = max(map[x][y], map[x][y-1] - 1);
                    }
                    if (x - 1 >= 0 && y - 1 >= 0){
                        map[x][y] = max(map[x][y], map[x-1][y-1] - 1);
                    }
                    if (x - 1 >= 0){
                        map[x][y] = max(map[x][y], map[x-1][y] - 1);
                    }
                    if (x - 1 >= 0 && y + 1 < MAP_Y){
                        map[x][y] = max(map[x][y], map[x-1][y+1] - 1);
                    }
                }
            }
        }

        for (var x = 0; x < MAP_X; x++) {
            for (var y = 0; y < MAP_Y; y++) {
                map[x][y] = map[x][y] > 1 ? 2 : map[x][y];

                map[x][y] = map[x][y] == 1 && (x == headX || y == headY) ? 3 : map[x][y];
            }
        }

        return map;
    }
}

class Floor {
    constructor() {
        this.back = createGraphics(MAP_X * SPRITE, MAP_Y * SPRITE);
        this.sprite = createGraphics(MAP_X * SPRITE, MAP_Y * SPRITE);
        this.front = createGraphics(MAP_X * SPRITE, MAP_Y * SPRITE);

        this.back.noStroke();
        this.sprite.noStroke();
        this.front.noStroke();

        this.exploredMap = [];
        this.falloffMap = [];
        this.barrierMap = [];

        for(var x = 0; x < MAP_X; x++) {
            this.exploredMap[x] = [];
            this.falloffMap[x] = [];
            this.barrierMap[x] = [];

            for(var y = 0; y < MAP_Y; y++) {
                this.exploredMap[x][y] = 0;
                this.falloffMap[x][y] = .05;
                this.barrierMap[x][y] = false;
            }
        }

        for (var x = 0; x < MAP_X; x++) {
            for (var y = 0; y < MAP_Y; y++) {
                this.back.fill(50, 40, 20);
                this.back.rect(x * SPRITE, y * SPRITE, SPRITE, SPRITE);
                this.front.fill(noise(x, y, 2) * 255, noise(x, y, 3) * 126 + 126, 20);
                this.front.rect(x * SPRITE, y * SPRITE, SPRITE, SPRITE);

                if (noise(x * .1, y * .1) > .4) {
                    this.falloffMap[x][y] = random(.05, .07);
                    this.drawTile(random([5,6,7]),0,x,y);
                } else {
                    this.falloffMap[x][y] = random(.1, .3);;
                    this.drawTile(random([0,1,2,3,4,5]),1,x,y);
                }
            }
        }

        var map = Building.generate();

        for (var x = 0; x < MAP_X; x++) {
            for (var y = 0; y < MAP_Y; y++) {
                if (map[x][y] == 1) {
                    this.barrierMap[x][y] = true;
                    this.falloffMap[x][y] = 1.0;

                    this.back.fill(50);
                    this.back.rect(x * SPRITE, y * SPRITE, SPRITE, SPRITE);
                    this.front.fill(150);
                    this.front.rect(x * SPRITE, y * SPRITE, SPRITE, SPRITE);

                    this.drawTile(10,17,x,y);
                } else if (map[x][y] == 2) {
                    this.falloffMap[x][y] = .1;

                    if (noise(x * .3,y * .3,10) > .5) {
                        this.drawTile(2,0,x,y);
                    } else {
                        this.sprite.fill(0);
                        this.sprite.rect(x * SPRITE, y * SPRITE, SPRITE, SPRITE);
                    }

                    this.back.fill(80, 60, 0);
                    this.back.rect(x * SPRITE, y * SPRITE, SPRITE, SPRITE);
                    this.front.fill(100, 80, 20);
                    this.front.rect(x * SPRITE, y * SPRITE, SPRITE, SPRITE);

                }
            }
        }
    }

    drawTile(sheetX, sheetY, x, y) {
        this.sprite.image(tileSet,
            x * SPRITE, y * SPRITE, //placement
            SPRITE, SPRITE, //size
            sheetX * SPRITE, sheetY * SPRITE, //source location
            SPRITE, SPRITE // source size
        ); 
    }

    draw() {
        blendMode(BLEND);
        image(this.sprite,0,0);
        blendMode(MULTIPLY);
        image(this.front,0,0);
        blendMode(LIGHTEST);
        image(this.back,0,0);
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

let tileSet;
let visibilityMap = [];

let back;
let sprite;
let front;

let player;
let floor;

function preload() {
    tileSet = loadImage("monochrome_packed.png");
}

function setup() {
    createCanvas(MAP_X * SPRITE, MAP_Y * SPRITE);

    for (var x = 0; x < MAP_X; x++) {
        visibilityMap[x] = [];

        for (var y = 0; y < MAP_Y; y++) {
            visibilityMap[x][y] = 0;
        }
    }

    player = new Player();
    floor = new Floor(sprite, front, back);
    
    computeVisibility();

    noiseDetail(3, .75);
    noStroke();
}

function draw() {
    floor.draw();

    player.draw();
    drawFog();
}

function keyPressed() {
    if (key == 'w' && player.y - 1 >= 0 && !floor.barrierMap[player.x][player.y - 1]) {
        player.y += -1;
    }
    else if (key == 's' && player.y + 1 < MAP_Y && !floor.barrierMap[player.x][player.y + 1]) {
        player.y += 1;
    }
    else if (key == 'a' && player.x - 1 >= 0 && !floor.barrierMap[player.x - 1][player.y]) {
        player.x += -1;
    }
    else if (key == 'd' && player.x + 1 < MAP_X && !floor.barrierMap[player.x + 1][player.y]) {
        player.x += 1;
    }

    computeVisibility();
}

function drawTile(sheetX, sheetY, x, y) {
    image(tileSet,
        x * 16, y * 16, //placement
        16, 16, //size
        sheetX * 16, sheetY * 16, //source location
        16, 16 // source size
    ); 
}

function computeVisibility() {
    for (var x = 0; x < MAP_X; x++) {
        for (var y = 0; y < MAP_Y; y++) {
            visibilityMap[x][y] = 0;
        }
    }

    updateVisibility(1.0, player.x, player.y);
}

function updateVisibility(visibility, x, y) {
    visibilityMap[x][y] = max(visibilityMap[x][y], visibility);
    floor.exploredMap[x][y] = max(floor.exploredMap[x][y], visibility);

    var newVisibility = visibility - floor.falloffMap[x][y]

    if (x - 1 >= 0 && newVisibility > visibilityMap[x - 1][y]) {
        updateVisibility(newVisibility, x - 1, y);
    }
    if (x + 1 < MAP_X && newVisibility > visibilityMap[x + 1][y]) {
        updateVisibility(newVisibility, x + 1, y);
    }
    if (y - 1 >= 0 && newVisibility > visibilityMap[x][y - 1]) {
        updateVisibility(newVisibility, x, y - 1);
    }
    if (y + 1 < MAP_Y && newVisibility > visibilityMap[x][y + 1]) {
        updateVisibility(newVisibility, x, y + 1);
    }
}

function drawFog() {
    const HIDDEN = color(0);
    const SEEN = color(50, 50, 255);
    const VISIBLE = color(255);
    blendMode(MULTIPLY);
    for (var x = 0; x < MAP_X; x++) {
        for (var y = 0; y < MAP_Y; y++) {
            fill(lerpColor(lerpColor(HIDDEN, SEEN, floor.exploredMap[x][y]), VISIBLE, visibilityMap[x][y]));
            rect(x * 16, y * 16, 16, 16);
        }
    }
}