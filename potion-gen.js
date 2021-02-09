var hash = require("object-hash");
var faker = require("faker");
var colourMod = require("./ColorGeneratorModule.js");

var og = require("./caco-ingredients.json");
var originalDataSet = JSON.parse(JSON.stringify(og))

var effects = require("./effects.json")

// var originalDataSet = JSON.parse(data)
// eslint-disable-next-line
Array.prototype.unique = function() {
    return [...new Set(this)];
};
// eslint-disable-next-line
Array.prototype.average = function() {
    return this.reduce((p, c) => p + c, 0) / this.length;
};
// eslint-disable-next-line
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
// eslint-disable-next-line
Array.prototype.randomElement = function() {
    return this[Math.floor(random() * this.length)];
};

var random = () => faker.random.number() / 100000;

var generateColour = () => ({
    r: Math.floor(random() * Math.floor(255)),
    g: Math.floor(random() * Math.floor(255)),
    b: Math.floor(random() * Math.floor(255)),
    a: +random().toFixed(2)
});

var mixColour = (a, b) => {
    if (!a || !b) return a || b;
    return {
        r: (a.r + b.r) / 2,
        g: (a.g + b.g) / 2,
        b: (a.b + b.b) / 2,
        a: (a.a + b.a) / 2
    }
};


var logColour = (colour, message = "{}{}{Colour message}{}{}") => console.log(`%c ${message} `, `background: ${colourMod.rgbToHex(colour)}; color: #fff`);

var options = {
    minimumCommonEffects: 2,
    maxProductionEffects: 3,
    maxComponents: 4,
    ratings: [
        "very weak",
        "weak",
        "mid-strength",
        "potent",
        "strong",
        "very strong",
        "perfect"
    ],
    precursorColour: {
        r: 154,
        g: 18,
        b: 179,
        a: 1
    }
};

//full effect list is too big to keep here

var substanceProperties = [
    // "Acidic",
    // "Basic",
    // "Damaged by acid",
    // "Damaged by base",
    "Expires quickly",
    // "Exothermic",
    "Thick potion",
    "Thin potion",
    "Solid, light and brittle",
    "Solid, hard and chalky",
    "Gooey, extremely thick jelly",
    // "Endothermic",
    "Flamible",
    "Oxadising",
    "Chaotic/mutative",
    "Vulnrable to light or fire",
    "Removes all other positive effects",
    "Magnetic",
    "Exomagic, never stops reacting",
    "Endomagic, stops all weaker effects from working"
];

var productionRequirements = [
    "Disolve in water",
    "crunsh",
    "grind",
    "heat",
    "chill",
    "Shake in a silver vessel",
    "stew for 3 nights",
    "disolve in acid",
    "ferment for 1 session",
    "boil",
    "freeze",
    "requires the presence of chaos",
    "stir under a full moon",
    "Distil",
    "philosophers stone"
];

var defaults = {
    baseData: originalDataSet,
    effects: effects,
    substanceProperties: substanceProperties,
    productionRequirements: productionRequirements,
    options: options
};

class Component {

    constructor(name, effects, colour, properties, type = "basic", description) {
        this.effects = effects.map(e => ({
            ingredientName: name,
            active: false,

            ...e
        }));
        // this.hello = arguments.

        this.description = description
        this.name = name;
        this.complexity = 1;
        this.properties = properties;
        this.type = type;
        this.id = hash(this);
        this.colour = colour;
        // this.complexity
    }
    effectsAdvanced() {
        return this.effects;
        // .map(e => )
    }
    effectsBasic() {
        return this.effects.map(e => e.name);
        // .map(e => ({ active: false, ...e }))
    }

    updateComplexity(add) {
        if (add) this.complexity += add;
        return this.complexity;
    }
}

class PotionMaster {
    constructor(seed = Math.random(), args = defaults) {
        this.seed = seed;
        this.dataHash = null
        faker.seed(this.seed);
        this.data = args.baseData;
        this.options = args.options;
        this.data.effects = args.effects;
        this.data.components = [];
        this.data.substanceProperties = args.substanceProperties.map(e =>
            e.capitalize()
        );
        this.data.productionRequirements = args.productionRequirements.map(i =>
            i.capitalize()
        );

        return this.makeDataSet();
    }


