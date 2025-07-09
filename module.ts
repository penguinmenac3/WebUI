export interface KWARGS {
    [x: string]: string
}


export class Module<T extends HTMLElement> {
    public parent: Module<HTMLElement> | null = null
    public htmlElement: T
    private _displayStyle: string = "none"
    private _children: Module<HTMLElement>[] = []

    protected constructor(element: string, text: string = "", cssClass: string = "") {
        this.htmlElement = document.createElement(element) as T
        this.htmlElement.innerHTML = text
        if (cssClass != "") {
            this.setClass(cssClass)
        }
    }
    
    public add(module: Module<HTMLElement>): void {
        this._children.push(module)
        this.htmlElement.appendChild(module.htmlElement)
        module.parent = this
    }

    public getChildren(): Module<HTMLElement>[] {
        return this._children
    }

    public removeChildren() {
        this.htmlElement.innerHTML = ""
        this._children = []
    }

    public addHtml(elementType: string, innerHTML: string, cssClass: string = ""): HTMLElement {
        const element = document.createElement(elementType)
        element.innerHTML = innerHTML
        if (cssClass != "") {
            element.classList.add(cssClass)
        }
        this.htmlElement.appendChild(element)
        return element
    }

    public remove(module: Module<HTMLElement>): void {
        let idx = this._children.indexOf(module)
        if (idx >= 0) {
            this._children = this._children.splice(0, idx).concat(this._children.splice(idx + 1))
        }
        this.htmlElement.removeChild(module.htmlElement)
        module.parent = null
    }

    public removeHTML(element: HTMLElement): void {
        this.htmlElement.removeChild(element)
    }

    public isVisible(): boolean {
        return this.htmlElement.style.display.toLowerCase() != "none"
    }

    public hide() {
        if (!this.isVisible()) return
        this._displayStyle = this.htmlElement.style.display
        this.htmlElement.style.display = "None"
    }

    public show() {
        if (this._displayStyle.toLowerCase() == "none") return
        this.htmlElement.style.display = this._displayStyle
    }

    public update(_kwargs: KWARGS, _changedPage: boolean) {}

    public select() {
        this.setClass("selected")
    }

    public unselect() {
        this.unsetClass("selected")
    }

    public setClass(className: string) {
        if (!this.hasClass(className)) {
            this.htmlElement.classList.add(className)
        }
    }

    public unsetClass(className: string) {
        if (this.hasClass(className)) {
            this.htmlElement.classList.remove(className)
        }
    }
    
    public hasClass(className: string) {
        return this.htmlElement.classList.contains(className)
    }

    // To duplicate the object use structuredClone(module):
    // https://developer.mozilla.org/en-US/docs/Web/API/structuredClone
}
