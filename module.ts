export interface KWARGS {
    [x: string]: string
}


export class Module<T extends HTMLElement> {
    public parent: Module<HTMLElement> | null = null
    public htmlElement: T
    private displayStyle: string = "none"

    protected constructor(element: string, text: string = "", cssClass: string = "") {
        this.htmlElement = document.createElement(element) as T
        this.htmlElement.innerHTML = text
        if (cssClass != "") {
            this.setClass(cssClass)
        }
    }
    
    public add(module: Module<HTMLElement>): void {
        this.htmlElement.appendChild(module.htmlElement)
        module.parent = this
    }

    public remove(module: Module<HTMLElement>): void {
        this.htmlElement.removeChild(module.htmlElement)
        module.parent = null
    }

    public isVisible(): boolean {
        return this.htmlElement.style.display.toLowerCase() != "none"
    }

    public hide() {
        if (!this.isVisible()) return
        this.displayStyle = this.htmlElement.style.display
        this.htmlElement.style.display = "None"
    }

    public show() {
        if (this.displayStyle.toLowerCase() == "none") return
        this.htmlElement.style.display = this.displayStyle
    }

    public update(_kwargs: KWARGS, _changedPage: boolean) {}

    public select() {
        this.setClass("selected")
    }

    public unselect() {
        this.unsetClass("selected")
    }

    public setClass(className: string) {
        if (!this.htmlElement.classList.contains(className)) {
            this.htmlElement.classList.add(className)
        }
    }

    public unsetClass(className: string) {
        if (!this.htmlElement.classList.contains(className)) {
            this.htmlElement.classList.remove(className)
        }
    }

    // To duplicate the object use structuredClone(module):
    // https://developer.mozilla.org/en-US/docs/Web/API/structuredClone
}
