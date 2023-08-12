import { Button } from "./form";
import { Module } from "./module";
import barsURL  from  "./icons/bars-solid.svg"
import xmarkURL  from  "./icons/xmark-solid.svg"

let bars = "<image src='" + barsURL + "' />";
let xmark = "<image src='" + xmarkURL + "' />";

export class SettingsPopup extends Module<HTMLDivElement> {
    public toggleButton: Button
    public container: Module<HTMLDivElement>

    public constructor(
        innerClass: string,
        containerClass: string,
        toggleClass: string
    ) {
        super("div")
        this.setClass(innerClass)
        this.container = new Module("div")
        this.container.setClass(containerClass)
        this.container.add(this)
        this.container.hide()
        this.toggleButton = new Button(bars, toggleClass)
        this.toggleButton.onClick = this.toggleVisibility.bind(this)
    }

    public addToDivById(id: string) {
        document.getElementById(id)?.appendChild(this.container.htmlElement)
        document.getElementById(id)?.appendChild(this.toggleButton.htmlElement)
    }

    public update() {}

    public toggleVisibility() {
        if (this.container.isVisible()) {
            this.container.hide()
            this.toggleButton.htmlElement.innerHTML = bars
        } else {
            this.toggleButton.htmlElement.innerHTML = xmark
            this.update()
            this.container.show()
        }
    }
}
