import { Button } from "./form";
import { xmark } from "./icons/icons";
import { Module } from "./module";


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
        document.getElementById("global")?.removeChild(this.container.htmlElement)
    }

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
        let confirm = new Button(confirmText)
        confirm.onClick = () => {
            this.dispose()
            this.onConfirm()
        }
        this.add(confirm)
        let cancel = new Button(cancelText)
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
        let exitButton = new Button(xmark, exitButtonClass)
        exitButton.onClick = this.dispose.bind(this)
        this.add(exitButton)
    }

    public update() {}
}
