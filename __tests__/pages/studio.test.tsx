import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StudioPage from '@/app/dashboard/studio/page'
import { mockUseQuery, mockUseMutation } from '@/src/test/setup'
import { mockRateLimit, mockUserSession } from '@/src/test/factories'

// Mock the video generation action
const mockGenerateVideo = vi.fn()

vi.mock('convex/react', async () => {
  const actual = await vi.importActual('convex/react')
  return {
    ...actual,
    useAction: () => mockGenerateVideo,
  }
})

describe('Studio Page', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mocks
    mockUseQuery.mockImplementation((endpoint) => {
      switch (endpoint) {
        case 'checkRateLimit':
          return mockRateLimit
        case 'getUserSession':
          return mockUserSession
        default:
          return null
      }
    })

    mockGenerateVideo.mockResolvedValue({
      success: true,
      videoId: 'video-123',
      requestId: 'fal-request-123'
    })
  })

  describe('Form Rendering', () => {
    it('should render the video generation form', () => {
      render(<StudioPage />)
      
      expect(screen.getByText('Create Your Viral Short')).toBeInTheDocument()
      expect(screen.getByLabelText(/video prompt/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/aspect ratio/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /generate video/i })).toBeInTheDocument()
    })

    it('should render all aspect ratio options', () => {
      render(<StudioPage />)
      
      const aspectRatioSelect = screen.getByLabelText(/aspect ratio/i)
      expect(aspectRatioSelect).toBeInTheDocument()
      
      // Check if options are available
      expect(screen.getByDisplayValue('16:9')).toBeInTheDocument()
    })

    it('should render negative prompt field', () => {
      render(<StudioPage />)
      
      expect(screen.getByLabelText(/negative prompt/i)).toBeInTheDocument()
      expect(screen.getByText(/specify what you don't want/i)).toBeInTheDocument()
    })

    it('should render pro tips section', () => {
      render(<StudioPage />)
      
      expect(screen.getByText('Pro Tips for Better Results')).toBeInTheDocument()
      expect(screen.getByText(/include specific camera movements/i)).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should require prompt input', async () => {
      render(<StudioPage />)
      
      const generateButton = screen.getByRole('button', { name: /generate video/i })
      await user.click(generateButton)
      
      // Should show validation error or prevent submission
      expect(mockGenerateVideo).not.toHaveBeenCalled()
    })

    it('should validate prompt length', async () => {
      render(<StudioPage />)
      
      const promptInput = screen.getByLabelText(/video prompt/i)
      const shortPrompt = 'hi'
      
      await user.type(promptInput, shortPrompt)
      
      const generateButton = screen.getByRole('button', { name: /generate video/i })
      await user.click(generateButton)
      
      // Should prevent submission for too short prompts
      expect(mockGenerateVideo).not.toHaveBeenCalled()
    })

    it('should accept valid prompt', async () => {
      render(<StudioPage />)
      
      const promptInput = screen.getByLabelText(/video prompt/i)
      const validPrompt = 'A beautiful sunset over the ocean with waves crashing on the shore'
      
      await user.type(promptInput, validPrompt)
      
      const generateButton = screen.getByRole('button', { name: /generate video/i })
      await user.click(generateButton)
      
      await waitFor(() => {
        expect(mockGenerateVideo).toHaveBeenCalledWith(
          expect.objectContaining({
            prompt: validPrompt,
            aspectRatio: '16:9'
          })
        )
      })
    })
  })

  describe('Form Interactions', () => {
    it('should update aspect ratio selection', async () => {
      render(<StudioPage />)
      
      const aspectRatioSelect = screen.getByLabelText(/aspect ratio/i)
      await user.selectOptions(aspectRatioSelect, '9:16')
      
      expect(aspectRatioSelect).toHaveValue('9:16')
    })

    it('should handle negative prompt input', async () => {
      render(<StudioPage />)
      
      const negativePromptInput = screen.getByLabelText(/negative prompt/i)
      const negativePrompt = 'blurry, low quality, distorted'
      
      await user.type(negativePromptInput, negativePrompt)
      
      expect(negativePromptInput).toHaveValue(negativePrompt)
    })

    it('should submit form with all fields', async () => {
      render(<StudioPage />)
      
      const promptInput = screen.getByLabelText(/video prompt/i)
      const negativePromptInput = screen.getByLabelText(/negative prompt/i)
      const aspectRatioSelect = screen.getByLabelText(/aspect ratio/i)
      
      await user.type(promptInput, 'A cat playing in a garden')
      await user.type(negativePromptInput, 'blurry, low quality')
      await user.selectOptions(aspectRatioSelect, '1:1')
      
      const generateButton = screen.getByRole('button', { name: /generate video/i })
      await user.click(generateButton)
      
      await waitFor(() => {
        expect(mockGenerateVideo).toHaveBeenCalledWith(
          expect.objectContaining({
            prompt: 'A cat playing in a garden',
            negativePrompt: 'blurry, low quality',
            aspectRatio: '1:1'
          })
        )
      })
    })
  })

  describe('Rate Limiting', () => {
    it('should show rate limit warning when limit is reached', () => {
      const rateLimitExceeded = {
        ...mockRateLimit,
        videosGenerated: 10,
        maxVideos: 10,
        canGenerate: false
      }
      
      mockUseQuery.mockImplementation((endpoint) => {
        if (endpoint === 'checkRateLimit') return rateLimitExceeded
        if (endpoint === 'getUserSession') return mockUserSession
        return null
      })
      
      render(<StudioPage />)
      
      expect(screen.getByText(/rate limit reached/i)).toBeInTheDocument()
      
      const generateButton = screen.getByRole('button', { name: /generate video/i })
      expect(generateButton).toBeDisabled()
    })

    it('should show remaining videos count', () => {
      const rateLimitPartial = {
        ...mockRateLimit,
        videosGenerated: 3,
        maxVideos: 10,
        canGenerate: true
      }
      
      mockUseQuery.mockImplementation((endpoint) => {
        if (endpoint === 'checkRateLimit') return rateLimitPartial
        if (endpoint === 'getUserSession') return mockUserSession
        return null
      })
      
      render(<StudioPage />)
      
      expect(screen.getByText(/7.*remaining/i)).toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('should show loading state during video generation', async () => {
      // Make the generation take time
      mockGenerateVideo.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve({ success: true, videoId: 'video-123' }), 100)
      ))
      
      render(<StudioPage />)
      
      const promptInput = screen.getByLabelText(/video prompt/i)
      await user.type(promptInput, 'A beautiful landscape')
      
      const generateButton = screen.getByRole('button', { name: /generate video/i })
      await user.click(generateButton)
      
      // Should show loading state
      expect(screen.getByText(/generating/i)).toBeInTheDocument()
      expect(generateButton).toBeDisabled()
      
      // Wait for completion
      await waitFor(() => {
        expect(screen.queryByText(/generating/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle video generation errors', async () => {
      mockGenerateVideo.mockRejectedValue(new Error('Generation failed'))
      
      render(<StudioPage />)
      
      const promptInput = screen.getByLabelText(/video prompt/i)
      await user.type(promptInput, 'A beautiful landscape')
      
      const generateButton = screen.getByRole('button', { name: /generate video/i })
      await user.click(generateButton)
      
      await waitFor(() => {
        expect(screen.getByText(/failed to generate video/i)).toBeInTheDocument()
      })
    })

    it('should handle network errors gracefully', async () => {
      mockGenerateVideo.mockRejectedValue(new Error('Network error'))
      
      render(<StudioPage />)
      
      const promptInput = screen.getByLabelText(/video prompt/i)
      await user.type(promptInput, 'A beautiful landscape')
      
      const generateButton = screen.getByRole('button', { name: /generate video/i })
      await user.click(generateButton)
      
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })
    })
  })

  describe('Success Handling', () => {
    it('should show success message after video generation', async () => {
      render(<StudioPage />)
      
      const promptInput = screen.getByLabelText(/video prompt/i)
      await user.type(promptInput, 'A beautiful landscape')
      
      const generateButton = screen.getByRole('button', { name: /generate video/i })
      await user.click(generateButton)
      
      await waitFor(() => {
        expect(screen.getByText(/video generation started/i)).toBeInTheDocument()
      })
    })

    it('should reset form after successful submission', async () => {
      render(<StudioPage />)
      
      const promptInput = screen.getByLabelText(/video prompt/i)
      await user.type(promptInput, 'A beautiful landscape')
      
      const generateButton = screen.getByRole('button', { name: /generate video/i })
      await user.click(generateButton)
      
      await waitFor(() => {
        expect(promptInput).toHaveValue('')
      })
    })
  })
})

