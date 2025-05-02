import "./buttons.css"
import { Module } from "../module";
import { Button, FormInput } from "./form";


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
    public constructor(
        innerHTML: string,
        protected selections: Map<string, CallableFunction> | null = null,
        protected filterable: boolean = false
    ) {
        super("span", innerHTML, "dropdown");
        this.htmlElement.onclick = () => this.onAction();
    }

    public setOptions(selections: Map<string, CallableFunction>) {
        this.selections = selections
    }

    public onAction() {
        if (this.selections != null) {
            this.showMenu(this.selections)
        } else {
            alert("No selections available.");
            console.log("No selections for this dropdown button available, " +
                "set them via setOptions() or the constructor.")
        }
    }

    public showMenu(selections: Map<string, CallableFunction>) {
        let menu = new DropdownButtonMenu(selections, this.filterable);
        menu.htmlElement.style.display = "block";
        menu.htmlElement.style.position = "absolute";
        const rect = this.htmlElement.getBoundingClientRect();
        let cx = (rect.left + rect.right) / 2
        let cy = (rect.top + rect.bottom) / 2
        let W = window.innerWidth;
        let H = window.innerHeight;
        let availableSpaceRight = W - cx;
        let availableSpaceBelow = H - cy;

        // Adjust menu position based on available space
        if (availableSpaceBelow < menu.htmlElement.clientHeight) {
            // If not enough space below, place it above the button
            menu.htmlElement.style.top = `${rect.top - menu.htmlElement.clientHeight}px`;
        } else {
            // Otherwise, place it below the button
            menu.htmlElement.style.top = `${rect.bottom}px`;
        }

        if (availableSpaceRight < menu.htmlElement.clientWidth) {
            // If not enough space to the right, place it to the left of the button
            menu.htmlElement.style.left = `${rect.right - menu.htmlElement.clientWidth}px`;
        } else {
            // Otherwise, place it to the right of the button
            menu.htmlElement.style.left = `${rect.left}px`;
        }
    }
}


class DropdownButtonMenu extends Module<HTMLDivElement> {
    private background: Module<HTMLDivElement>

    constructor(actions: Map<string, CallableFunction>, filterable: boolean = false) {
        super("div", "", "dropdown-menu");

        let actionsDiv = new Module<HTMLDivElement>("div")
        if (filterable) {
            let filterElement = new FormInput("filter", "model name", "text")
            filterElement.onChange = (value: string) => {
                this.updateOptions(actionsDiv, actions, value)
            }
            this.add(filterElement)
        }
        this.add(actionsDiv)
        this.updateOptions(actionsDiv, actions)

        this.background = new Module<HTMLDivElement>("div", "", "dropdown-menu-grayout")
        this.background.htmlElement.onclick = () => {
            this.close()
        }
        document.body.appendChild(this.background.htmlElement)
        document.body.appendChild(this.htmlElement)
    }

    private updateOptions(
        actionsDiv: Module<HTMLDivElement>,
        actions: Map<string, CallableFunction>,
        filter: string = "") {

        actionsDiv.htmlElement.innerHTML = "";

        for (let [action, callback] of actions) {
            if (action.includes(filter)) {
                let button = new Button(action, "dropdown-menu-button");
                button.onClick = () => { if (callback()) { this.close(); } };
                actionsDiv.add(button);
            }
        }
    }

    private close() {
        document.body.removeChild(this.background.htmlElement)
        document.body.removeChild(this.htmlElement)
    }
}