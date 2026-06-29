/**
 * DevConsole Toolkit — Crypto Utilities
 * Advanced cryptographic operations for browser console.
 */

const DCTCrypto = {
    // AES-GCM encryption/decryption
    async encryptAES(data, password) {
        const keyMaterial = await crypto.subtle.importKey(
            'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']
        );
        const key = await crypto.subtle.deriveKey(
            { name: 'PBKDF2', salt: crypto.getRandomValues(new Uint8Array(16)), iterations: 100000, hash: 'SHA-256' },
            keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt']
        );
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(data));
        return { iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''), data: Array.from(new Uint8Array(encrypted)).map(b => b.toString(16).padStart(2, '0')).join('') };
    },

    async decryptAES(encryptedData, password, ivHex) {
        const keyMaterial = await crypto.subtle.importKey(
            'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']
        );
        const key = await crypto.subtle.deriveKey(
            { name: 'PBKDF2', salt: crypto.getRandomValues(new Uint8Array(16)), iterations: 100000, hash: 'SHA-256' },
            keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['decrypt']
        );
        const iv = new Uint8Array(ivHex.match(/.{1,2}/g).map(b => parseInt(b, 16)));
        const data = new Uint8Array(encryptedData.match(/.{1,2}/g).map(b => parseInt(b, 16)));
        const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
        return new TextDecoder().decode(decrypted);
    },

    // HMAC
    async hmac(message, key, algorithm = 'SHA-256') {
        const keyData = await crypto.subtle.importKey('raw', new TextEncoder().encode(key), { name: 'HMAC', hash: algorithm }, false, ['sign']);
        const signature = await crypto.subtle.sign('HMAC', keyData, new TextEncoder().encode(message));
        return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
    },

    // Random bytes
    randomBytes(length) {
        return crypto.getRandomValues(new Uint8Array(length));
    },

    randomHex(length) {
        return Array.from(this.randomBytes(Math.ceil(length / 2))).map(b => b.toString(16).padStart(2, '0')).join('').substring(0, length);
    },

    randomBase64(length) {
        return btoa(String.fromCharCode(...this.randomBytes(length))).substring(0, length);
    },

    // PBKDF2 key derivation
    async deriveKey(password, salt, iterations = 100000) {
        const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
        const bits = await crypto.subtle.deriveBits(
            { name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations, hash: 'SHA-256' },
            keyMaterial, 256
        );
        return Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
    },

    // Timing-safe comparison
    timingSafeEqual(a, b) {
        if (a.length !== b.length) return false;
        let result = 0;
        for (let i = 0; i < a.length; i++) {
            result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }
        return result === 0;
    }
};

if (typeof window !== 'undefined') window.DCTCrypto = DCTCrypto;
