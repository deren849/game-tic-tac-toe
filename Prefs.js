import { readStorage, writeStorage } from './storage.js';
export const ROUND_LIMITS = [0, 3, 5, 7, 10];
;
const STORAGE_KEY = 'ttt:prefs';
export function defaultPrefs() {
    return { soundOn: true, volume: 60, effectsOn: true, roundLimit: 0 };
}
function sanitizePrefs(raw) {
    const base = defaultPrefs();
    if (typeof raw !== "object" || raw === null)
        return base;
    const data = raw;
    const soundOn = data['soundOn'];
    const volume = data['volume'];
    const effectsOn = data['effectsOn'];
    const roundLimit = data['roundLimit'];
    return {
        soundOn: typeof soundOn === 'boolean' ? soundOn : base.soundOn,
        volume: typeof volume === 'number' && Number.isFinite(volume)
            ? Math.min(100, Math.max(0, Math.round(volume)))
            : base.volume,
        effectsOn: typeof effectsOn === 'boolean' ? effectsOn : base.effectsOn,
        roundLimit: ROUND_LIMITS.find((limit) => limit === roundLimit) ?? base.roundLimit,
    };
}
export function loadPrefs() {
    const stored = readStorage(STORAGE_KEY);
    if (stored === null)
        return defaultPrefs();
    try {
        return sanitizePrefs(JSON.parse(stored));
    }
    catch {
        return defaultPrefs();
    }
}
export function savePrefs(prefs) {
    writeStorage(STORAGE_KEY, JSON.stringify(prefs));
}
export function readPrefsForm(form, current) {
    const data = new FormData(form);
    return sanitizePrefs({
        ...current,
        soundOn: data.has("soundOn"),
        volume: Number(data.get("volume") ?? current.volume),
        effectsOn: data.has("effectsOn"),
    });
}
export function writePrefsForm(form, prefs) {
    setCheckbox(form, 'soundOn', prefs.soundOn);
    setCheckbox(form, 'effectsOn', prefs.effectsOn);
    const volume = form.elements.namedItem('volume');
    if (volume instanceof HTMLInputElement)
        volume.value = String(prefs.volume);
}
function setCheckbox(form, name, checked) {
    const input = form.elements.namedItem(name);
    if (input instanceof HTMLInputElement)
        input.checked = checked;
}
