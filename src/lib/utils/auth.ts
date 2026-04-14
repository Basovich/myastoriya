/**
 * Generates or retrieves a unique device ID from localStorage.
 * Used for tracking guest sessions and as a 'fingerprint' for registration/auth.
 */
export function getOrCreateDeviceId(): string {
    if (typeof window === 'undefined') return '';
    
    const KEY = 'mya_device_id';
    let id = localStorage.getItem(KEY);
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(KEY, id);
    }
    return id;
}
