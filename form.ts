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

export class FormRadioButton extends Module<HTMLDivElement> {
    private radioButton: Module<HTMLInputElement>
    constructor(name: string, text: string, cssClass: string = "") {
        super("div")
        this.radioButton = new Module<HTMLInputElement>("input")
        this.radioButton.htmlElement.name = name
        this.radioButton.htmlElement.type = "radio"
        if (cssClass != "") {
            this.setClass(cssClass)
        }
        this.radioButton.htmlElement.onchange = () => {
            this.onChange(this.radioButton.htmlElement.checked)
        }
        this.add(this.radioButton)
        let label = new Module<HTMLLabelElement>("label")
        label.htmlElement.innerHTML = text
        this.add(label)
    }

    public onChange(_state: boolean) {
        console.log("RadioButton::onChange: Not implemented! Must be impleemnted by subclass.")
    }

    public value (setval: boolean | undefined = undefined): boolean {
        if (setval !== undefined) {
            this.radioButton.htmlElement.checked = setval
        }
        return this.radioButton.htmlElement.checked
    }
}

export class FormRadioButtonGroup extends Module<HTMLDivElement> {
    private selectedIndex: number = 0
    private radioButtons: FormRadioButton[] = []
    constructor(groupName: string, labels: string[], cssClass: string = "") {
        super("div", "", cssClass)
        for (let i = 0; i < labels.length; i++) {
            let radioButton = new FormRadioButton(groupName, labels[i],  "")
            radioButton.onChange = (state: boolean) => {
                if (state){
                    this.selectedIndex = i
                    this.onChange(i)
                }
            }
            this.add(radioButton)
            this.radioButtons.push(radioButton)
        }
    }

    public onChange(_selectedIndex: number) {
        console.log("RadioButtonGroup::onChange: Not implemented! Must be impleemnted by subclass.")
    }

    public value (setval: number | undefined = undefined): number {
        if (setval !== undefined) {
            this.radioButtons[setval].value(true)
            this.selectedIndex = setval
        }
        return this.selectedIndex
    }
}

export class FormLabel extends Module<HTMLLabelElement> {
    constructor(text: string, cssClass: string = "") {
        super("label", text, cssClass)
    }
}

export class FormCheckbox extends Module<HTMLDivElement> {
    private checkbox: Module<HTMLInputElement>

    constructor(name: string, text: string, cssClass: string = "", initialValue: boolean = false) {
        super("div")
        this.checkbox = new Module<HTMLInputElement>("input")
        this.checkbox.htmlElement.name = name
        this.checkbox.htmlElement.type = "checkbox"
        this.checkbox.htmlElement.checked = initialValue
        if (cssClass != "") {
            this.setClass(cssClass)
        }
        this.checkbox.htmlElement.onchange = () => {
            this.onChange(this.checkbox.htmlElement.checked)
        }
        this.add(this.checkbox)
        let label = new Module<HTMLLabelElement>("label")
        label.htmlElement.innerHTML = text
        this.add(label)
    }

    public onChange(_state: boolean) {
        console.log("Checkbox::onChange: Not implemented! Must be implemented by subclass.")
    }

    public value(setval: boolean | undefined = undefined): boolean {
        if (setval !== undefined) {
            this.checkbox.htmlElement.checked = setval
        }
        return this.checkbox.htmlElement.checked
    }
}

export class FormSubmit extends Button {
    public onClick() {
        let parent = this.parent as Form
        parent.submit()
    }
}