    memory(input) {

        // eyJkYXRhSGFzaCI6ImYyZmI0NTAxNGU5ZmM0MjQ4NWY2ZmRjNzBhMDU0OTBhMjI4YzRiYzgiLCJzZWVkIjoxLCJwb3Rpb25zIjpbXX0=

        var newDataState = input && JSON.parse(atob(input))

        if (newDataState) {
            console.log("starting data import")
            console.log("dataHash", newDataState.dataHash, "current dataHash", this.dataHash)
            console.log("seed", newDataState.seed, "current seed", this.seed)

            if (newDataState.dataHash != this.dataHash) {
                throw "mismatch in data set, perhaps you used different options/effects/components?"
            }
            if (newDataState.seed != this.seed) {
                throw "you are using a different seed than the export, cannot import"
            }

            newDataState.potions.forEach(p => {
                // registerComponent
                console.log(p.colour)
                var newPotion = new Component(p.name,
                    p.effects,
                    p.colour,
                    p.properties,
                    p.type)

                newPotion.image = p.image
                newPotion.complexity = p.complexity
                // console.log(JSON.stringify(newPotion, null, 2))
                // console.log(JSON.stringify(p, null, 2))
                this.registerComponent(newPotion)
            })

            return 'success'
        }


        var dataState = {
            dataHash: this.dataHash,
            seed: this.seed,
            potions: this.data.components
                .filter(c => c.type != 'basic')
                .map(c => ({ ...c, image: null }))
        }

        return btoa(JSON.stringify(dataState))

    }

    components() {
        return this.data.components;
    }

    types() {
        return this.components().reduce((result, current) => {
            if (!result[current.type]) result[current.type] = [];
            result[current.type].push(current);
            return result;
        }, {});
    }

    productionEffects() {
        return this.data.productionRequirements;
    }

    effects() {
        return this.data.effects;
    }

    findComponent(searchQuery) {
        return this.data.components.find(
            c =>
            c === searchQuery ||
            c.id === searchQuery ||
            c.name === searchQuery
        );
    }

    registerComponent(componentObject) {
        var dupe = this.findComponent(componentObject.id);
        if (dupe) {
            // console.log("duplicate potion");
            return dupe;
        }
        var n = this.data.components.push(componentObject);
        return this.data.components[n - 1];
    }

    findCommonEffects(...ingredientObjects) {
        console.log("running findCommonEffects", ingredientObjects.length);

        var complexity = Math.max(
            ...ingredientObjects.map(i => i.updateComplexity())
        );

        console.log("potion complexity", complexity)
        var effectArray = ingredientObjects
            .map(i => i.effectsAdvanced())
            .flat();

        effectArray.forEach((s, i, a) => (a[i].active = false));

        effectArray.forEach(
            (effect, i, array) =>
            (array[i].count = array.filter(
                e => e.name === effect.name
            ).length)
        );
        //activate effects
        effectArray
            .filter(e => e.count >= this.options.minimumCommonEffects)
            .filter(e => e.complexity <= complexity)
            .forEach((s, i, a) => (a[i].active = true));

        return effectArray;
    }

    validateEffects(productionModifiers = [], effectArray) {

        console.log(
            "running validateEffects",
            "productionModifiers",
            productionModifiers,
            "effectArray",
            effectArray.length
        );
        // console.log(effectArray)
        var conditions = {
            hasNoProductionRequirements: e =>
                !e.production,
            includesProduction: e =>
                productionModifiers
                .map(e => e.toLowerCase())
                .includes(e.production.toLowerCase()),
            usingPhilosophersStone: e =>
                productionModifiers
                .map(e => e.toLowerCase())
                .includes("philosophers stone")
        };
        // console.log(effectArray)

        console.log("effectArray", effectArray.map(ew => [ew.name, ew.production]));

        //vlidate prodction
        // remove junk
        //keep high level
        return effectArray
            //filter production mods
            // .map(e => { console.log("remaing effect", e); return e })
            .filter((e, i, a) =>
                Object.keys(conditions).some(b => conditions[b](e))
            )
            // .map(e => {
            //     console.log("remaing effect", e)
            //     return e
            // })
            // console.log(t)
            .filter(e => e.active || e.complexity >= 3)


    }

    strengthFinder(percent) {
        // console.log("LMAO", this.options.ratings[Math.round(percent * this.options.ratings.length) - 1], Math.round(percent * this.options.ratings.length) - 1)
        var index = Math.round(percent * this.options.ratings.length) - 1;
        if (index < 0) index = 0;
        return this.options.ratings[index].capitalize();
    }

