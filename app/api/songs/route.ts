import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const assetsDir = path.join(process.cwd(), 'public', 'assets')

    // Check if directory exists
    if (!fs.existsSync(assetsDir)) {
      return NextResponse.json({ songs: [] })
    }

    // Read all files in the assets directory
    const files = fs.readdirSync(assetsDir)

    // Filter only MP3 files and format the response
    const songs = files
      .filter(file => file.endsWith('.mp3'))
      .map(file => {
        // Extract readable name from filename
        const nameWithoutExt = file.replace('.mp3', '')
        const readableName = nameWithoutExt
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')

        return {
          filename: file,
          name: readableName,
          path: `/assets/${file}`
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json({ songs })
  } catch (error) {
    console.error('Error reading songs:', error)
    return NextResponse.json({ songs: [], error: 'Failed to load songs' }, { status: 500 })
  }
}
