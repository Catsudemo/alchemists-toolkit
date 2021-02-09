window.addEventListener("load", e => {
    var params = Object.fromEntries(
        new URLSearchParams(window.location.search)
    );

    const colourMod = require("./ColorGeneratorModule.js");
    const PotionMaster = require("./potion-gen.js");
    const Swal = require('sweetalert2')

    var pm = new PotionMaster.PotionMaster((params.seed && +params.seed) || 1);

    // var explosivePotion = ["Beehive Husk", "Ash Creep Cluster"];

    // var corruptionPotion = ["Nordic Barnacle", "Tinder Polypore Cap"];

    // var productionEffects = [
    //     "Crushing",
    //     "Disolve in water",
    //     "philosophers stone"
    // ];

    // var components = [
    //     pm.createPotion(productionEffects, explosivePotion),
    //     pm.createPotion(productionEffects, corruptionPotion)
    // ];

    console.log("seed", pm.seed);

    var ingredientSelectorTemplate = `

<select class="multiple production-selector" multiple>
    <option data-placeholder="true"></option>
    {{#each productionEffects}}
    <option value="{{this}}">{{this}}</option>
    {{/each}}
</select>
`;
    var potionTemplate = `
{{#ifEquals type 'potion'}}
<div class="potion" id="{{potion.name}}">
  <h3>
    {{name}}
  </h3>

  <b>
    Effects
  </b>
  <p>
  {{#each effects}}
    {{#if this.active}}
      <div class="active effect list">
        Active effect - {{this.strength}} {{this.name}}
      </div>
    {{/if}}

{{#each effects}}
    Key: {{@key}} Value = {{this}}
{{/each}}

    {{#unless this.active}}
      <div class="passive effect list">
        Passive effect - {{this.name}}
      </div>
    {{/unless}}
  {{else}}
    This potion has no effects
  {{/each}}
</p>
  <b>
    Potion properties
  </b>
  <p>
  {{#each properties}}
    <div class="list">
      {{this}}
    </div>
  {{else}}
    This potion is just a liquid in a container
  {{/each}}
  </p>
</div>
{{else}}
<div>
    {{name}}
    <div class="small">
        {{#each effects}}
        {{this.name}} {{#if this.production}}({{this.production}}){{/if}},
        {{/each}}
    </div>
</div>
{{/ifEquals}}
`;
        console.log(pm.types())

    Handlebars.registerHelper("ifEquals", function(arg1, arg2, options) {
        return arg1 == arg2 ? options.fn(this) : options.inverse(this);
    });

    var potionTemplate = Handlebars.compile(potionTemplate);

    var ingredientsSelector;
    var productionSelector;

    function generateComponentOptions() {
        var dropdownItemTemplate = Handlebars.compile(`
{{component.name}}
{{#if isPotion}}
- {{strongestEffect.strength}} {{strongestEffect.name}} effect
{{else}}
{{/if}}
`);

        return Object.keys(pm.types())
            .map(o => ({
                label: o,
                options: pm.types()[o].map(component => ({
                    innerHTML: potionTemplate({ ...component }),
                    text: component.name,
                    value: component.id
                }))
            }))
            .reverse();
    }

    function updateTemplate() {
        ingredientsSelector = new SlimSelect({
            select: ".ingredients-selector",
            placeholder: "What will you add to this potion?",
            limit: pm.options.maxComponents,
            data: generateComponentOptions(),
            showOptionTooltips: true,
            // afterClose: function(t) {
            //     this.open();
            //     console.log('beforeClose' )
            // },
            // beforeClose: function(t) {
            //     this.open();
            //     console.log('beforeClose' )
            // },
            closeOnSelect: false,
            onChange: info => {
                console.log("info", info);
            }
        });
        productionSelector = new SlimSelect({
            select: ".production-selector",
            placeholder: "How do you want to prepare these ingredients?",
            limit: pm.options.maxProductionEffects,
            data: pm.productionEffects().map(p => ({ text: p, value: p })),
            closeOnSelect: false,
            onChange: info => {
                console.log(info);
            }
        });
    }

    function prefil(ingredients, production) {
        var t = ingredients.map(i => pm.findComponent(i).id);

        console.log("testfilling with", t);
        ingredientsSelector.set(t);
        productionSelector.set(production);
    }

    updateTemplate();

    // console.log(
    //     pm.memory(
    //         // '{"dataHash":"2067c77906c9148e8515e27f4097bc2726b72b74","seed":1,"potions":[{"effects":[{"ingredientName":"Explosive Potion","active":true,"name":"Explosive","magnitude":3.6399999999999997,"complexity":1,"originalName":"Fortify Destruction","colour":{"r":92,"g":57,"b":70,"a":0.28},"maxMagnitude":13.72,"count":2,"strength":"Weak"},{"ingredientName":"Explosive Potion","active":false,"name":"Invisibility","magnitude":331,"complexity":4,"originalName":"Invisibility","production":"Ferment for 1 session","substanceProperty":"Damaged by acid","colour":{"r":210,"g":249,"b":126,"a":0.5},"maxMagnitude":1423,"count":1,"strength":"Weak"}],"name":"Explosive Potion","complexity":2,"properties":["Damaged by acid"],"type":"potion","id":"ff3e16502b5ed16525150c84375899d498c17d9e","colour":{"a":0.5,"r":44,"g":27,"b":34},"image":null}]}'
    //     )
    // );


    // var w = pm.findIngredientsWithEffect("Grow")
    // console.log(w)

    document.getElementById("findEffect").onclick = e => {





        Swal.fire({
                title: 'My Title',
                text: 'Please select an option',
                input: 'select',
                inputOptions: Object.assign({}, ...pm.effects().map(effect => ({
                    [effect.name]: effect.name
                }))),
                showCancelButton: true,
                inputPlaceholder: 'Please select'
            })
            .then((choice) => [pm.findIngredientsWithEffect(choice.value), choice.value])
            .then(components => {
                var componentSelector
                Swal.fire({
                        title: 'Ingredients containing ' + components[1],
                        // '<input type="select" class="fuck">' + components[0].map(c => `<p>${c.name}</p>`).join("") + '</input>'
                        html: '<select class="multiple ingredients-options" multiple>',
                        customClass: {
                            actions: 'vertical-buttons',
                            cancelButton: 'top-margin'
                        }
                    })
                    .then(result => {

                    })
                componentSelector = new SlimSelect({
                    select: ".ingredients-options",
                    placeholder: "What will you add to this potion?",
                    limit: pm.options.maxComponents,
                    data: components[0].map(c => ({ text: c.name, innerHTML: c.name })),
                    closeOnSelect: false,
                })


            })

        // prefil(["Nordic Barnacle", "Tinder Polypore Cap"], ["Philosophers stone"]);

    };
    // document.getElementById("findEffect").onclick()

    document.getElementById("export").onclick = e => {



        Swal.fire({
                input: 'textarea',
                title: 'Export data',
                text: 'Copy your data string below',
                inputValue: pm.memory(),
                inputAttributes: {
                    'aria-label': 'Type your message here',
                },
                showCancelButton: true,
            })
            .disableInput()
        // .then(console.log)

    };





    document.getElementById("import").onclick = e => {


        Swal.fire({
                input: 'textarea',
                inputPlaceholder: 'Enter your code...',
                title: 'Import data',
                text: 'Paste your data string below',
                inputAttributes: {
                    'aria-label': 'Type your message here',
                },
                showCancelButton: true,
            })
            .then(o => pm.memory(o.value))
            .then(m => {
                if (m != 'success') {
                    return ""
                } else {
                    updateTemplate();
                    return Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Data set loaded',
                        timer: 1300
                    })

                }




            })
            .catch(e => Swal.fire({
                icon: 'error',
                title: 'Import failed',
                text: 'Something went wrong! ' + e,
            }))





    };

    document.getElementById("clear").onclick = e => {
        ingredientsSelector.set([]);
        productionSelector.set([]);
    };

    document.getElementById("explosive-test").onclick = e =>
        prefil(["Beehive Husk", "Ash Creep Cluster"], ["Philosophers stone"]);

    document.getElementById("corruption-test").onclick = e =>
        prefil(["Nordic Barnacle", "Tinder Polypore Cap"], ["Philosophers stone"]);


    document.getElementById("start").onclick = e => {
        if (ingredientsSelector.selected().length < 1) return false;

        document.getElementById("image-container").innerHTML = "";
        document.getElementById("output").innerHTML = "";

        var potion = pm.createPotion(
            productionSelector.selected(),
            ingredientsSelector.selected()
        );

        if (!potion.image)
            potion.image = SVG(
                `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 125" enable-background="new 0 0 100 100" xml:space="preserve"><path fill-rule="evenodd" clip-rule="evenodd" d="M53.7,66.475c1.386,0,2.51,1.124,2.51,2.51c0,1.386-1.124,2.51-2.51,2.51  c-1.386,0-2.51-1.124-2.51-2.51C51.19,67.599,52.314,66.475,53.7,66.475L53.7,66.475z M52.636,81.146  c0.832,0,1.505,0.674,1.505,1.506c0,0.832-0.674,1.505-1.505,1.505c-0.832,0-1.506-0.674-1.506-1.505  C51.129,81.82,51.804,81.146,52.636,81.146L52.636,81.146z M43.273,72.278c1.109,0,2.007,0.899,2.007,2.008  c0,1.109-0.898,2.008-2.007,2.008s-2.007-0.899-2.007-2.008C41.266,73.178,42.164,72.278,43.273,72.278L43.273,72.278z   M40.556,60.87L30.113,77.885c-1.369,2.231-3.15,6.86-1.649,9.386c0.89,1.497,3.327,1.707,4.853,1.707H66.36  c1.492,0,4.392-0.209,5.283-1.71c1.445-2.433-0.809-7.309-2.08-9.382L59.179,60.87C52.971,64.886,46.764,56.854,40.556,60.87z"/><circle fill-rule="evenodd" clip-rule="evenodd" cx="51.773" cy="44.739" r="3.011"/><circle fill-rule="evenodd" clip-rule="evenodd" cx="53.368" cy="6.506" r="1.506"/><circle fill-rule="evenodd" clip-rule="evenodd" cx="52.57" cy="28.572" r="1.506"/><circle fill-rule="evenodd" clip-rule="evenodd" cx="47.325" cy="15.026" r="2.008"/><circle fill-rule="evenodd" clip-rule="evenodd" cx="48.022" cy="35.908" r="2.008"/><circle fill-rule="evenodd" clip-rule="evenodd" cx="46.859" cy="54.698" r="2.008"/><path fill-rule="evenodd" clip-rule="evenodd" d="M39.961,20.717h20.077c1.104,0,2.007,0.904,2.007,2.008s-0.903,2.008-2.007,2.008  c0,29.925-0.282,25.644,14.659,50.003C80.704,84.53,79.278,95,66.36,95H33.317c-12.916,0-13.611-11.667-8.337-20.265  C39.865,50.465,39.961,54.5,39.961,24.732c-1.104,0-2.008-0.904-2.008-2.008S38.857,20.717,39.961,20.717L39.961,20.717z   M42.973,24.732c0,5.706,0.077,11.54-0.258,17.234c-0.22,3.73-0.662,7.359-1.85,10.918c-1.14,3.414-2.885,6.548-4.734,9.621  c-2.79,4.637-5.753,9.188-8.584,13.805c-2.029,3.309-3.838,8.853-1.672,12.499c1.525,2.567,4.677,3.18,7.442,3.18H66.36  c2.786,0,6.313-0.558,7.873-3.183c2.165-3.645-0.125-9.271-2.103-12.495c-2.826-4.607-5.782-9.16-8.545-13.799  c-1.822-3.059-3.529-6.176-4.626-9.577c-1.146-3.555-1.542-7.185-1.732-10.899c-0.292-5.724-0.201-11.569-0.201-17.303H42.973z"/></svg>`
            )
            .size(100, 100)
            .fill({
                color: colourMod.rgbToHex(potion.colour),
                opacity: potion.colour.a
            })
            .clone();

        PotionMaster.logColour(potion.colour, potion.name);
console.log(potion)
        document.getElementById("output").innerHTML = potionTemplate({
            ...potion
        });

        potion.image.addTo(".image-container");



        // if (potion.effects.length > 0) {
        //     Swal.fire({
        //         position: 'top-end',
        //         icon: 'success',
        //         title: 'Potion success!',
        //         showConfirmButton: false,
        //     })
        // } else {
        //     Swal.fire({
        //         position: 'top-end',
        //         icon: 'error',
        //         title: 'Brewing failed',
        //         showConfirmButton: false,
        //         timer: 1300
        //     })
        // }

        updateTemplate();
    };
});