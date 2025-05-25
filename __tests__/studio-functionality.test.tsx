import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StudioPage from '@/app/dashboard/studio/page'
import { mockUseQuery, mockUseMutation } from '@/src/test/setup'

// Mock the video generation action
const mockGenerateVideo = vi.fn()

vi.mock('convex/react', async () => {
  const actual = await vi.importActual('convex/react')
  return {
    ...actual,
    useAction: () => mockGenerateVideo,
  }
})

describe('Studio Page - Functionality Tests', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup rate limit mock
    mockUseQuery.mockReturnValue({
      canCreateVideo: true,
      videosGenerated: 2,
      maxVideos: 10,
      generatingCount: 0,
      maxGenerating: 3,
      timeUntilReset: 0
    })
  })

  describe('Form Elements', () => {
    it('should render the video prompt textarea', () => {
      render(<StudioPage />)
      
      const promptTextarea = screen.getByLabelText(/video prompt/i)
      expect(promptTextarea).toBeInTheDocument()
      expect(promptTextarea).toHaveAttribute('placeholder')
    })

    it('should render the aspect ratio selector', () => {
      render(<StudioPage />)
      
      const aspectRatioSelect = screen.getByLabelText(/aspect ratio/i)
      expect(aspectRatioSelect).toBeInTheDocument()
    })

    it('should render the generate video button', () => {
      render(<StudioPage />)
      
      const generateButton = screen.getByRole('button', { name: /generate video/i })
      expect(generateButton).toBeInTheDocument()
    })
  })

  describe('Form Interactions', () => {
    it('should allow typing in the prompt field', async () => {
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
      
      // Should show character count
      expect(screen.getByText(`(${testPrompt.length}/1000 characters)`)).toBeInTheDocument()
    })

    it('should allow changing aspect ratio', async () => {
      render(<StudioPage />)
      
      const aspectRatioSelect = screen.getByLabelText(/aspect ratio/i)
      
      await user.selectOptions(aspectRatioSelect, '9:16')
      expect(aspectRatioSelect).toHaveValue('9:16')
    })
  })

  describe('Rate Limiting', () => {
    it('should disable button when rate limit is reached', () => {
      mockUseQuery.mockReturnValue({
        canCreateVideo: false,
        videosGenerated: 10,
        maxVideos: 10,
        generatingCount: 0,
        maxGenerating: 3,
        timeUntilReset: 3600000 // 1 hour
      })
      
      render(<StudioPage />)
      
      const generateButton = screen.getByRole('button', { name: /daily limit reached/i })
      expect(generateButton).toBeDisabled()
    })

    it('should disable button when too many videos are generating', () => {
      mockUseQuery.mockReturnValue({
        canCreateVideo: false,
        videosGenerated: 5,
        maxVideos: 10,
        generatingCount: 3,
        maxGenerating: 3,
        timeUntilReset: 0
      })
      
      render(<StudioPage />)
      
      const generateButton = screen.getByRole('button', { name: /too many generating/i })
      expect(generateButton).toBeDisabled()
    })
  })
})
