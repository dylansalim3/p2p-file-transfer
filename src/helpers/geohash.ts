// Minimal geohash encode/decode (base32, standard algorithm).
// Only the coarse hash ever leaves the device — it names the discovery room,
// never precise coordinates. Precision 6 is roughly a 1.2km x 0.6km cell.

const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz'

export function encodeGeohash(lat: number, lon: number, precision = 6): string {
    let latMin = -90
    let latMax = 90
    let lonMin = -180
    let lonMax = 180
    let hash = ''
    let bit = 0
    let value = 0
    let even = true // longitude first

    while (hash.length < precision) {
        if (even) {
            const mid = (lonMin + lonMax) / 2
            if (lon >= mid) {
                value = (value << 1) | 1
                lonMin = mid
            } else {
                value = value << 1
                lonMax = mid
            }
        } else {
            const mid = (latMin + latMax) / 2
            if (lat >= mid) {
                value = (value << 1) | 1
                latMin = mid
            } else {
                value = value << 1
                latMax = mid
            }
        }
        even = !even
        bit++
        if (bit === 5) {
            hash += BASE32[value]
            value = 0
            bit = 0
        }
    }
    return hash
}

export interface GeohashCell {
    lat: number
    lon: number
    latErr: number
    lonErr: number
}

export function decodeGeohash(hash: string): GeohashCell {
    let latMin = -90
    let latMax = 90
    let lonMin = -180
    let lonMax = 180
    let even = true

    for (const ch of hash) {
        const value = BASE32.indexOf(ch)
        if (value < 0) {
            throw new Error(`Invalid geohash character: ${ch}`)
        }
        for (let mask = 16; mask > 0; mask >>= 1) {
            if (even) {
                const mid = (lonMin + lonMax) / 2
                if (value & mask) {
                    lonMin = mid
                } else {
                    lonMax = mid
                }
            } else {
                const mid = (latMin + latMax) / 2
                if (value & mask) {
                    latMin = mid
                } else {
                    latMax = mid
                }
            }
            even = !even
        }
    }
    return {
        lat: (latMin + latMax) / 2,
        lon: (lonMin + lonMax) / 2,
        latErr: (latMax - latMin) / 2,
        lonErr: (lonMax - lonMin) / 2,
    }
}

// The centre cell plus its 8 neighbours, so two phones near a cell boundary
// still share at least one room.
export function nearbyGeohashes(lat: number, lon: number, precision = 6): string[] {
    const cell = decodeGeohash(encodeGeohash(lat, lon, precision))
    const dLat = cell.latErr * 2
    const dLon = cell.lonErr * 2
    const hashes: string[] = []
    for (const dLa of [-1, 0, 1]) {
        for (const dLo of [-1, 0, 1]) {
            const la = Math.max(-90, Math.min(90, cell.lat + dLa * dLat))
            // Longitude wraps at the antimeridian; keep it in range.
            let lo = cell.lon + dLo * dLon
            if (lo > 180) lo -= 360
            if (lo < -180) lo += 360
            hashes.push(encodeGeohash(la, lo, precision))
        }
    }
    return [...new Set(hashes)]
}
