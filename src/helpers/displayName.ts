// Display name shown to other devices. Never the raw peer ID.
// Persisted locally so a device keeps the same name across sessions.

const STORAGE_KEY = 'p2p.displayName'

const FIRST = ['Sunny', 'Misty', 'Brave', 'Calm', 'Happy', 'Swift', 'Gentle', 'Bright', 'Quiet', 'Lucky']
const SECOND = ['Panda', 'Otter', 'Fox', 'Heron', 'Tapir', 'Gecko', 'Koala', 'Badger', 'Crane', 'Wombat']

export function generateDisplayName(): string {
    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]
    return `${pick(FIRST)} ${pick(SECOND)}`
}

export function loadDisplayName(): string {
    try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved && saved.trim().length > 0) {
            return saved.trim().slice(0, 24)
        }
    } catch {
        // Storage unavailable (private mode, etc.) — fall through to generated.
    }
    const generated = generateDisplayName()
    saveDisplayName(generated)
    return generated
}

export function saveDisplayName(name: string): void {
    try {
        localStorage.setItem(STORAGE_KEY, name.trim().slice(0, 24))
    } catch {
        // Ignore storage failures; the name still works for this session.
    }
}
