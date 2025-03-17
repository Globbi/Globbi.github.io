// seeded random number generator
function _splitmix32(a) {
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

// random number generator
function random(seed) {
    return {
        _generator: _splitmix32(seed),
        next: function() {
            return this._generator();
        },
        nextInt: function(from, to) {
            return Math.trunc(this._generator() * (to - from)) + from;
        },
        nextFloat: function(from, to) {
            return Math.round(this._generator() * (to - from) * 100 + from * 100) / 100;
        },
        nextFrac: function(fromNum, toNum, fromDenom, toDenom) {
            const frac = {};
            frac.numerator = this.nextInt(fromNum, toNum);
            frac.denominator = this.nextInt(
                Math.max(Math.max(0, fromDenom), Math.abs(frac.numerator)),
                Math.max(Math.max(0, toDenom), Math.abs(frac.numerator))
            );
            return frac;
        }
    }
}


// loads configs
function loadConfig() {
    const config = {};

    // load from data attributes
    const nodeData = document.querySelector("#assignment").dataset;
    for (let key in nodeData) {
        config[key] = nodeData[key];
    }

    // load from query parameters
    const query = window.location.search.substring(1);
    const vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        const pair = vars[i].split("=");
        const key = decodeURIComponent(pair[0]);
        config[key] = decodeURIComponent(pair[1]);
    }

    return config;
}

// generates a seed and attaches it to the url
function generateSeed() {
    // Seed missing -> create new
    const seed = Math.floor(Math.random() * 10000);
    const url = new URL(location);
    url.searchParams.set("seed", seed);
    window.history.replaceState({}, "", url);
    return seed;
}

// generates assignments into the page
function generateAssignments(generator, count) {
    // generate assignments
    const tasks = document.querySelector("#tasks");
    const taskTemplate = document.querySelector("#task-template");
    const codePoint = "a".codePointAt(0);
    for (let i = 0; i < count; i++) {
        const task = taskTemplate.content.cloneNode(true);
        // set label
        const label = task.querySelector(".label");
        label.innerHTML = String.fromCodePoint(codePoint + i) + ")";
        // set math
        const math = task.querySelector(".math");
        math.innerHTML = generator.next();
        // append child
        tasks.appendChild(task);
    }

    if (!!window.MathJax) {
        MathJax.typeset();
    }
}

// main function
function _main() {
    const seedText = document.querySelector("#seed");
    seedText.addEventListener("click", () => {
        if (confirm("Neuen Seed generieren?")) {
            const url = new URL(location);
            url.searchParams.delete("seed");
            window.location.href = url;
        }
    });

    // load configuration
    const config = loadConfig();

    // handle seed
    if (!config.seed || isNaN(config.seed)) {
        config.seed = generateSeed();
    }
    seedText.innerHTML = "#" + config.seed;

    // prime the pseudo-rng
    const rnd = random(config.seed);

    // prime the generator
    const generator = generators[config.gen](rnd);
    generator.configure(config);

    // generate assignments
    generateAssignments(generator, config.count)

    // hide explanation
    explanationplus.addEventListener("click", () => {
        explanation.hidden = !explanation.hidden;
    });
    explanation.hidden = true;
}

document.addEventListener("DOMContentLoaded", _main, false);