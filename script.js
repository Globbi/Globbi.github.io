// seeded random number generator
function splitmix32(a) {
    return function() {
        a |= 0;
        a = a + 0x9e3779b9 | 0;
        let t = a ^ a >>> 16;
        t = Math.imul(t, 0x21f0aaad);
        t = t ^ t >>> 15;
        t = Math.imul(t, 0x735a2d97);
        return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
    }
}

// parses the query parameters
function parseConfig() {
    const config = { seed: null, assignment: null };
    const query = window.location.search.substring(1);
    const vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        const pair = vars[i].split("=");
        const key = decodeURIComponent(pair[0]);
        switch (key) {
            case "assignment":
                config.assignment = decodeURIComponent(pair[1]);
                break;
            case "seed":
                const seed = Number(decodeURIComponent(pair[1]));
                if (!isNaN(seed)) {
                    config.seed = seed;
                }
                break;
            default:
                console.warn("unknown query parameter key '%s'.", key)
                break;
        }
    }
    return config;
}

// create a seed
function createSeed() {
    return Math.floor(Math.random() * 10000);
}

// predefined set of assignments
const assignments = {
    linear_null: {
        title: "Bestimme die Nullpunkte der linearen Funktionen (x- und y-Achse)",
        generator: function(prng) {
            const signA = prng() > 0.5 ? 1 : -1;
            const a = Math.floor(prng()*9) + 1;

            signB = prng() > 0.5 ? "+" : "-";
            const b = Math.floor(prng()*10);
            return `\\(f(x) = ${signA * a}x ${signB} ${b}\\)`
        }
    }
};

function loadAssignment(config) {
    if (config.seed === null) {
        // Seed missing -> create new
        config.seed = createSeed();
        const url = new URL(location);
        url.searchParams.set("seed", config.seed);
        window.history.replaceState({}, "", url);
    }

    // set seed for display
    const seedText= document.querySelector("#seed");
    seedText.innerHTML = "#" + config.seed;
    seedText.addEventListener("click", () => {
        if (confirm("Neuen Seed generieren?")) {
            const url = new URL(location);
            url.searchParams.delete("seed");
            window.location.href = url;
        }
    });

    // get assignment configuration
    const assignment = assignments[config.assignment];

    // set assignment title
    const titleText = document.querySelector("#title-text");
    titleText.innerHTML = assignment.title;

    // generate assignments
    const prng = splitmix32(config.seed);
    const generator = assignment.generator;

    const tasks = document.querySelector(".tasks");
    const codePointA = "a".codePointAt(0);
    const taskTemplate = document.querySelector("#task-template");
    for (let i = 0; i < 12; i++) {
        const task = taskTemplate.content.cloneNode(true);
        // set label
        const label = task.querySelector(".label");
        label.innerHTML = String.fromCodePoint(codePointA + i) + ")";
        // set math
        const math = task.querySelector(".math");
        math.innerHTML = generator(prng);
        // append child
        tasks.appendChild(task);
    }

    if (!!window.MathJax) {
        MathJax.typeset();
    }
}

function listAssignments() {
    const titleText = document.querySelector("#title-text");
    titleText.innerHTML = "Waehle einen Aufgabe aus...";

    const tasks = document.querySelector(".tasks");
    for (let key in assignments) {
        const assignment = assignments[key];
        const link = document.createElement("a");
        const url = new URL(location);
        url.searchParams.append("assignment", key)
        link.href = url;
        link.innerHTML = assignment.title;
        tasks.append(link);
    }
}

function main() {
    const config = parseConfig();

    if (config.assignment !== null) {
        loadAssignment(config);
    } else {
        listAssignments();
    }
}

document.addEventListener("DOMContentLoaded", main, false);