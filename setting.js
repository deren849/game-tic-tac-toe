import { readStorage, writeStorage } from './storage.js';
const COLOR_MODES = ['default', 'redGreen', 'blueYellow', 'mono'];
const TEXT_SCALES = ["normal", "large", "xlarge"];
const STORAGE_KEY = "ttt:a11y";
export function defaultSettings() {
    return {
        colorMode: 'default',
        textScale: 'normal',
        highContrast: false,
        readableFont: false,
        reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    };
}
function isOneOf(list, value) {
    return typeof value === "string" && list.includes(value);
}
function sanitizerSettings(raw) {
    const base = defaultSettings();
    if (typeof raw !== "object" || raw === null)
        return base;
    const data = raw;
    const colorMode = data["colorMode"];
    const textScale = data["textScale"];
    const highContrast = data["highContrast"];
    const readableFont = data["readableFont"];
    const reduceMotion = data["reduceMotion"];
    return {
        colorMode: isOneOf(COLOR_MODES, colorMode) ? colorMode : base.colorMode,
        textScale: isOneOf(TEXT_SCALES, textScale) ? textScale : base.textScale,
        highContrast: typeof highContrast === "boolean" ? highContrast : base.highContrast,
        readableFont: typeof readableFont === "boolean" ? readableFont : base.readableFont,
        reduceMotion: typeof reduceMotion === "boolean" ? reduceMotion : base.reduceMotion,
    };
}
export function loadSetting() {
    const stored = readStorage(STORAGE_KEY);
    if (stored === null)
        return { settings: defaultSettings(), firstVisit: true };
    try {
        return { settings: sanitizerSettings(JSON.parse(stored)), firstVisit: false };
    }
    catch {
        return { settings: defaultSettings(), firstVisit: true };
    }
}
export function saveSettings(settings) {
    writeStorage(STORAGE_KEY, JSON.stringify(settings));
}
export function applySetting(settings) {
    const root = document.documentElement;
    root.dataset.color = settings.colorMode;
    root.dataset.contrast = settings.highContrast ? "high" : "normal";
    root.dataset.text = settings.textScale;
    root.dataset.font = settings.readableFont ? "readable" : "default";
    root.dataset.motion = settings.reduceMotion ? "reduce" : "full";
}
export function readSettingForm(form) {
    const data = new FormData(form);
    return sanitizerSettings({
        colorMode: data.get("colorMode"),
        textScale: data.get("textScale"),
        highContrast: data.has("highContrast"),
        readableFont: data.has("readableFont"),
        reduceMotion: data.has("reduceMotion"),
    });
}
export function writeSettingsForm(form, settings) {
    setRadio(form, "colorMode", settings.colorMode);
    setRadio(form, "textScale", settings.textScale);
    setCheckbox(form, "highContrast", settings.highContrast);
    setCheckbox(form, "readableFont", settings.readableFont);
    setCheckbox(form, "reduceMotion", settings.reduceMotion);
}
function setRadio(form, name, value) {
    const group = form.elements.namedItem(name);
    if (group instanceof RadioNodeList)
        group.value = value;
}
function setCheckbox(form, name, checked) {
    const input = form.elements.namedItem(name);
    if (input instanceof HTMLInputElement)
        input.checked = checked;
}
