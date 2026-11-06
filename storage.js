export function readStorage(key) {
    try {
        return window.localStorage.getItem(key);
    }
    catch {
        return null;
    }
}
export function writeStorage(key, value) {
    try {
        window.localStorage.setItem(key, value);
    }
    catch {
        // ini di abaikan pengaturan tidak di simpan tapi game masih bisa jalan inngat ini
    }
}
