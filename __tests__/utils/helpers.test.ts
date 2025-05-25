import { describe, it, expect } from 'vitest'

// Utility functions for testing
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
}

export const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

export const getVideoStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'text-green-600'
    case 'generating':
      return 'text-blue-600'
    case 'failed':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

export const isValidPrompt = (prompt: string): boolean => {
  return prompt.trim().length >= 10 && prompt.trim().length <= 1000
}

export const calculateTimeUntilReset = (resetTime: number): string => {
  const now = Date.now()
  const diff = resetTime - now
  
  if (diff <= 0) return 'Now'
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

describe('Utility Functions', () => {
  describe('formatDuration', () => {
    it('should format seconds correctly', () => {
      expect(formatDuration(30)).toBe('30s')
      expect(formatDuration(0)).toBe('0s')
      expect(formatDuration(59)).toBe('59s')
    })

    it('should format minutes correctly', () => {
      expect(formatDuration(60)).toBe('1m')
      expect(formatDuration(120)).toBe('2m')
      expect(formatDuration(300)).toBe('5m')
    })

    it('should format minutes and seconds correctly', () => {
      expect(formatDuration(90)).toBe('1m 30s')
      expect(formatDuration(125)).toBe('2m 5s')
      expect(formatDuration(185)).toBe('3m 5s')
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(500)).toBe('500.0 B')
      expect(formatFileSize(1023)).toBe('1023.0 B')
    })

    it('should format kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB')
      expect(formatFileSize(2048)).toBe('2.0 KB')
      expect(formatFileSize(1536)).toBe('1.5 KB')
    })

    it('should format megabytes correctly', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB')
      expect(formatFileSize(1024 * 1024 * 2.5)).toBe('2.5 MB')
    })

    it('should format gigabytes correctly', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.0 GB')
      expect(formatFileSize(1024 * 1024 * 1024 * 1.5)).toBe('1.5 GB')
    })
  })

  describe('getVideoStatusColor', () => {
    it('should return correct colors for each status', () => {
      expect(getVideoStatusColor('completed')).toBe('text-green-600')
      expect(getVideoStatusColor('generating')).toBe('text-blue-600')
      expect(getVideoStatusColor('failed')).toBe('text-red-600')
      expect(getVideoStatusColor('unknown')).toBe('text-gray-600')
    })
  })

  describe('isValidPrompt', () => {
    it('should validate prompt length correctly', () => {
      expect(isValidPrompt('Short')).toBe(false) // Too short
      expect(isValidPrompt('This is a valid prompt for video generation')).toBe(true)
      expect(isValidPrompt('A'.repeat(1001))).toBe(false) // Too long
      expect(isValidPrompt('A'.repeat(500))).toBe(true) // Just right
    })

    it('should handle whitespace correctly', () => {
      expect(isValidPrompt('   Short   ')).toBe(false) // Trimmed length too short
      expect(isValidPrompt('   This is a valid prompt   ')).toBe(true)
      expect(isValidPrompt('')).toBe(false) // Empty
      expect(isValidPrompt('   ')).toBe(false) // Only whitespace
    })
  })

  describe('calculateTimeUntilReset', () => {
    it('should return "Now" for past times', () => {
      const pastTime = Date.now() - 1000
      expect(calculateTimeUntilReset(pastTime)).toBe('Now')
    })

    it('should format minutes correctly', () => {
      const futureTime = Date.now() + (30 * 60 * 1000) // 30 minutes
      expect(calculateTimeUntilReset(futureTime)).toBe('30m')
    })

    it('should format hours and minutes correctly', () => {
      const futureTime = Date.now() + (2 * 60 * 60 * 1000) + (15 * 60 * 1000) // 2h 15m
      expect(calculateTimeUntilReset(futureTime)).toBe('2h 15m')
    })

    it('should handle exact hour boundaries', () => {
      const futureTime = Date.now() + (1 * 60 * 60 * 1000) // Exactly 1 hour
      expect(calculateTimeUntilReset(futureTime)).toBe('1h 0m')
    })
  })
})

