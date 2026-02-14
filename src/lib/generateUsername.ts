const adjectives = [
    'Neon', 'Chill', 'Vibe', 'Cosmic', 'Retro', 'Hyper', 'Lunar', 'Solar', 'Silent', 'Wild',
    'Epic', 'Mystic', 'Rapid', 'Bold', 'Bright', 'Zen', 'Frosty', 'Digital', 'Glitch', 'Sonic'
]

const nouns = [
    'Falcon', 'Cactus', 'Ninja', 'Orbit', 'Star', 'Wolf', 'Panda', 'Tiger', 'Fox', 'Hawk',
    'Ghost', 'Echo', 'Spark', 'Pulse', 'Vortex', 'Moon', 'Comet', 'Rocket', 'Shadow', 'Storm'
]

export function generateUsername(): string {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]
    const num = Math.floor(Math.random() * 99) + 1
    return `${adj}${noun}${num}`
}
