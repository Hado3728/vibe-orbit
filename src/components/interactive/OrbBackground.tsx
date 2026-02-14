'use client'

import React, { useEffect, useRef } from 'react'

interface Orb {
    x: number
    y: number
    vx: number
    vy: number
    radius: number
    color: string
    alpha: number
    targetAlpha: number
}

const OrbBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let width = window.innerWidth
        let height = window.innerHeight
        let orbs: Orb[] = []
        let animationFrameId: number

        const colors = [
            '250, 200, 220', // Pastel Pink
            '200, 220, 250', // Pastel Blue
            '220, 250, 240', // Pastel Teal
            '240, 230, 250', // Pastel Purple
        ]

        const init = () => {
            width = window.innerWidth
            height = window.innerHeight
            canvas.width = width
            canvas.height = height

            orbs = []
            const orbCount = Math.floor(width * height / 20000) // Density based on screen size

            for (let i = 0; i < orbCount; i++) {
                orbs.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    radius: Math.random() * 100 + 50,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    alpha: Math.random() * 0.3 + 0.1,
                    targetAlpha: Math.random() * 0.3 + 0.1,
                })
            }
        }

        const draw = () => {
            ctx.clearRect(0, 0, width, height)

            orbs.forEach(orb => {
                // Move
                orb.x += orb.vx
                orb.y += orb.vy

                // Bounce
                if (orb.x < -orb.radius) orb.x = width + orb.radius
                if (orb.x > width + orb.radius) orb.x = -orb.radius
                if (orb.y < -orb.radius) orb.y = height + orb.radius
                if (orb.y > height + orb.radius) orb.y = -orb.radius

                // Draw
                ctx.beginPath()
                const gradient = ctx.createRadialGradient(
                    orb.x,
                    orb.y,
                    0,
                    orb.x,
                    orb.y,
                    orb.radius
                )

                gradient.addColorStop(0, `rgba(${orb.color}, ${orb.alpha})`)
                gradient.addColorStop(1, `rgba(${orb.color}, 0)`)

                ctx.fillStyle = gradient
                ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2)
                ctx.fill()

                // Pulse alpha
                if (Math.random() > 0.99) {
                    orb.targetAlpha = Math.random() * 0.3 + 0.1
                }
                orb.alpha += (orb.targetAlpha - orb.alpha) * 0.01
            })

            animationFrameId = requestAnimationFrame(draw)
        }

        init()
        draw()

        const handleResize = () => {
            init()
        }

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none -z-10 bg-background"
            style={{ opacity: 0.8 }}
        />
    )
}

export default OrbBackground
