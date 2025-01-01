import "./master-detail-view.css"
import { KWARGS, Module } from "../module";
import { isSmallScreen } from "../utils/responsive";


export class MasterDetailView extends Module<HTMLElement> {
    private isSidepanelResizing = false;
    private isMasterResizing = false;
    private preferredView: string = "master";
    private master: Module<HTMLElement>;
    private detail: Module<HTMLElement>;
    private sidepanel: Module<HTMLElement> | null = null;
    private leftHandleWidth: number = 0;
    private rightHandleWidth: number = 0;

    static MIN_PANEL_WIDTH = 200; // Minimum panel width in pixels

    constructor(
        private masterContent: Module<HTMLElement>,
        private detailContent: Module<HTMLElement>,
        private sidepanelContent: Module<HTMLElement> | null,
        cssClass = "master-detail-view"
    ) {
        super("div", "", cssClass);

        this.master = new Module<HTMLElement>("div", "", "master");
        this.detail = new Module<HTMLElement>("div", "", "detail");
        window.setTimeout(() => {
            let detailStyle = getComputedStyle(this.detail.htmlElement)
            this.leftHandleWidth = parseFloat(detailStyle.getPropertyValue('border-left-width'))
            this.rightHandleWidth = parseFloat(detailStyle.getPropertyValue('border-right-width'))
            this.adjustLayout();
        }, 100);
        this.setupLayout();
        this.addEventListeners();
    }

    private setupLayout(): void {
        this.master.add(this.masterContent);
        this.add(this.master);

        this.detail.add(this.detailContent);
        this.add(this.detail);

        if (this.sidepanelContent != null) {
            this.sidepanel = new Module<HTMLElement>("div", "", "sidepanel");
            this.sidepanel.add(this.sidepanelContent);
            this.add(this.sidepanel);
        }
    }

    private addEventListeners(): void {
        window.addEventListener("resize", () => this.adjustLayout());
        this.detail.htmlElement.addEventListener('mousedown', (e) => this.startResizing(e));
        window.addEventListener('mousemove', (e) => this.onResize(e));
        window.addEventListener('mouseup', () => this.endResizing());

        // CTRL + B toggles master
        // CTRL + ALT + B toggles sidepanel
        document.addEventListener('keydown', e => {
            if (e.ctrlKey && e.key === 'B') {
                e.preventDefault()
                let [masterPercentage, sidepanelPercentage] = this.getStoredPanelSizes()
                if (e.altKey) {
                    if (sidepanelPercentage > 0) {
                        sidepanelPercentage = 0
                    } else {
                        sidepanelPercentage = 30
                    }
                } else {
                    if (masterPercentage > 0) {
                        masterPercentage = 0
                    } else {
                        masterPercentage = 30
                    }
                }
                localStorage.setItem("webui_masterDetailViewPanelSizes", `${masterPercentage},${sidepanelPercentage}`)
                this.adjustLayout()
            }
        })
    }

    public update(kwargs: KWARGS, changedPage: boolean): void {
        this.masterContent.update(kwargs, changedPage);
        this.detailContent.update(kwargs, changedPage);
        this.sidepanelContent?.update(kwargs, changedPage);
    }

    public setPreferedView(preferredView: string): void {
        if (!["master", "detail"].includes(preferredView)) {
            throw new Error("Invalid preferred view. Please choose 'master' or 'detail'.");
        }
        this.preferredView = preferredView;
        this.adjustLayout();
    }

    private adjustLayout(): void {
        if (isSmallScreen()) {
            this.adjustLayoutForSmallScreens();
        } else {
            this.adjustLayoutForLargeScreens();
        }
    }

    private adjustLayoutForSmallScreens(): void {
        this.detail.htmlElement.style.borderLeftWidth = "0px"
        this.detail.htmlElement.style.borderRightWidth = "0px"
        if (this.preferredView === "detail") {
            this.master.hide();
            this.detail.show();
        } else {
            this.detail.hide();
            this.master.show();
        }
        this.sidepanel?.hide();
        this.detail.htmlElement.style.width = "100%";
        this.master.htmlElement.style.width = "100%";
    }

