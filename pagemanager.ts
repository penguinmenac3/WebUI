import { KWARGS, Module } from "./module";

export interface Pages{
    [x: string]: Module<HTMLElement>
}


export class PageManager {
    private currentPage = ""

    constructor(
        private defaultPage: string,
        private pages: Pages,
    ) {
        for (const page in pages) {
            document.getElementById("app")?.appendChild(pages[page].htmlElement)
            pages[page].hide()
        }
        window.onhashchange = (_: HashChangeEvent) => {
            this.onOpen()
        }
        if (location.hash.slice(1) == "") {
            // Change hash to default page but do not call onOpen,
            // since that is done automatically when we change hash
            location.hash = "#" + defaultPage;
        } else {
            this.onOpen()
        }
    }

    private onOpen() {
        let kwargs: KWARGS = {}

        let hash = location.hash.slice(1)  // remove #
        if (hash.length == 0) {
            hash = this.defaultPage
        }
        let parts = hash.split("&")
        let page = parts[0]
        parts = parts.splice(1)
        for (const part of parts) {
            let tokens = part.split("=")
            let key = decodeURIComponent(tokens[0])
            let val = decodeURIComponent(tokens[1])
            kwargs[key] = val
        }

        let changedPage = this.currentPage != page
        if (changedPage) {
            console.log("Hide page: " + this.currentPage)
            this.pages[this.currentPage]?.hide()
            this.currentPage = page
            console.log("Show page: " + page)
            this.pages[this.currentPage]?.show()
        }
        console.log("Calling page.update with: " + JSON.stringify(kwargs) + " changedPage=" + changedPage)

        this.pages[this.currentPage]?.update(kwargs, changedPage)
    }

    public static open(page: string, kwargs: KWARGS) {
        window.setTimeout(() => {
            let kwargs_str = ""
            for (let key in kwargs) {
                kwargs_str += "&" + encodeURIComponent(key) + "=" + encodeURIComponent(kwargs[key])
            }
            location.hash = "#" + encodeURIComponent(page) + kwargs_str
        }, 200)
    }

    public static update(kwargs: KWARGS) {
        let hash = location.hash.slice(1)  // remove #
        let parts = hash.split("&")
        let page = parts[0]
        parts = parts.splice(1)
        for (const part of parts) {
            let tokens = part.split("=")
            let key = decodeURIComponent(tokens[0])
            let val = decodeURIComponent(tokens[1])
            if (!kwargs.hasOwnProperty(key)) {
                kwargs[key] = val
            }
        }
        window.setTimeout(() => {
            let kwargs_str = ""
            for (let key in kwargs) {
                kwargs_str += "&" + encodeURIComponent(key) + "=" + encodeURIComponent(kwargs[key])
            }
            location.hash = "#" + encodeURIComponent(page) + kwargs_str
        }, 200)
    }

    public static back() {
        history.back()
    }
}
