let registrationStarted = false
let updateReadyHandler: (() => void) | undefined

export function registerServiceWorker(onUpdateReady: () => void): void {
    updateReadyHandler = onUpdateReady
    if (!('serviceWorker' in navigator) || registrationStarted) return

    registrationStarted = true
    let hadController = Boolean(navigator.serviceWorker.controller)
    let reloading = false

    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!hadController) {
            hadController = true
            return
        }
        if (reloading) return
        reloading = true
        window.location.reload()
    })

    void navigator.serviceWorker.register('/service-worker.js', { updateViaCache: 'none' })
        .then((registration) => {
            const watchInstallingWorker = (worker: ServiceWorker | null) => {
                worker?.addEventListener('statechange', () => {
                    if (worker.state === 'installed' && navigator.serviceWorker.controller) {
                        updateReadyHandler?.()
                    }
                })
            }

            registration.addEventListener('updatefound', () => {
                watchInstallingWorker(registration.installing)
            })
            watchInstallingWorker(registration.installing)

            if (registration.waiting && navigator.serviceWorker.controller) {
                updateReadyHandler?.()
            }

            const checkForUpdate = () => {
                if (document.visibilityState === 'visible') {
                    void registration.update().catch(() => undefined)
                }
            }
            document.addEventListener('visibilitychange', checkForUpdate)
            window.setInterval(() => void registration.update().catch(() => undefined), 60 * 60 * 1000)
            checkForUpdate()
        })
        .catch((error: unknown) => {
            registrationStarted = false
            console.error('PWA service worker registration failed:', error)
        })
}

export async function applyServiceWorkerUpdate(): Promise<void> {
    if (!('serviceWorker' in navigator)) return
    try {
        const registration = await navigator.serviceWorker.getRegistration('/')
        registration?.waiting?.postMessage({ type: 'SKIP_WAITING' })
    } catch (error) {
        console.error('Could not apply the PWA update:', error)
    }
}
