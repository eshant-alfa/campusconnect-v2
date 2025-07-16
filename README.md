# Campus Connect

A comprehensive campus community platform built for university students to connect, collaborate, and thrive in a safe, vibrant academic environment.

## 🌟 Features

### Community & Social
- **Academic Communities**: Join or create groups for classes, clubs, and interests
- **Post & Comment System**: Share thoughts, resources, and engage in discussions
- **Voting System**: Upvote and downvote posts and comments
- **Real-time Updates**: Live notifications and content updates

### Campus Life
- **Events Management**: Create, discover, and RSVP to campus events
- **Student Marketplace**: Buy, sell, and exchange goods within your campus network
- **Surveys & Polls**: Participate in community surveys and make your voice heard
- **Weather Alerts**: Real-time weather updates for your campus location

### Communication
- **Direct Messaging**: Private conversations with other students
- **Real-time Chat**: Instant messaging with typing indicators
- **Notifications**: Stay updated with community activities

### Safety & Moderation
- **AI-Powered Content Moderation**: Advanced filtering for inappropriate content
- **Community Guidelines**: Enforced community standards
- **Reporting System**: Report violations and inappropriate content
- **User Verification**: Secure authentication with university email

### Resources
- **Academic Resources**: Access to study materials and campus services
- **Support Networks**: Mental health, legal, and career resources
- **Campus Information**: Maps, transport, and essential services

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Sanity CMS (Headless CMS)
- **Authentication**: Clerk
- **Real-time**: Pusher
- **AI Moderation**: OpenAI API
- **Deployment**: Vercel (Ready)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm, npm, or yarn
- Clerk Account
- Sanity Account
- OpenAI API key (for content moderation)

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your-sanity-read-token
SANITY_API_WRITE_TOKEN=your-sanity-write-token

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key

# OpenAI (for content moderation)
OPENAI_API_KEY=your-openai-api-key

# Pusher (for real-time features)
PUSHER_APP_ID=your-pusher-app-id
PUSHER_KEY=your-pusher-key
PUSHER_SECRET=your-pusher-secret
PUSHER_CLUSTER=your-pusher-cluster
NEXT_PUBLIC_PUSHER_KEY=your-pusher-key
NEXT_PUBLIC_PUSHER_CLUSTER=your-pusher-cluster

# Weather API
WEATHER_API_KEY=your-weather-api-key

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd campus-connect

# Install dependencies
pnpm install

# Start the development server
pnpm run dev
```

### Setting up Sanity CMS

1. Create a Sanity account at [sanity.io](https://sanity.io)
2. Create a new project
3. Install Sanity CLI globally:
   ```bash
   npm install -g @sanity/cli
   ```
4. Initialize Sanity in your project:
   ```bash
   sanity init
   ```
5. Deploy Sanity Studio:
   ```bash
   sanity deploy
   ```

### Setting up Clerk Authentication

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Configure authentication providers
3. Set up redirect URLs for your domain
4. Add environment variables to your `.env.local`

## 📁 Project Structure

```
campus-connect/
├── app/                    # Next.js 15 app router
│   ├── (admin)/           # Admin routes
│   ├── (app)/             # Main app routes
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── post/             # Post-related components
│   ├── community/        # Community components
│   ├── events/           # Event components
│   ├── marketplace/      # Marketplace components
│   ├── surveys/          # Survey components
│   └── messages/         # Messaging components
├── lib/                  # Utility functions
├── sanity/               # Sanity CMS configuration
│   ├── schemaTypes/      # Content schemas
│   └── lib/              # Sanity utilities
├── types/                # TypeScript type definitions
├── hooks/                # Custom React hooks
├── action/               # Server actions
└── public/               # Static assets
```

## 🔧 Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm typegen` - Generate Sanity types

## 🛡️ Content Moderation

The platform includes a sophisticated AI-powered content moderation system:

- **Multi-layered filtering**: Keyword, sentiment, and AI analysis
- **Real-time protection**: All user-generated content is screened
- **Community standards**: Enforces academic community guidelines
- **Transparent feedback**: Clear explanations for blocked content

## 🎨 UI/UX Features

- **Responsive Design**: Optimized for all devices
- **Accessibility**: WCAG compliant components
- **Modern Interface**: Clean, intuitive design
- **Dark Mode Ready**: Built with theming support
- **Loading States**: Smooth user experience

## 🔒 Security Features

- **Authentication**: Secure user authentication with Clerk
- **Authorization**: Role-based access control
- **Content Validation**: Server-side validation for all inputs
- **Rate Limiting**: Protection against abuse
- **Data Privacy**: GDPR compliant data handling

## 📱 Mobile Support

- **Progressive Web App**: Installable on mobile devices
- **Touch Optimized**: Designed for touch interactions
- **Offline Capable**: Basic functionality without internet
- **Push Notifications**: Real-time updates (coming soon)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Join community discussions on GitHub
- **Email**: Contact us at info@campusconnect.com

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Powered by [Sanity CMS](https://sanity.io/)
- Secured by [Clerk](https://clerk.com/)
- Enhanced with [OpenAI](https://openai.com/)

---

Built with ❤️ for the academic community