    private adjustLayoutForLargeScreens(): void {
        this.detail.htmlElement.style.borderLeftWidth = ""
        this.detail.htmlElement.style.borderRightWidth = ""
        this.master.show();
        this.detail.show();
        this.sidepanel?.show();

        let [masterPercentage, sidepanelPercentage] = this.getStoredPanelSizes();
        [masterPercentage, sidepanelPercentage] = this.autohideSmallPanels(masterPercentage, sidepanelPercentage);

        this.master.htmlElement.style.width = `${masterPercentage}%`;
        if (masterPercentage == 0) {
            this.masterContent.hide()
        } else {
            this.masterContent.show()
        }
        if (this.sidepanel != null) {
            this.sidepanel.htmlElement.style.width = `${sidepanelPercentage}%`;
            if (sidepanelPercentage == 0) {
                this.sidepanelContent?.hide()
            } else {
                this.sidepanelContent?.show()
            }
        }
        this.detail.htmlElement.style.width = 100 - (masterPercentage + sidepanelPercentage) + "%";
    }

    private getStoredPanelSizes(): [number, number] {
        let storedPanelSize = localStorage.getItem("webui_masterDetailViewPanelSizes");
        if (!storedPanelSize) {
            storedPanelSize = "30,0"; // default split for master and sidepanel
        }
        let [master, sidepanel] = storedPanelSize.split(",").map(Number)
        if (this.sidepanel == null) {
            sidepanel = 0
        }
        return [master, sidepanel];
    }

    private autohideSmallPanels(masterWidth: number, sidepanelWidth: number): [number, number] {
        const containerWidth = this.htmlElement.clientWidth;
        let absoluteMasterWidth = masterWidth * containerWidth / 100;
        if (absoluteMasterWidth < MasterDetailView.MIN_PANEL_WIDTH) {
            masterWidth = 0;
        }
        let absoluteSidepanelWidth = sidepanelWidth * containerWidth / 100;
        if (absoluteSidepanelWidth < MasterDetailView.MIN_PANEL_WIDTH) {
                sidepanelWidth = 0;
        }
        return [masterWidth, sidepanelWidth];
    }

    private startResizing(e: MouseEvent): void {
        if (isSmallScreen()) return;

        const rect = this.detail.htmlElement.getBoundingClientRect();
        if (e.clientX - rect.left <= this.leftHandleWidth) {
            this.isMasterResizing = true;
            e.preventDefault();
        }
        if (rect.right - e.clientX <= this.rightHandleWidth) {
            this.isSidepanelResizing = true;
            e.preventDefault();
        }
    }

    private onResize(e: MouseEvent): void {
        if (!this.isMasterResizing && !this.isSidepanelResizing) return;

        const containerWidth = this.htmlElement.clientWidth;
        let [masterPercentage, sidepanelPercentage] = this.getStoredPanelSizes();
        if (this.isMasterResizing) {
            masterPercentage = e.clientX / containerWidth * 100;
            masterPercentage = Math.max(0, Math.min(masterPercentage, 50)); // Min width of 0% and max width of 50%
            if (masterPercentage < MasterDetailView.MIN_PANEL_WIDTH / containerWidth * 100) {
                masterPercentage = 0;
            }
        } else if (this.isSidepanelResizing) {
            sidepanelPercentage = 100 - (e.clientX / containerWidth * 100);
            sidepanelPercentage = Math.max(0, Math.min(sidepanelPercentage, 50)); // Min width of 0% and max width of 50%
            if (sidepanelPercentage < MasterDetailView.MIN_PANEL_WIDTH / containerWidth * 100) {
                sidepanelPercentage = 0;
            }
        }
        localStorage.setItem("webui_masterDetailViewPanelSizes", `${masterPercentage},${sidepanelPercentage}`);
        this.adjustLayout();
    }

    private endResizing(): void {
        this.isMasterResizing = false;
        this.isSidepanelResizing = false;
    }
}