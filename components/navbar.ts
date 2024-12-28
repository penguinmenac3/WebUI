import "./navbar.css"
import { Button } from "./form";
import { Module } from "../module";


export class Navbar extends Module<HTMLDivElement> {
    constructor(cssClass: string = "navbar") {
        super("div", "", cssClass)
    }
}

export class NavbarButton extends Button {
    constructor(innerHTML: string, cssClass: string = "navbar-button") {
        super(innerHTML, cssClass)
    }
}

export class NavbarHeader extends Module<HTMLDivElement> {
    constructor(innerHTML: string, cssClass: string = "navbar-header") {
        super("div", innerHTML, cssClass)
    }
}

export class NavbarIconTextButton extends NavbarButton {
    public icon: HTMLElement;
    public text: HTMLElement;

    constructor(text: string, iconSVG: string, cssClass: string = "navbar-button") {
        super("", cssClass)
        this.icon = this.addHtml("div", iconSVG, "icon")
        this.text = this.addHtml("div", text, "text")
    }

    public setIcon(iconSVG: string): void {
        this.icon.innerHTML = iconSVG
    }

    public setText(text: string): void {
        this.text.innerHTML = text
    }
}
