export default class Sidebar {
  appElement: HTMLElement
  sidebarToggleButton: HTMLButtonElement

  constructor() {
    const appElement = document.querySelector("#app")
    if (appElement === null) {
      throw new Error("Could not find app element")
    }
    const sidebarToggleButton = document.querySelector("#sidebar-toggle");
    if (sidebarToggleButton === null) {
      throw new Error("Could not find sidebar toggle button")
    }
    this.appElement = appElement as HTMLElement
    this.sidebarToggleButton = sidebarToggleButton as HTMLButtonElement
    if (window.matchMedia("(max-width: 800px)").matches) {
      this.appElement.classList.add("sidebar-collapsed");
    }
    this.sidebarToggleButton.setAttribute("aria-expanded", String(this.isOpen));
    this.sidebarToggleButton.addEventListener("click", () => this.isOpen = !this.isOpen)
  }

  get isOpen(): boolean {
    return !this.appElement.classList.contains("sidebar-collapsed");
  }
  
  set isOpen(value: boolean) {
    this.appElement.classList.toggle("sidebar-collapsed", !value);
    this.sidebarToggleButton.setAttribute("aria-expanded", String(value));
  }
}