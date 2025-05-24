# Viral Shorts Generator

A Next.js application for creating viral YouTube shorts using AI video generation powered by Fal.ai's **Kling V2 Master** model - the most advanced text-to-video AI available.

## ✨ Features

- 🎬 **Kling V2 Master Integration**: Cutting-edge text-to-video generation with enhanced quality
- 📱 **Multiple Formats**: Support for landscape (16:9), portrait (9:16), and square (1:1) aspect ratios
- ☁️ **Cloud Storage**: Videos automatically stored in Convex's secure file storage system
- 👤 **User Management**: Secure user authentication with Clerk
- 📊 **Video Management**: Track video generation status and manage your video library
- ⚡ **Real-time Updates**: See video generation progress with live queue updates
- 🎯 **Advanced Controls**: Negative prompts and CFG scale for fine-tuned generation

## 🚀 Kling V2 Master Capabilities

### Enhanced Text Understanding
- **Complex Sequential Actions**: Supports detailed, multi-step scene descriptions
- **Camera Movement Integration**: Executes sophisticated camera movements and cinematography
- **Blockbuster Quality**: Generates cinematic scenes from detailed text descriptions

### Superior Motion Quality
- **Dynamic Character Movement**: Natural, lifelike character animations and expressions
- **Smooth Transitions**: Seamless motion flow between different actions
- **Logical Action Sequences**: Complex actions that follow realistic physics and movement

### Cinematic Visual Quality
- **Realistic Characters**: Lifelike human movements, facial expressions, and interactions
- **Detailed Scene Generation**: Highly detailed environments and objects
- **Artistic Style Preservation**: Maintains consistent visual aesthetics throughout the video

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Convex (database, storage, serverless functions)
- **Authentication**: Clerk
- **AI Video Generation**: Fal.ai Kling V2 Master
- **UI Components**: Custom components with Tailwind CSS
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Convex account
- Clerk account  
- Fal.ai account with API access

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Convex
CONVEX_DEPLOYMENT=your-convex-deployment-name

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key
CLERK_JWT_ISSUER_DOMAIN=your-clerk-issuer-domain

# Fal.ai API
FAL_KEY=your-fal-api-key
```

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd viral-shorts-generator
```

2. Install dependencies:
```bash
bun install
```

3. Set up Convex:
```bash
bunx convex dev
```

4. Set up Clerk authentication by adding your keys to `.env.local`

5. Get your Fal.ai API key from [fal.ai](https://fal.ai) and add it to `.env.local`

6. Start the development server:
```bash
bun run dev
```

The application will be available at `http://localhost:3000`.

## 🎬 Creating Videos with Kling V2 Master

### Basic Generation
1. Navigate to the **Studio** page
2. Fill in the video title and detailed prompt
3. Select aspect ratio and duration
4. Click "Generate Video with Kling V2 Master"

### Advanced Controls
- **Negative Prompt**: Specify what to avoid (e.g., "blur, distort, low quality")
- **CFG Scale**: Control creativity vs. prompt adherence (0.0 = creative, 2.0 = accurate)

### Best Practices for Prompts

#### Camera Movements
```
"A drone shot descending from above..."
"Close-up tracking shot of..."
"Slow-motion sequence showing..."
```

#### Character Actions
```
"A person walks confidently, then turns and smiles at the camera..."
"Character performs a complex dance sequence with fluid movements..."
```

#### Environmental Details
```
"...during golden hour with warm, cinematic lighting..."
"...in a neon-lit Tokyo street with vibrant reflections..."
"...surrounded by floating particles and atmospheric fog..."
```

#### Sequential Descriptions
```
"The scene begins with a wide shot, then transitions to a close-up as the character..."
```

## 📊 Video Management

- **Status Tracking**: Monitor generation progress (generating, completed, failed)
- **Search & Filter**: Find videos by title, description, or status
- **Download**: Get high-quality MP4 files
- **Metadata**: View generation details, file size, and model information

## 🛠 API Integration Details

### Kling V2 Master Parameters
- **prompt**: Detailed scene description (max 1000 characters)
- **duration**: "5" or "10" seconds
- **aspect_ratio**: "16:9", "9:16", or "1:1"
- **negative_prompt**: Elements to avoid
- **cfg_scale**: 0.0-2.0 (creativity vs. accuracy balance)

### Response Handling
- Real-time queue updates with position tracking
- Comprehensive error handling and logging
- Automatic video download and storage
- Metadata extraction and preservation

## 🏗 Architecture

### Backend (Convex)
- `videoActions.ts` - Node.js actions for Fal.ai integration
- `videos.ts` - Database mutations and queries
- `schema.ts` - Type-safe database schema
- Authentication integration with Clerk

### Frontend
- Studio page with advanced generation controls
- Videos management with filtering and search
- Real-time status updates
- Responsive design with dark mode

## 🔧 Deployment

1. Deploy to your preferred platform (Vercel, Netlify, etc.)
2. Set up environment variables in your deployment platform
3. Configure Convex for production:
   ```bash
   bunx convex deploy
   ```
4. Configure Clerk for your production domain
5. Add environment variables to Convex dashboard

## 📈 Performance Considerations

- **Queue Management**: Uses Fal.ai's subscribe method for optimal handling
- **File Storage**: Efficient video storage with Convex's CDN
- **Error Recovery**: Robust error handling with status tracking
- **Logging**: Comprehensive logging for debugging and monitoring

## 🎯 Use Cases

- **YouTube Shorts**: Vertical 9:16 format for social media
- **Marketing Videos**: Professional landscape format
- **Social Media**: Square format for Instagram posts
- **Content Creation**: Automated video generation for creators
- **Prototyping**: Quick video concepts for larger projects

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🔗 Resources

- [Fal.ai Kling V2 Master Documentation](https://fal.ai/models/fal-ai/kling-video)
- [Convex Documentation](https://docs.convex.dev)
- [Clerk Documentation](https://clerk.dev/docs)
- [Next.js Documentation](https://nextjs.org/docs)
