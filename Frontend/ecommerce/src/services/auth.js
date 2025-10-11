export function getAuth() {
    try {
        return JSON.parse(localStorage.getItem("auth" ) || "{}")
    } catch {
        return {}
    }
}