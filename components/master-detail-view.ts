import { KWARGS, Module } from "../module";
import { isSmallScreen } from "../utils/responsive";
import "./master-detail-view.css"


export class MasterDetailView extends Module<HTMLDivElement> {
    public static RESIZE_HANDLE_WIDTH = 10;
    public static MIN_PANEL_WIDTH = 150;
    private isMasterResizing = false;
    private isSidepanelResizing = false;
    private isSmallScreen = false;
    private preferredView: string = "master";
    private master: Module<HTMLElement>;
    private detail: Module<HTMLElement>;
    private sidepanel: Module<HTMLElement> | null = null;

    constructor(
        private masterContent: Module<HTMLElement>,
        private detailContent: Module<HTMLElement>,
        private sidepanelContent: Module<HTMLElement> | null,
        cssClass = "master-detail-view"
    ) {
        super("div", "", cssClass);
        
        this.master = new Module<HTMLElement>("div", "", "master");
        this.master.add(masterContent)
        this.add(this.master);

        this.detail = new Module<HTMLElement>("div", "", "detail");
        this.detail.add(detailContent)
        this.add(this.detail);

        if (sidepanelContent != null) {
            this.sidepanel = new Module<HTMLElement>("div", "", "sidepanel");
            this.sidepanel.add(sidepanelContent)
            this.add(this.sidepanel);
        }

        // Based on screen size, adjust the layout of the master, detail and sidepanel modules
        window.addEventListener("resize", () => {
            this.adjustLayout();
        });
        this.adjustLayout(); // Adjust the layout initially

        // Set up event listeners for resizing
        this.master.htmlElement.addEventListener('mousedown', (e) => this.startResizing(e, 'master'));
        if (this.sidepanel != null) {
            this.sidepanel.htmlElement.addEventListener('mousedown', (e) => this.startResizing(e, 'sidepanel'));
        }
        document.addEventListener('mousemove', (e) => this.onResize(e));
        document.addEventListener('mouseup', () => this.endResizing());
    }

    public update(kwargs: KWARGS, changedPage: boolean): void {
        this.masterContent.update(kwargs, changedPage);
        this.detailContent.update(kwargs, changedPage);
        this.sidepanelContent?.update(kwargs, changedPage);
    }

    public setPreferedView(preferredView: string): void {
        // Check if preferred view is in ["master", "detail"]
        if (!["master", "detail"].includes(preferredView)) {
            throw new Error("Invalid preferred view. Please choose 'master' or 'detail'.");
        }
        console.log("setPreferedView", preferredView)
        this.preferredView = preferredView;
        this.adjustLayout();
    }

    // Function to adjust the layout based on screen size
    private adjustLayout() {
        this.isSmallScreen = isSmallScreen()
        if (this.isSmallScreen) { // For small screens, show only one module
            this.master.hide();
            this.detail.hide();
            if (this.sidepanel != null) {
                this.sidepanel.hide();
            }
            if (this.preferredView === "detail") {
                this.detail.show();
            } else {
                this.master.show();
            }
            // Make shown modules fullscreen
            this.master.htmlElement.style.width = "100%";
            this.master.htmlElement.style.paddingRight = `0px`;
            if (this.sidepanel != null) {
                this.sidepanel.htmlElement.style.width = "100%";
                this.sidepanel.htmlElement.style.paddingLeft = `0px`;
            }
            this.detail.htmlElement.style.width = "100%";
        } else { // For larger screens, show all modules
            this.detail.show();
            this.master.show();
            if (this.sidepanel != null) {
                this.sidepanel.show();
            }
            // load stored panelsize from local storage or set default split if not found
            let storedPanelSize = localStorage.getItem("webui_masterDetailViewPanelSizes");
            if (!storedPanelSize) {
                storedPanelSize = "20,30"; // default split for master and sidepanel
            }
            let [masterPercentage, sidepanelPercentage] = storedPanelSize.split(",").map(Number);
            this.master.htmlElement.style.width = masterPercentage + "%";
            this.master.htmlElement.style.paddingRight = `${MasterDetailView.RESIZE_HANDLE_WIDTH}px`;
            const containerWidth = this.htmlElement.clientWidth;
            let paddingPercent = MasterDetailView.RESIZE_HANDLE_WIDTH / containerWidth * 100
            if (this.sidepanel != null) {
                this.sidepanel.htmlElement.style.width = sidepanelPercentage + "%";
                this.sidepanel.htmlElement.style.paddingLeft = `${MasterDetailView.RESIZE_HANDLE_WIDTH}px`;
                this.detail.htmlElement.style.width = (100 - (2 * paddingPercent) - (masterPercentage + sidepanelPercentage)) + "%";
            } else {
                this.detail.htmlElement.style.width = (100 - paddingPercent - masterPercentage) + "%";
            }
            
            const rect = this.master.htmlElement.getBoundingClientRect();
            if (rect.right - rect.left < MasterDetailView.MIN_PANEL_WIDTH) {
                this.masterContent.hide()
                this.master.htmlElement.style.width = "0px"
                masterPercentage = 0;
            } else {
                this.masterContent.show()
            }
            if (this.sidepanel != null && this.sidepanelContent != null) {
                const rect = this.sidepanel.htmlElement.getBoundingClientRect();
                if(rect.right - rect.left < MasterDetailView.MIN_PANEL_WIDTH) {
                    this.sidepanelContent.hide()
                    this.sidepanel.htmlElement.style.width = "0px"
                    sidepanelPercentage = 0
                } else {
                    this.sidepanelContent.show()
                }
            }
            paddingPercent = MasterDetailView.RESIZE_HANDLE_WIDTH / containerWidth * 100
            if (this.sidepanel != null) {
                this.sidepanel.htmlElement.style.width = sidepanelPercentage + "%";
                this.sidepanel.htmlElement.style.paddingLeft = `${MasterDetailView.RESIZE_HANDLE_WIDTH}px`;
                this.detail.htmlElement.style.width = (100 - (2 * paddingPercent) - (masterPercentage + sidepanelPercentage)) + "%";
            } else {
                this.detail.htmlElement.style.width = (100 - paddingPercent - masterPercentage) + "%";
            }
        }
    }

