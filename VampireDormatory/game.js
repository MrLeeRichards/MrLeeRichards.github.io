const FRESHMAN = 0;
const SOPHOMORE = 1;
const JUNIOR = 2;
const SENIOR = 3;
const GRADUATE = 4;
const classes = [
    "Freshman",
    "Sophomore",
    "Junior",
    "Senior",
    "Graduate"
]
const display = `
<div class="Student">
    <div class="Bio">
        <div>
            <div>Name:</div>
            <div>Victor</div>
        </div>
        <div>
            <div>Height:</div>
            <div>5 ft 6 in</div>
        </div>
        <div>
            <div>Class:</div>
            <div>Senior</div>
        </div>
    </div>
    <div class="Rumor">
        <div>Rumor</div>
        <div>
            I heard that the Vampire is taller than me.
        </div>
    </div>
    <div class="KillButton" onclick="kill(1)">Eliminate</div>
</div>`;

let game = {};

let students = [
    {
        name: "Victor",
        height: 5.02, // 5 ft 2 in
        class: FRESHMAN
    },
    {
        name: "Vanessa",
        height: 6.04,
        class: JUNIOR
    },
    {
        name: "Vance",
        height: 5.10,
        class: SOPHOMORE
    },
    {
        name: "Violet",
        height: 4.08,
        class: FRESHMAN
    },
    {
        name: "Marcus",
        height: 5.10,
        class: GRADUATE
    },
    {
        name: "Mario",
        height: 6.04,
        class: SENIOR
    },
    {
        name: "Matilda",
        height: 6.00,
        class: FRESHMAN
    },
    {
        name: "Morgana",
        height: 4.08,
        class: SENIOR
    },
    {
        name: "Peotr",
        height: 6.04,
        class: JUNIOR
    },
    {
        name: "Percival",
        height: 4.11,
        class: SOPHOMORE
    },
    {
        name: "Persephone",
        height: 5.03,
        class: GRADUATE
    },
    {
        name: "Priscilla",
        height: 6.04,
        class: GRADUATE
    },
    {
        name: "Rameses",
        height: 6.04,
        class: GRADUATE
    },
    {
        name: "Rafiel",
        height: 5.01,
        class: JUNIOR
    },
    {
        name: "Rose",
        height: 6.04,
        class: SENIOR
    },
    {
        name: "Ruby",
        height: 6.02,
        class: SOPHOMORE
    }
];

function shuffle() {
    return Math.random() - .5;
}

function getClassRumors(gameStudents, studentIndex) {
    let studentClass = students[studentIndex].class;
    let rumors = [];

    for (let classIndex = 0; classIndex < classes.length; classIndex++) {
        if (classIndex == studentClass) {
            // Only add rumor to the table if it implicates more than one living person
            if (gameStudents.filter(function(student) { return student.class == classIndex && student.alive }).length > 1) {
                rumors.push("I heard the vampire is a " + classes[classIndex] + ".");
            }
        } else {
            // Only add rumor to the table if it implicates more than one living person
            if (gameStudents.filter(function(student) { return student.class != classIndex && student.alive }).length > 1) {
                rumors.push("I heard the vampire is not a " + classes[classIndex] + ".");
            }
        }
    }

    return rumors;
}

function getHeightRumors(gameStudents, studentIndex) {
    let height = students[studentIndex].height;
    let rumors = [];

    for (let i = 0; i < gameStudents.length; i++) {
        if (
            gameStudents[i].height < height &&
            gameStudents.filter(function(student) { return student.height < height && student.alive }).length > 1
        ) {
            rumors.push("I heard the vampire is taller than " + gameStudents[i].name + ".");
        } else if (
            gameStudents[i].height > height &&
            gameStudents.filter(function(student) { return student.height > height && student.alive }).length > 1
        ) {
            rumors.push("I heard the vampire is shorter than " + gameStudents[i].name + ".");
        }
    }

    return rumors;
}

function getNameRumors(gameStudents, studentIndex) {
    let firstLetter = students[studentIndex].name[0];
    const letters = ["V","M","P","R"]
    let rumors = [];

    for (let letter of letters) {
        if (
            letter == firstLetter &&
            gameStudents.filter(function(student) { return student.name[0] == letter && student.alive }).length > 1
        ) {
            rumors.push("I heard the vampire's name begins with a '" + letter + "'.");
        } else if (
            letter != firstLetter &&
            gameStudents.filter(function(student) { return student.name[0] != letter && student.alive }).length > 1
        ) {
            rumors.push("I heard the vampire's name does not begin with a '" + letter + "'.");
        }
    }

    return rumors;
}

function getAllRumors(gameStudents, studentIndex) {
    let rumors = [];

    rumors = rumors.concat(getClassRumors(gameStudents, studentIndex));
    rumors = rumors.concat(getHeightRumors(gameStudents, studentIndex));
    rumors = rumors.concat(getNameRumors(gameStudents, studentIndex));
    rumors.sort(shuffle);
    
    return rumors;
}

function setupGame(gameStudentCount) {
    game.studentCount = gameStudentCount;
    students.sort(shuffle);
    game.students = students.slice(0, game.studentCount);

    for (let student of game.students) {
        student.alive = true;
        student.turned = false;
        student.rumor = "";
    }

    game.day = 0;
    game.vampireIndex = Math.floor(Math.random() * game.studentCount);

    // Make sure the vampire chooses someone other than themselves as the patsy
    game.patsyIndex = game.vampireIndex;
    while (game.patsyIndex == game.vampireIndex) {
        game.patsyIndex = Math.floor(Math.random() * game.studentCount);
    }
}

function heightText(height) {
    return Math.floor(height) + " ft " + Math.floor((height * 100) % 100) + " in";
}

function runDay() {
    // Generate vampire rumors
    game.vampireRumors = getAllRumors(game.students, game.vampireIndex);

    // Generate patsy rumors
    game.patsyRumors = getAllRumors(game.students, game.patsyIndex);

    let divLiving = document.getElementById("divLiving");
    let divDead = document.getElementById("divDead");

    divLiving.innerHTML = "";
    divDead.innerHTML = "";

    for (let i = 0; i < students.length; i++) {
        if (i == game.vampireIndex) {
            students[i].rumor = game.patsyRumors[i];
        } else {
            students[i].rumor = game.vampireRumors[i];
        }

        if (students[i].alive) {
            divLiving.innerHTML += `
<div class="Student">
    <div class="Bio">
        <div>
            <div>Name:</div>
            <div>${students[i].name}</div>
        </div>
        <div>
            <div>Height:</div>
            <div>${heightText(students[i].height)}</div>
        </div>
        <div>
            <div>Class:</div>
            <div>${classes[students[i].class]}</div>
        </div>
    </div>
    <div class="Rumor">
        <div>Rumor</div>
        <div>
            ${students[i].rumor}
        </div>
    </div>
    <div class="KillButton" onclick="kill(${i})">Kill!</div>
</div>`
        } else {
            divDead.innerHTML += `
<div class="${students[i].turned ? "DeadTurned" : "DeadStudent"}">
    <div class="Bio">
        <div>
            <div>Name:</div>
            <div>${students[i].name}</div>
        </div>
        <div>
            <div>Height:</div>
            <div>${heightText(students[i].height)}</div>
        </div>
        <div>
            <div>Class:</div>
            <div>${classes[students[i].class]}</div>
        </div>
    </div>
    <div class="RoleReveal">
        ${students[i].turned ? "Turned" : "Student"}
    </div>
</div>`
        }
    }
}

setupGame(5);
runDay();