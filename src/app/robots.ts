import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://vibe-orbit-production.up.railway.app'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard/', '/admin/', '/api/', '/auth/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
