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

class rNum {
    constructor(value) {
        this.raw = value;
    }
    get sign() {
        return this.raw < 0 ? "-" : "+";
    }
    get optSign() {
        return this.raw < 0 ? "-" : "";
    }
    get value() {
        return Math.abs(this.raw);
    }
    get optValue() {
        return (this.value === 1) ? "" : this.value;
    }
}
class rFrac {
    constructor(n, d) {
        this.rawNum = Math.sign(n) * Math.sign(d) * n;
        this.denom = Math.abs(d);
    }
    get num() {
        return Math.abs(this.rawNum);
    }
    get sign() {
        return this.rawNum < 0 ? "-" : "+";
    }
    get optSign() {
        return this.rawNum < 0 ? "-" : "";
    }
    get frac() {
        return (this.num === this.denom) ? 1 : `\\frac{${this.num}}{${this.denom}}`;
    }
    get optFrac() {
        const f = this.frac;
        return (f === 1) ? "" : f;
    }
}

// random number generator
function random(seed) {
    return {
        _generator: _splitmix32(seed),
        next: function() {
            return new rNum(this._generator());
        },
        nextInt: function(from, to) {
            return new rNum(Math.trunc(this._generator() * (to - from)) + from);
        },
        nextFloat: function(from, to) {
            return new rNum(Math.round(this._generator() * (to - from) * 100 + from * 100) / 100);
        },
        nextFrac: function(fromNum, toNum, fromDenom, toDenom) {
            const n = this.nextInt(fromNum, toNum);
            const d = this.nextInt(
                Math.max(Math.max(0, fromDenom), Math.abs(n.raw)),
                Math.max(Math.max(0, toDenom), Math.abs(n.raw))
            );
            return new rFrac(n.raw, d.raw);
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
}

document.addEventListener("DOMContentLoaded", _main, false);