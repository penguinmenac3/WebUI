import { Module } from "./module";


export class Button extends Module<HTMLLinkElement> {
    constructor(text: string, cssClass: string = "") {
        super("a", text, cssClass)
        this.htmlElement.onclick = (e: Event) => {
            e.stopPropagation()
            this.onClick()
        }
    }

    public onClick() {
        console.log("Buttom::onClick: Not implemented! Must be implemented by subclass.")
    }
}


export class Form extends Module<HTMLDivElement> {
    constructor(...modules: Module<HTMLElement>[]) {
        super("div")
        for (const module of modules) {
            this.add(module)
        }
    }

    public submit() {
        let params = new FormData()
        for (const key in this.htmlElement.children) {
            let module = this.htmlElement.children[key]
            if (module instanceof HTMLInputElement) {
                params.append(module.name, module.value)
            }
        }
        this.onSubmit(params)
    }

    public onSubmit(formData: FormData) {
        console.log("Form::onSubmit: Not implemented! Must be implemented by subclass.")
        console.log(formData)
    }
}

export class FormInput extends Module<HTMLInputElement> {
    constructor(name: string, placeholder: string, type: string, cssClass: string = "") {
        super("input")
        this.htmlElement.name = name
        this.htmlElement.placeholder = placeholder
        this.htmlElement.type = type
        if (cssClass != "") {
            this.setClass(cssClass)
        }
        this.htmlElement.oninput = () => {
            this.onChange(this.htmlElement.value)
        }
        this.htmlElement.onchange = () => {
            this.onChangeDone(this.htmlElement.value)
        }
    }

    public value(setval: string | undefined = undefined): string {
        if (setval !== undefined) {
            this.htmlElement.value = setval
        }
        return this.htmlElement.value
    }

    public onChange(_value: string) {
        //console.log(value)
    }

    public onChangeDone(_value: string) {
        //console.log(value)
    }
}

export class FormLabel extends Module<HTMLLabelElement> {
    constructor(text: string, cssClass: string = "") {
        super("label", text, cssClass)
    }
}

export class FormCheckbox extends Module<HTMLDivElement> {
    constructor(name: string, text: string, cssClass: string = "", initialValue: boolean = false) {
        super("div")
        let checkbox = new Module<HTMLInputElement>("input")
        checkbox.htmlElement.name = name
        checkbox.htmlElement.type = "checkbox"
        checkbox.htmlElement.checked = initialValue
        if (cssClass != "") {
            this.setClass(cssClass)
        }
        checkbox.htmlElement.onchange = () => {
            this.onChange(checkbox.htmlElement.checked)
        }
        this.add(checkbox)
        let label = new Module<HTMLLabelElement>("label")
        label.htmlElement.innerHTML = text
        this.add(label)
    }

    public onChange(_state: boolean) {
        console.log("Checkbox::onChange: Not implemented! Must be implemented by subclass.")
    }
}

export class FormSubmit extends Button {
    public onClick() {
        let parent = this.parent as Form
        parent.submit()
    }
}
