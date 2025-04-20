// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Interact_with_the_clipboard

export async function copyToClipboard(value: string) {
    if (!navigator.clipboard) {
        alert("Browser don't have support for native clipboard.")
    }

    await navigator.clipboard.writeText(value)
}