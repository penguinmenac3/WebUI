import { Module } from "../module";


export class ActionButton extends Module<HTMLSpanElement> {
    public constructor(innerHTML: string, protected action: CallableFunction | null = null) {
        super("span", innerHTML, "action");
        this.htmlElement.onclick = () => this.onAction();
    }

    public onAction() {
        if (this.action != null) {
            this.action()
        } else {
            alert("Not implemented yet!");
            console.log("Overwrite onAction() or provide an acction callback in the constructor.")
        }
    }
}

export class DropdownButton extends Module<HTMLSpanElement> {
    public constructor(innerHTML: string, protected selections: Map<string, CallableFunction> | null = null) {
        super("span", innerHTML, "dropdown");
        this.htmlElement.onclick = () => this.onAction();
    }

    public setOptions(selections: Map<string, CallableFunction>) {
        this.selections = selections
    }

    public onAction() {
        if (this.selections != null) {
            alert("Not yet implemented!")
        } else {
            alert("No selections available.");
            console.log("No selections for this dropdown button available, " +
                "set them via setOptions() or the constructor.")
        }
    }
}
