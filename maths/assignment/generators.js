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
            let fun = "f(x) = ";

            let a = rnd.nextInt(config.rangea.min, config.rangea.max);
            if (a === 0) a = 1;
            if (Math.abs(a) === 1) a = (a < 0) ? "-" : "";
            fun += a + "x";

            const b = rnd.nextInt(config.rangeb.min, config.rangeb.max);
            fun += (b > 0) ? "+" : "";
            fun += (b !== 0) ? b : "";

            return `\\(${fun}\\)`
        }
    ),
    "linear-frac": (rnd) => new Generator(
        rnd,
        { rangean: new cRange(0), rangead: new cRange(0), rangebn: new cRange(0), rangebd: new cRange(0) },
        function(rnd, config) {
            let fun = "f(x) = ";

            const aFrac = rnd.nextFrac(
                config.rangean.min, config.rangean.max,
                config.rangead.min, config.rangead.max
            );
            fun += (aFrac.numerator < 0) ? "-" : "";
            if (aFrac.numerator === 0) aFrac.numerator = 1;
            aFrac.numerator = Math.abs(aFrac.numerator);
            if (aFrac.numerator !== aFrac.denominator) {
                fun += `\\frac{${aFrac.numerator}}{${aFrac.denominator}}`
            }
            fun += "x";

            const bFrac = rnd.nextFrac(
                config.rangebn.min, config.rangebn.max,
                config.rangebd.min, config.rangebd.max
            );
            if (bFrac.numerator !== 0) {
                fun += (bFrac.numerator < 0) ? "-" : "+";
                bFrac.numerator = Math.abs(bFrac.numerator);
                if (bFrac.numerator !== bFrac.denominator) {
                    fun += `\\frac{${bFrac.numerator}}{${bFrac.denominator}}`
                } else {
                    fun += "1";
                }
            }

            return `\\(${fun}\\)`
        }
    ),
};