    calculateEffectPotency(effectArray) {
        console.log("running calculateEffectPotency", effectArray.length);

        effectArray.forEach(item => {
            delete item.ingredientName;
        });

        var presentEffects = [...new Set(effectArray.map(e => e.name))];
        // console.log("presentEffect1s", presentEffects);

        presentEffects = presentEffects
            .map(effect => {
                var thisEffectCollection = effectArray.filter(
                    e => e.name === effect
                );
                return Object.assign({}, ...thisEffectCollection, {
                    magnitude: thisEffectCollection
                        .map(e => e.magnitude)
                        //this is voodoo
                        .reduce((a, b) => a + b, 0)
                });
            })
            .map(e => ({
                ...e,
                strength: this.strengthFinder(e.magnitude / e.maxMagnitude)
            }));

        // console.log("presentEffect2s", presentEffects);

        //trim potion to remove excess effects
        // if (presentEffects.length > 4) presentEffects = presentEffects.slice(0, 4)
        return presentEffects;
    }

    finalisePotion(presentEffects, customJunkName = "Junk") {
        console.log("running finalisePotion", presentEffects.length);
        var potionName = "Precursor Liquid";
        var colour = this.options.precursorColour;

        var activeEffects = presentEffects.filter(e => e.active).slice(0, 3);
        var inactiveEffects = presentEffects.filter(e => !e.active).slice(0, 3);

        // console.log("presentEffects", presentEffects);

        if (activeEffects.length + inactiveEffects.length < 1)
            return new Component(
                customJunkName,
                [],
                generateColour(),
                ["Smells terrible"],
                "potion"
            );

        // console.log(inactiveEffects.length)
        // console.log(activeEffects.length)

        var strongestEffect = activeEffects
            .filter(e => e.active)
            .reduce(
                (prev, current) =>
                prev.magnitude > current.magnitude ? prev : current,
                0
            );

        if (strongestEffect) potionName = strongestEffect.name + " Potion";

        if (activeEffects.length > 1) potionName = "Mixed " + potionName;

        //find colours
        //awaiting colour mixing function

        // console.log(
        //     "fuck",
        //     activeEffects.map(e => e.colour)
        // );

        var colour = activeEffects
            .map(e => e.colour)
            .filter(e => e)
            .reduce(
                (result, current) =>
                colourMod.colorMixerForTwoObjects(result, current),
                // mixColour(result, current),
                0
            );


        if (!colour)
            colour = inactiveEffects
            .map(e => e.colour)
            .filter(e => e)
            .reduce(
                (result, current) =>
                colourMod.colorMixerForTwoObjects(result, current),
                // mixColour(result, current),
                0
            );


        console.log(colour)


        var properties = activeEffects
            .concat(inactiveEffects)
            .map(e => e.substanceProperty)
            .filter(e => e)
            .sort()
            .slice(0, 3)
            .unique();

        var newPotion = new Component(
            potionName,
            activeEffects.concat(inactiveEffects),
            colour,
            properties,
            "potion"
        );
        newPotion.updateComplexity(
            Math.min.apply(
                Math,
                presentEffects.map(e => e.complexity)
            )
        );
        return newPotion;
    }

    createPotion(productionModifiers, ingredientNames) {
        var m = ingredientNames.map(i => this.findComponent(i));
        m = this.findCommonEffects(...m);
        m = this.validateEffects(productionModifiers, m);
        m = this.calculateEffectPotency(m);
        m = this.finalisePotion(m);
        return this.registerComponent(m);
    }

    findIngredientsWithEffect(effect) {
        return this.components().filter(component => component.effects.find(e => e.name === effect))
    }

