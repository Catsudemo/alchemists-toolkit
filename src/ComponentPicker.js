import React from "react";

// export function SmartButton(props) {
//     const classes = useStyles();

//     return (
//         <div
//                             key={props.key}
//                             value={props.value}
//                             onClick={props.onClick}
//                             className={props.className}>

//                         </div>
//     );
// }

export default class ComponentPicker extends React.Component {
    constructor(props) {
        super(props);
        this.options = props.options;
        this.conditions = props.conditions;
        this.callbackFunction = props.callbackFunction;

        this.state = {
            selections: []
        };
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(event, id) {
        // console.log("The link was clicked.", event, id, this.conditions);
        console.log(this.state.selections);

        if (id && this.state.selections.includes(id)) this.handleDelete(id);
        if (id && !this.state.selections.includes(id)) this.handleAddition(id);
        // Object.keys(this.conditions).map(fn => this.conditions[fn](this.state.selections, id))
    }

    handleAddition(selection) {
        const { selections } = this.state;
        console.log(this.state)
        selections.push(selection)
        console.log("adding", selection, selections)

        this.setState(state => ({
            selections: selections
        }))

    }

    handleDelete(id) {
        const { selections } = this.state;

        this.setState({
            selections: selections.filter(i => i !== id)
        });

    }

    render() {
        return (
            <div>
                {this.options.map((option, i) => {
                    var className = this.state.selections.includes(option.id)
                        ? "[Selected]"
                        : "";
                    return (
                        <div
                            key={option.id}
                            value={option.id}
                            onClick={e => this.handleClick(e, option.id)}
                            className={className}
                        >
                            {className + " " + option.name}
                        </div>
                    );
                })}
            </div>
        );
    }
}