    private startResizing(e: MouseEvent, panel: 'master' | 'sidepanel') {
        // prevent resizing in small screen mode
        if (this.isSmallScreen) return;
        // handle resizing for master and sidepanel
        if (panel === 'master') {
            const rect = this.master.htmlElement.getBoundingClientRect();
            if (rect.right - e.clientX <= MasterDetailView.RESIZE_HANDLE_WIDTH) {
                this.isMasterResizing = true;
                e.preventDefault();
            }
        } else if (panel === 'sidepanel' && this.sidepanel != null) {
            const rect = this.sidepanel.htmlElement.getBoundingClientRect();
            if (e.clientX - rect.left <= MasterDetailView.RESIZE_HANDLE_WIDTH) {
                this.isSidepanelResizing = true;
                e.preventDefault();
            }
        }
    }

    private onResize(e: MouseEvent) {
        if (this.isMasterResizing || this.isSidepanelResizing) {
            e.preventDefault();
            const containerWidth = this.htmlElement.clientWidth;
            let storedPanelSize = localStorage.getItem("webui_masterDetailViewPanelSizes");
            if (!storedPanelSize) {
                storedPanelSize = "20,30"; // default split for master and sidepanel
            }
            let [masterPercentage, sidepanelPercentage] = storedPanelSize.split(",").map(Number);
            let newMasterWidth = masterPercentage * containerWidth / 100;
            let newSidepanelWidth = sidepanelPercentage * containerWidth / 100;
            
            if (this.isMasterResizing) {
                const masterRect = this.master.htmlElement.getBoundingClientRect();
                newMasterWidth = Math.max(0, Math.min(e.clientX - masterRect.left, containerWidth / 2 - 10)); // Min width of 10% and max width of container - 50px for sidepanel
                if (newMasterWidth < MasterDetailView.MIN_PANEL_WIDTH) {
                    newMasterWidth = 0;
                }
                this.master.htmlElement.style.width = `${newMasterWidth}px`;
                masterPercentage = (newMasterWidth / containerWidth) * 100
            } else if (this.isSidepanelResizing && this.sidepanel != null) {
                const sidepanelRect = this.sidepanel.htmlElement.getBoundingClientRect();
                newSidepanelWidth = Math.max(0 , Math.min(sidepanelRect.right - e.clientX, containerWidth / 2 - 10)); // Min width of 10% and max width of container - 50px for master
                if (newSidepanelWidth < MasterDetailView.MIN_PANEL_WIDTH) {
                    newSidepanelWidth = 0;
                }
                this.sidepanel.htmlElement.style.width = `${newSidepanelWidth}px`;
                sidepanelPercentage = (newSidepanelWidth / containerWidth) * 100;
            }
            let paddingPercent = MasterDetailView.RESIZE_HANDLE_WIDTH / containerWidth * 100
            if (this.sidepanel != null) {
                this.detail.htmlElement.style.width = (100 - 2 * paddingPercent - (masterPercentage + sidepanelPercentage)) + "%";
            } else {
                this.detail.htmlElement.style.width = (100 - paddingPercent - masterPercentage) + "%";
            }
            localStorage.setItem("webui_masterDetailViewPanelSizes", `${masterPercentage},${sidepanelPercentage}`);
            this.adjustLayout()
        }
    }

    private endResizing() {
        this.isMasterResizing = false;
        this.isSidepanelResizing = false;
    }
}