    makeDataSet() {
        // console.log("makeDataSet");
        var generationMemory = {};
        var conditions = {
            addProductionRequirements: effect => {
                if (effect.complexity > 2 && effect.complexity < 4) {
                    effect.production = this.data.productionRequirements
                        .slice(0, 3 + effect.complexity)
                        .randomElement();
                }

                if (effect.complexity >= 4) {
                    effect.production = this.data.productionRequirements
                        .slice(2, this.data.productionRequirements.length)
                        .randomElement();
                }

                return effect;
            },

            addSubstanceProperties: effect => {
                if (effect.complexity < 3 && effect.complexity > 1) {
                    effect.substanceProperty = this.data.substanceProperties
                        .slice(0, 5)
                        .randomElement();
                }
                if (effect.complexity >= 3) {
                    effect.substanceProperty = this.data.substanceProperties.randomElement();
                }
                return effect;
            },

            addColour: effect => ({ ...effect, colour: generateColour() })
        };
        //update ingrediants
        this.data.ingredients
            // .slice(0, 10)
            .map(ingredient => {
                // console.log(ingredient)
                ingredient.effects = ingredient.effects.map((effect, i, a) => {
                    //merge objects
                    effect = {
                        ...effect,
                        ...this.data.effects.find(
                            e => e.originalName === effect.name
                        )

                        //add colours
                    };

                    //apply condions
                    Object.keys(conditions).forEach(
                        c => (effect = conditions[c](effect))
                    );

                    generationMemory[effect.name] = generationMemory[
                        effect.name
                    ] ? [...generationMemory[effect.name], effect.magnitude] : [effect.magnitude];
                    // console.log(effect)
                    return effect;
                });

                return ingredient;
            })
            //calculate maximum strength
            .map((ingredient, i, a) => ({
                ...ingredient,
                effects: ingredient.effects.map(e => ({
                    ...e,
                    maxMagnitude: generationMemory[e.name]
                        .sort((a, b) => b - a, 0)
                        .slice(0, this.options.maxComponents)
                        .reduce((a, b) => a + b, 0)
                }))
            }))
            .map(i => this.registerComponent(new Component(i.name, i.effects, undefined, undefined, undefined, i.description)));
        delete this.data.ingredients;
        this.dataHash = hash(this.data)
        // console.log("makeDataSet complete", this.data.components.length);
        return this;
    }
}

function tests(seed = 1) {
    var pm = new PotionMaster(seed);

    // var explosivePotion = ["Beehive Husk", "Ash Creep Cluster"];

    // var corruptionPotion = ["Nordic Barnacle", "Tinder Polypore Cap"];
    var waterwalkingPotion = ["Slaughterfish Scales", "Kwama Cuttle", "Bee"];
    var x = pm.createPotion(['Chill', ], waterwalkingPotion)
    console.log(x)

    // ### section for figuring out if there are effects that are unrepresented in the list
    // var ef = []

    // pm.data.components
    //     .map(i => {

    //         i.effects.forEach(e => {
    //             // if (!ef[e.name]) ef[e.name] = 0
    //             var dis = ef.find(qe => qe.name == e.name)
    //             if (dis) {
    //                 dis.count += 1
    //             } else {
    //                 ef.push({
    //                     // ...e,
    //                     name: e.name,
    //                     count: 1,
    //                     complexity: e.complexity
    //                     // magnitude: e.magnitude
    //                 })
    //             }
    //             // ef[e.name] += 1
    //         })
    //     })



    // // ### section for calculating just how much of each effect there needs to be for it to be even brewable
    // var we = ef
    // var rw = we
    //     .map(e => ({ ...e, diff: e.complexity * 1.5 - e.count, desiredTotal: e.complexity * 1.5 }))
    //     // .filter(e => e.diff > 3)
    //     .sort((a, b) => parseFloat(a.diff) - parseFloat(b.diff))
    //     // .sort((a, b) => parseFloat(b.diff) - parseFloat(a.diff))
    // var t = 0
    // var update = []

    // rw.forEach(e => {
    //     console.log(e.diff, )
    //     Array.from(new Array(Math.ceil(e.diff)))
    //         .forEach(() => update.push(e.originalName + " - "+ e.name))
    // })

    // console.log(t)
    // console.log(rw)
    // console.log(update)



    // var productionEffects = productionRequirements.filter(e=>!e == "philosophers stone")
    // var components = [
    //     pm.createPotion(productionEffects, explosivePotion),
    //     pm.createPotion(productionEffects, corruptionPotion)
    // ];

    // console.log("components[0]", components[0] )


    //     console.log("components[1]", components[1])

    // // console.log(pm.data.components.reverse().slice(0,3))

    // var invis = pm.createPotion(productionEffects, components);

    // return pm.createPotion(productionEffects, [invis, invis]);
}

// tests()
// console.log(x)

// var x = require('fs').readFileSync("rename-ingredients.json")
// x = JSON.parse(x)
// x = x.sort(function(a, b) {
//     if (a.name < b.name) { return -1; }
//     if (a.name > b.name) { return 1; }
//     return 0;
// })

// console.log(x)

// require('fs').writeFileSync("rename-ingredients.json", JSON.stringify(x, null, 2))



// var t1 = generateColour();

// var t2 = generateColour()
// console.log("rgbToHexrgbToHexrgbToHexrgbToHex", )

// console.log("MIX1",t1, mixColour(t1,t1))

// console.log("MIX2",t1, colourMod.colorMixerForTwoObjects(t1, t1))

// export default PotionMaster
module.exports = { PotionMaster: PotionMaster, logColour: logColour };
//