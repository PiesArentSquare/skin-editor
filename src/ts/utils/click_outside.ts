export default function click_outside(node: Node) {
    const handle_click = (e: MouseEvent) => {
        if (!node.contains(<Node>e.target)) {
            node.dispatchEvent(new CustomEvent('outclick'))
        }
    }

    document.addEventListener('mousedown', handle_click, true)

    return {
        destroy() {
            document.removeEventListener('mousedown', handle_click, true)
        }
    }
}