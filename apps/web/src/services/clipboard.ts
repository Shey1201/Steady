import { useUiStore } from "../stores/ui";

let timer: number | null = null;
let lastText = "";

async function readClipboard(): Promise<string> {
  try {
    const t = await navigator.clipboard.readText();
    return t || "";
  } catch {
    return "";
  }
  return "";
}

export function startClipboardWatch() {
  if (timer) return;
  const ui = useUiStore();
  timer = window.setInterval(async () => {
    const t = (await readClipboard()).trim();
    if (!t) return;
    if (t === lastText) return;
    lastText = t;
    ui.openQuickWithText(t);
  }, 1000);
}

export function stopClipboardWatch() {
  if (timer) {
    window.clearInterval(timer);
    timer = null;
  }
}
