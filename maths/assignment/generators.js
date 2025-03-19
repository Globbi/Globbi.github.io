class cRange {
    constructor(defMin, defMax) {
        this.min = defMin;
        this.max = defMax;
    }
    set value(str) {
        const vals = str.split(",");
        if (vals.length == 1) {
            if (vals[0] && !isNaN(vals[0])) {
                this.min = Number(vals[0]);
                this.max = this.min;
            }
        } else {
            if (vals[0] && !isNaN(vals[0])) {
                this.min = Number(vals[0]);
            }
            if (vals[1] && !isNaN(vals[1])) {
                this.max = Number(vals[1]);
            }
        }
    }
}
class Generator {
    constructor(rnd, config, fun) {
        this._rnd = rnd;
        this._config = config;
        this._fun = fun;
    }
    configure(rawConfig) {
        for (let key in this._config) {
            if (key in rawConfig) {
                this._config[key].value = rawConfig[key];
            }
        }
    }
    next() {
        return this._fun(this._rnd, this._config);
    }
}

const generators = {
    "linear": (rnd) => new Generator(
        rnd,
        { rangea: new cRange(-10, 10), rangeb: new cRange(-10, 10) },
        function(rnd, config) {
            let fun = "f(x)=";

            const a = rnd.nextInt(config.rangea.min, config.rangea.max);
            if (!a.value) a.value = 1;
            fun += a.optSign + a.optValue + "x";

            const b = rnd.nextInt(config.rangeb.min, config.rangeb.max);
            if (b.value) fun += b.sign + b.value;

            return `\\(${fun}\\)`
        }
    ),
    "linear-frac": (rnd) => new Generator(
        rnd,
        { rangean: new cRange(0), rangead: new cRange(0), rangebn: new cRange(0), rangebd: new cRange(0) },
        function(rnd, config) {
            let fun = "f(x)=";

            const a = rnd.nextFrac(
                config.rangean.min, config.rangean.max,
                config.rangead.min, config.rangead.max
            );
            if (!a.num) a.rawNum = 1;
            fun += a.optSign + a.optFrac + "x";

            const b = rnd.nextFrac(
                config.rangebn.min, config.rangebn.max,
                config.rangebd.min, config.rangebd.max
            );
            if (b.num) fun += b.sign + b.frac;

            return `\\(${fun}\\)`
        }
    ),
    "linear-twice": (rnd) => new Generator(
        rnd,
        { rangea: new cRange(-10, 10), rangeb: new cRange(-10, 10) },
        function(rnd, config) {
            const linear = generators["linear"](rnd)._fun;
            let f = linear(rnd, config);
            f = "f(x)&=" + f.substring(7, f.length - 2);
            let g = linear(rnd, config);
            g = "g(x)&=" + g.substring(7, g.length - 2);

            return `\\(\\begin{align}${f} \\\\ ${g}\\end{align}\\)`
        }
    ),
    "quad": (rnd) => new Generator(
        rnd,
        { rangea: new cRange(-3, 3), rangeb: new cRange(-10, 10), rangec: new cRange(-10, 10) },
        function(rnd, config) {
            let fun = "f(x)=";

            const a = rnd.nextInt(config.rangea.min, config.rangea.max);
            if (!a.value) a.value = 1;
            fun += a.optSign + a.optValue + "x^2";

            const b = rnd.nextInt(config.rangeb.min, config.rangeb.max);
            if (b.value) fun += b.sign + b.optValue + "x";

            const c = rnd.nextInt(config.rangec.min, config.rangec.max);
            if (c.value) fun += c.sign + c.value;

            return `\\(${fun}\\)`
        }
    ),
};