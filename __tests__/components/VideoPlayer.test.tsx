import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import VideoPlayer from '@/components/VideoPlayer'

describe('VideoPlayer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render video player with valid video URL', () => {
    render(
      <VideoPlayer 
        src="https://example.com/video.mp4"
        title="Test Video"
        onError={vi.fn()} 
      />
    )
    
    // Find the video element using data-testid or by tag name
    const video = document.querySelector('video')
    expect(video).toBeInTheDocument()
    expect(video).toHaveAttribute('src', 'https://example.com/video.mp4')
    expect(video).toHaveAttribute('title', 'Test Video')
  })

  it('should show loading state initially', () => {
    render(
      <VideoPlayer 
        src="https://example.com/video.mp4"
        title="Test Video"
      />
    )
    
    expect(screen.getByText(/loading video/i)).toBeInTheDocument()
  })

  it('should show error state when video fails to load', async () => {
    const onError = vi.fn()
    
    render(
      <VideoPlayer 
        src="https://example.com/video.mp4"
        title="Test Video"
        onError={onError} 
      />
    )
    
    const video = document.querySelector('video')
    
    // Simulate video error
    if (video) {
      fireEvent.error(video)
    }
    
    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
    })
    
    expect(onError).toHaveBeenCalledWith('Failed to load video')
  })

  it('should show retry button when video has error and showRetry is true', async () => {
    render(
      <VideoPlayer 
        src="https://example.com/video.mp4"
        title="Test Video"
        showRetry={true}
      />
    )
    
    const video = document.querySelector('video')
    
    // Simulate video error
    if (video) {
      fireEvent.error(video)
    }
    
    await waitFor(() => {
      const retryButton = screen.getByRole('button', { name: /retry/i })
      expect(retryButton).toBeInTheDocument()
    })
  })

  it('should handle retry functionality', async () => {
    render(
      <VideoPlayer 
        src="https://example.com/video.mp4"
        title="Test Video"
        showRetry={true}
      />
    )
    
    const video = document.querySelector('video')
    
    // Simulate video error
    if (video) {
      fireEvent.error(video)
    }
    
    await waitFor(() => {
      const retryButton = screen.getByRole('button', { name: /retry/i })
      fireEvent.click(retryButton)
      
      // Should attempt to reload the video
      expect(video).toHaveAttribute('src')
    })
  })

  it('should apply custom styling and dimensions', () => {
    render(
      <VideoPlayer 
        src="https://example.com/video.mp4"
        title="Test Video"
        width={800}
        height={600}
        className="custom-class"
      />
    )
    
    const video = document.querySelector('video')
    const container = video?.parentElement
    expect(container).toHaveStyle({ width: '800px', height: '600px' })
    expect(container).toHaveClass('custom-class')
  })
})
