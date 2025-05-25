import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StudioPage from '@/app/dashboard/studio/page'
import { mockUseQuery, mockUseAction } from '@/src/test/setup'
import { mockRateLimit, createRateLimitExceeded, createTooManyGenerating } from '@/src/test/factories'

describe('Studio Page - Functionality Tests', () => {
  const user = userEvent.setup()
  const mockGenerateVideo = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default rate limit mock
    mockUseQuery.mockReturnValue(mockRateLimit)
    
    // Setup action mock
    mockUseAction.mockReturnValue(mockGenerateVideo)
    mockGenerateVideo.mockResolvedValue({
      success: true,
      videoId: 'video-123',
      requestId: 'fal-request-123'
    })
  })

  describe('Page Rendering', () => {
    it('should render the studio page without crashing', () => {
      expect(() => render(<StudioPage />)).not.toThrow()
    })

    it('should render the main studio header', () => {
      render(<StudioPage />)
      expect(screen.getByText('Studio')).toBeInTheDocument()
    })

    it('should render creation mode tabs', () => {
      render(<StudioPage />)
      expect(screen.getByText('🤖 AI Generation')).toBeInTheDocument()
      expect(screen.getByText('📋 Templates')).toBeInTheDocument()
      expect(screen.getByText('📤 Upload')).toBeInTheDocument()
    })
  })

  describe('AI Generation Form', () => {
    it('should render video prompt textarea', () => {
      render(<StudioPage />)
      const promptTextarea = screen.getByLabelText(/video prompt/i)
      expect(promptTextarea).toBeInTheDocument()
      expect(promptTextarea).toHaveAttribute('placeholder')
    })

    it('should render aspect ratio selector', () => {
      render(<StudioPage />)
      const aspectRatioSelect = screen.getByLabelText(/aspect ratio/i)
      expect(aspectRatioSelect).toBeInTheDocument()
    })

    it('should render duration selector', () => {
      render(<StudioPage />)
      const durationSelect = screen.getByLabelText(/duration/i)
      expect(durationSelect).toBeInTheDocument()
    })

    it('should render generate video button', () => {
      render(<StudioPage />)
      const generateButton = screen.getByRole('button', { name: /generate video/i })
      expect(generateButton).toBeInTheDocument()
    })
  })

  describe('Form Interactions', () => {
    it('should allow typing in prompt field', async () => {
      render(<StudioPage />)
      
      const promptTextarea = screen.getByLabelText(/video prompt/i)
      const testPrompt = 'A beautiful sunset over the ocean'
      
      await user.type(promptTextarea, testPrompt)
      expect(promptTextarea).toHaveValue(testPrompt)
    })

    it('should show character count for prompt', async () => {
      render(<StudioPage />)
      
      const promptTextarea = screen.getByLabelText(/video prompt/i)
      const testPrompt = 'Test prompt'
      
      await user.type(promptTextarea, testPrompt)
      expect(screen.getByText(`(${testPrompt.length}/1000 characters)`)).toBeInTheDocument()
    })

    it('should allow changing aspect ratio', async () => {
      render(<StudioPage />)
      
      const aspectRatioSelect = screen.getByLabelText(/aspect ratio/i)
      await user.selectOptions(aspectRatioSelect, '9:16')
      expect(aspectRatioSelect).toHaveValue('9:16')
    })

    it('should allow changing duration', async () => {
      render(<StudioPage />)
      
      const durationSelect = screen.getByLabelText(/duration/i)
      await user.selectOptions(durationSelect, '10')
      expect(durationSelect).toHaveValue('10')
    })
  })

  describe('Advanced Settings', () => {
    it('should toggle advanced settings', async () => {
      render(<StudioPage />)
      
      const advancedToggle = screen.getByText(/advanced settings/i)
      await user.click(advancedToggle)
      
      expect(screen.getByLabelText(/negative prompt/i)).toBeInTheDocument()
    })

    it('should allow setting negative prompt', async () => {
      render(<StudioPage />)
      
      // Open advanced settings
      const advancedToggle = screen.getByText(/advanced settings/i)
      await user.click(advancedToggle)
      
      const negativePromptInput = screen.getByLabelText(/negative prompt/i)
      const negativePrompt = 'blurry, low quality, distorted'
      
      await user.type(negativePromptInput, negativePrompt)
      expect(negativePromptInput).toHaveValue(negativePrompt)
    })

    it('should allow adjusting CFG scale', async () => {
      render(<StudioPage />)
      
      // Open advanced settings
      const advancedToggle = screen.getByText(/advanced settings/i)
      await user.click(advancedToggle)
      
      const cfgSlider = screen.getByLabelText(/cfg scale/i)
      expect(cfgSlider).toBeInTheDocument()
    })
  })

  describe('Rate Limiting', () => {
    it('should disable button when daily limit is reached', () => {
      mockUseQuery.mockReturnValue(createRateLimitExceeded())
      
      render(<StudioPage />)
      
      const generateButton = screen.getByRole('button', { name: /daily limit reached/i })
      expect(generateButton).toBeDisabled()
    })

    it('should disable button when too many videos are generating', () => {
      mockUseQuery.mockReturnValue(createTooManyGenerating())
      
      render(<StudioPage />)
      
      const generateButton = screen.getByRole('button', { name: /too many generating/i })
      expect(generateButton).toBeDisabled()
    })

    it('should show remaining videos count', () => {
      render(<StudioPage />)
      
      const remaining = mockRateLimit.maxVideos - mockRateLimit.videosGenerated
      expect(screen.getByText(new RegExp(`${remaining}.*remaining`, 'i'))).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should prevent submission with empty prompt', async () => {
      render(<StudioPage />)
      
      const generateButton = screen.getByRole('button', { name: /generate video/i })
      await user.click(generateButton)
      
      expect(mockGenerateVideo).not.toHaveBeenCalled()
    })

    it('should prevent submission with very short prompt', async () => {
      render(<StudioPage />)
      
      const promptTextarea = screen.getByLabelText(/video prompt/i)
      await user.type(promptTextarea, 'hi')
      
      const generateButton = screen.getByRole('button', { name: /generate video/i })
      await user.click(generateButton)
      
      expect(mockGenerateVideo).not.toHaveBeenCalled()
    })

    it('should allow submission with valid prompt', async () => {
      render(<StudioPage />)
      
      const promptTextarea = screen.getByLabelText(/video prompt/i)
      await user.type(promptTextarea, 'A beautiful landscape with mountains and rivers flowing through green valleys')
      
      const generateButton = screen.getByRole('button', { name: /generate video/i })
      await user.click(generateButton)
      
      await waitFor(() => {
        expect(mockGenerateVideo).toHaveBeenCalledWith(
          expect.objectContaining({
            prompt: 'A beautiful landscape with mountains and rivers flowing through green valleys'
          })
        )
      })
    })
  })

  describe('Loading States', () => {
    it('should show loading state during submission', async () => {
      mockGenerateVideo.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      )
      
      render(<StudioPage />)
      
      const promptTextarea = screen.getByLabelText(/video prompt/i)
      await user.type(promptTextarea, 'A beautiful landscape')
      
      const generateButton = screen.getByRole('button', { name: /generate video/i })
      await user.click(generateButton)
      
      expect(generateButton).toBeDisabled()
      
      await waitFor(() => {
        expect(generateButton).not.toBeDisabled()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle generation errors gracefully', async () => {
      mockGenerateVideo.mockRejectedValue(new Error('Generation failed'))
      
      render(<StudioPage />)
      
      const promptTextarea = screen.getByLabelText(/video prompt/i)
      await user.type(promptTextarea, 'A beautiful landscape')
      
      const generateButton = screen.getByRole('button', { name: /generate video/i })
      await user.click(generateButton)
      
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument()
      })
    })
  })

  describe('Tab Navigation', () => {
    it('should switch to templates tab', async () => {
      render(<StudioPage />)
      
      const templatesTab = screen.getByText('📋 Templates')
      await user.click(templatesTab)
      
      expect(templatesTab).toHaveClass(/border-blue-500/)
    })

    it('should switch to upload tab', async () => {
      render(<StudioPage />)
      
      const uploadTab = screen.getByText('📤 Upload')
      await user.click(uploadTab)
      
      expect(uploadTab).toHaveClass(/border-blue-500/)
    })
  })
})

