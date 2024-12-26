import { KWARGS, Module } from "../module";
import { isSmallScreen } from "../utils/responsive";


export class MasterDetailView extends Module<HTMLDivElement> {
    public static RESIZE_HANDLE_WIDTH = 10;
    public static MIN_PANEL_WIDTH = 300;
    private isMasterResizing = false;
    private isSidepanelResizing = false;
    private isSmallScreen = false;
    private preferredView: string = "master";
    private master: Module<HTMLElement>;
    private detail: Module<HTMLElement>;
    private sidepanel: Module<HTMLElement>;

    constructor(
        masterContent: Module<HTMLElement>,
        detailContent: Module<HTMLElement>,
        sidepanelContent: Module<HTMLElement>,
        cssClass = ""
    ) {
        super("div", "", cssClass);        
        this.detail = new Module<HTMLElement>("div", "", "detail");
        this.detail.add(detailContent)
        this.add(this.detail);

        this.master = new Module<HTMLElement>("div", "", "master");
        this.master.add(masterContent)
        this.add(this.master);

        this.sidepanel = new Module<HTMLElement>("div", "", "sidepanel");
        this.sidepanel.add(sidepanelContent)
        this.add(this.sidepanel);

        // Based on screen size, adjust the layout of the master, detail and sidepanel modules
        window.addEventListener("resize", () => {
            this.adjustLayout();
        });
        this.adjustLayout(); // Adjust the layout initially

        // Set up event listeners for resizing
        this.master.htmlElement.addEventListener('mousedown', (e) => this.startResizing(e, 'master'));
        this.sidepanel.htmlElement.addEventListener('mousedown', (e) => this.startResizing(e, 'sidepanel'));
        document.addEventListener('mousemove', (e) => this.onResize(e));
        document.addEventListener('mouseup', () => this.endResizing());
    }

    public async update(kwargs: KWARGS, changedPage: boolean): Promise<void> {
        await this.master.update(kwargs, changedPage);
        await this.detail.update(kwargs, changedPage);
    }

    public setPreferedView(preferredView: string): void {
        // Check if preferred view is in ["master", "detail"]
        if (!["master", "detail"].includes(preferredView)) {
            throw new Error("Invalid preferred view. Please choose 'master' or 'detail'.");
        }
        this.preferredView = preferredView;
    }

    // Function to adjust the layout based on screen size
    private adjustLayout() {
        this.isSmallScreen = isSmallScreen()
        if (this.isSmallScreen) { // For small screens, show only one module
            this.master.hide();
            this.detail.hide();
            this.sidepanel.hide();
            if (this.preferredView === "detail") {
                this.detail.show();
            } else {
                this.master.show();
            }
            // Make shown modules fullscreen
            this.master.htmlElement.style.width = "100%";
            this.master.htmlElement.style.paddingRight = `0px`;
            this.sidepanel.htmlElement.style.width = "100%";
            this.sidepanel.htmlElement.style.paddingLeft = `0px`;
        } else { // For larger screens, show all modules
            this.detail.show();
            this.master.show();
            this.sidepanel.show();
            // load stored panelsize from local storage or set default split if not found
            let storedPanelSize = localStorage.getItem("webui_masterDetailViewPanelSizes");
            if (!storedPanelSize) {
                storedPanelSize = "20,30"; // default split for master and sidepanel
            }
            const [masterPercentage, sidepanelPercentage] = storedPanelSize.split(",").map(Number);
            this.master.htmlElement.style.width = masterPercentage + "%";
            this.master.htmlElement.style.paddingRight = `${MasterDetailView.RESIZE_HANDLE_WIDTH}px`;
            this.sidepanel.htmlElement.style.width = sidepanelPercentage + "%";
            this.sidepanel.htmlElement.style.paddingLeft = `${MasterDetailView.RESIZE_HANDLE_WIDTH}px`;
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
        } else if (panel === 'sidepanel') {
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
            const masterRect = this.master.htmlElement.getBoundingClientRect();
            const sidepanelRect = this.sidepanel.htmlElement.getBoundingClientRect();

            let newMasterWidth = masterRect.right - masterRect.left;
            let newSidepanelWidth = sidepanelRect.right - sidepanelRect.left;

            if (this.isMasterResizing) {
                newMasterWidth = Math.max(0, Math.min(e.clientX - masterRect.left, containerWidth / 2 - 10)); // Min width of 10% and max width of container - 50px for sidepanel
                this.master.htmlElement.style.width = `${newMasterWidth}px`;
                if (newMasterWidth < MasterDetailView.MIN_PANEL_WIDTH) {
                    newMasterWidth = MasterDetailView.RESIZE_HANDLE_WIDTH;
                }
            } else if (this.isSidepanelResizing) {
                newSidepanelWidth = Math.max(0 , Math.min(sidepanelRect.right - e.clientX, containerWidth / 2 - 10)); // Min width of 10% and max width of container - 50px for master
                this.sidepanel.htmlElement.style.width = `${newSidepanelWidth}px`;
                if (newSidepanelWidth < MasterDetailView.MIN_PANEL_WIDTH) {
                    newSidepanelWidth = MasterDetailView.RESIZE_HANDLE_WIDTH;
                }
            }
            localStorage.setItem("webui_masterDetailViewPanelSizes", `${(newMasterWidth / containerWidth) * 100},${(newSidepanelWidth / containerWidth) * 100}`);
        }
    }

    private endResizing() {
        this.isMasterResizing = false;
        this.isSidepanelResizing = false;
    }
}