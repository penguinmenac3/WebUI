import { Button } from "./form";
import { iconXmark } from "./icons/icons";
import { Module } from "./module";

import './popup.css'


export class Popup extends Module<HTMLDivElement> {
    public container: Module<HTMLDivElement>

    public constructor(
        innerClass: string,
        containerClass: string
    ) {
        super("div")
        this.setClass(innerClass)
        this.container = new Module("div")
        this.container.setClass(containerClass)
        this.container.add(this)
        document.getElementById("global")?.appendChild(this.container.htmlElement)
    }

    public dispose() {
        this.onExit()
        document.getElementById("global")?.removeChild(this.container.htmlElement)
    }

    public onExit() {}
    public update() {}
}


export class ConfirmCancelPopup extends Popup {
    public constructor(
        innerClass: string,
        containerClass: string,
        question: string,
        confirmText: string,
        cancelText: string
    ) {
        super(innerClass, containerClass)
        this.add(new Module("p", question))
        let confirm = new Button(confirmText, "popupConfirmBtn")
        confirm.onClick = () => {
            this.dispose()
            this.onConfirm()
        }
        this.add(confirm)
        let cancel = new Button(cancelText, "popupCancelBtn")
        cancel.onClick = () => {
            this.dispose()
            this.onCancel()
        }
        this.add(cancel)
    }

    public onConfirm () {
        console.log("ConfirmCancelPopup::onConfirm not implemented. Must be implemented by subclass.")
    }

    public onCancel() {
        console.log("ConfirmCancelPopup::onCancel not implemented. Must be implemented by subclass.")
    }
}


export class ExitablePopup extends Popup {
    public constructor(
        innerClass: string,
        containerClass: string,
        exitButtonClass: string = ""
    ) {
        super(innerClass, containerClass)
        let exitButton = new Button(iconXmark, exitButtonClass)
        exitButton.onClick = this.dispose.bind(this)
        this.add(exitButton)
    }

    public update() {}
}
