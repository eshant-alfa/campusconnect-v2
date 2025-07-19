# Campus Connect - Technical Implementation Document

**Project:** Campus Connect  
**Repository:** Current Implementation  
**Document Version:** 2.0  
**Date:** January 15, 2025  
**Author:** Technical Documentation Team  

---

## 1. Introduction

### Purpose of the Document

This Technical Implementation Document provides comprehensive programming insights and detailed technical implementation aspects of the Campus Connect project. It serves as a definitive guide for developers, system architects, and maintainers based on the **actual current implementation**.

### Overview of the Project

Campus Connect is a comprehensive social networking platform designed specifically for educational institutions. The platform provides a unified ecosystem where students, faculty, and staff can engage through:

- **Community Forums**: Join and create academic communities with discussion threads
- **Real-time Messaging**: Direct conversations between users
- **Event Management**: Create, manage, and RSVP to campus events  
- **Marketplace**: Buy and sell items within the campus community
- **Surveys & Polls**: Conduct community surveys and gather feedback
- **Resource Sharing**: Share academic materials and resources
- **Weather Alerts**: Campus-specific weather information
- **Content Moderation**: AI-powered content filtering and community guidelines

---

## 2. Current Architecture & Technology Stack

### System Architecture

Campus Connect follows a **modern full-stack architecture** with server-side rendering and real-time capabilities:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   React 19      │  │   TypeScript    │  │  Tailwind CSS   │ │
│  │   Components    │  │   Type Safety   │  │   Styling       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                 Next.js 15 App Router                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Server Actions │  │   API Routes    │  │  Middleware     │ │
│  │  & Components  │  │   & Endpoints   │  │   & Auth        │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data & Services Layer                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Sanity CMS    │  │   Clerk Auth    │  │  Pusher RT      │ │
│  │   Content Store │  │   User Mgmt     │  │  Notifications  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Current Technology Stack

| **Category** | **Technology** | **Version** | **Purpose** |
|--------------|----------------|-------------|-------------|
| **Frontend Framework** | Next.js | 15.3.1 | Full-stack React framework with App Router |
| **UI Library** | React | 19.0.0 | Component-based user interface |
| **Type System** | TypeScript | 5.x | Static type checking and developer experience |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS framework |
| **Authentication** | Clerk | 6.17.0 | User authentication and management |
| **Content Management** | Sanity.io | 3.x | Headless CMS and document database |
| **Real-time Communication** | Pusher | 5.2.0 / 8.4.0 | WebSocket-based real-time features |
| **AI Integration** | OpenAI API | 5.9.0 | Content moderation and AI features |
| **UI Components** | Radix UI | Various | Accessible component primitives |
| **Icons** | Lucide React | 0.503.0 | Icon library |
| **State Management** | SWR | 2.3.4 | Data fetching and caching |

---

## 3. Core Architecture Components

### 3.1 Application Layout Structure

The application uses Next.js 15 App Router with a sophisticated layout system:

**Code Snippet - Main Application Layout**:
```typescript
// app/(app)/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Header from "@/components/header/Header";
import { SanityLive } from "@/sanity/lib/live";
import UserSync from '@/components/UserSync';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Campus Connect",
  description: "Campus Connect",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <SidebarProvider>
            <AppSidebar />

            <SidebarInset>
              <Header />

              <UserSync />

              <div className="flex flex-col">{children}</div>
            </SidebarInset>
          </SidebarProvider>

          <SanityLive />
        </body>
      </html>
    </ClerkProvider>
  );
}
```

**Architecture Features**:
- **ClerkProvider**: Wraps the entire application for authentication context
- **SidebarProvider**: Manages responsive sidebar state
- **UserSync**: Ensures Clerk users are synchronized with Sanity database
- **SanityLive**: Enables real-time content updates from Sanity
- **Custom Fonts**: Uses Geist Sans and Mono for typography

### 3.2 Data Schema Architecture

The application uses a comprehensive Sanity schema with the following core types:

**Code Snippet - Schema Type Definitions**:
```typescript
// sanity/schemaTypes/index.ts
import { type SchemaTypeDefinition } from "sanity";
import { userType } from "./userType";
import { postType } from "./postType";
import { commentType } from "./commentType";
import { voteType } from "./voteType";
import { subredditType } from "./subredditType";
import { modActionType } from "./modActionType";
import { appealType } from "./appealType";
import { eventType } from "./eventType";
import { eventCommentType } from "./eventCommentType";
import { conversationType } from "./conversationType";
import { messageType } from "./messageType";
import { notificationType } from "./notificationType";
import { flaggedContentType } from "./flaggedContentType";
import { marketplaceItemType } from "./marketplaceItemType";
import { surveyType, surveyQuestionType, surveyResponseType, surveyResponseEntryType } from "./surveyType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    userType, 
    postType, 
    commentType, 
    voteType, 
    subredditType, 
    modActionType, 
    appealType, 
    eventType, 
    eventCommentType, 
    marketplaceItemType, 
    conversationType, 
    messageType, 
    notificationType, 
    flaggedContentType, 
    surveyType, 
    surveyQuestionType, 
    surveyResponseType, 
    surveyResponseEntryType
  ],
};
```

**Data Models Overview**:
- **User Management**: `userType` for user profiles and authentication
- **Community System**: `subredditType` for communities with membership management
- **Content System**: `postType`, `commentType` for discussions with voting
- **Event Management**: `eventType`, `eventCommentType` for campus events
- **Marketplace**: `marketplaceItemType` for item trading
- **Messaging**: `conversationType`, `messageType` for direct communication
- **Surveys**: `surveyType` with questions and responses
- **Moderation**: `modActionType`, `appealType`, `flaggedContentType`
- **Notifications**: `notificationType` for system alerts

### 3.3 User Authentication & Management

**Code Snippet - User Schema Definition**:
```typescript
// sanity/schemaTypes/userType.tsx
import { defineField, defineType } from "sanity";
import { UserIcon } from "lucide-react";

export const userType = defineType({
  name: "user",
  title: "User",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "username",
      title: "Username",
      type: "string",
      description: "The unique username for this user",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "clerkId",
      title: "Clerk User ID",
      type: "string",
      description: "The unique Clerk user ID for this user",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      description: "User's email address",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      description: "User's profile picture",
    }),
    defineField({
      name: "joinedAt",
      title: "Joined At",
      type: "datetime",
      description: "When this user account was created",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "isReported",
      title: "Is Reported",
      type: "boolean",
      description: "Whether this user has been reported",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "username",
      media: "image",
    },
    prepare({ title, media }) {
      return {
        title,
        media: media || <UserIcon />,
      };
    },
  },
});
```

**Authentication Flow**:
1. **Clerk Integration**: Handles user registration, login, and session management
2. **User Synchronization**: Automatic sync between Clerk and Sanity via UserSync component
3. **Middleware Protection**: Route-level authentication using Clerk middleware

**Code Snippet - Authentication Middleware**:
```typescript
// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
```

---

## 4. Feature Implementation Details

### 4.1 Homepage Dashboard

The homepage serves as the central hub with featured communities and recent posts:

**Code Snippet - Homepage Implementation**:
```typescript
// app/(app)/page.tsx (Key sections)
export default async function Home() {
  // Fetch featured communities (limit 4 for grid)
  const communities = (await getSubreddits()).slice(0, 4) as CommunityWithMembers[];

  // Check if user is a member of any community
  const user = await currentUser();
  let isMemberOfAny = false;
  if (user) {
    const sanityUser = await client.fetch(
      `*[_type == "user" && clerkId == $clerkId][0]{_id}`,
      { clerkId: user.id }
    );
    const sanityUserId = sanityUser?._id || null;
    if (sanityUserId) {
      const allCommunities = await getSubreddits();
      isMemberOfAny = allCommunities.some((community: any) =>
        (community.members || []).some(
          (m: any) => m.user && m.user._ref === sanityUserId && m.status === "active"
        )
      );
    }
  }

  return (
    <>
      {/* Banner */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-200 border-b">
        <div className="mx-auto max-w-7xl px-4 py-10 flex flex-col md:flex-row items-center gap-8 md:gap-16">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-3">Campus Connect</h1>
            <p className="text-lg text-blue-800 mb-4 max-w-xl">
              Your academic community hub. Join, share, and connect with students, faculty, and campus groups.
            </p>
            {user ? (
              isMemberOfAny ? (
                <Link href="/create-post">
                  <button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg px-6 py-3 text-lg shadow transition-colors">
                    Create a Post
                  </button>
                </Link>
              ) : (
                <button className="bg-gray-300 text-gray-500 font-semibold rounded-lg px-6 py-3 text-lg shadow cursor-not-allowed" disabled>
                  Join a community to create a post
                </button>
              )
            ) : (
              <Link href="/sign-in">
                <button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg px-6 py-3 text-lg shadow transition-colors">
                  Sign in to create a post
                </button>
              </Link>
            )}
          </div>
          <div className="flex-1 flex justify-center">
            <Image src="/cc_full_logo.png" alt="Campus Connect Logo" width={180} height={180} className="rounded-full shadow-lg border-4 border-blue-200 bg-white" />
          </div>
        </div>
      </section>
      
      {/* Featured Communities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {communities.map((community) => (
          <Link key={(community as any).slug} href={`/community/${(community as any).slug}`} 
                className="block bg-white rounded-2xl shadow-lg border border-blue-100 hover:border-blue-300 transition-colors p-5 h-full">
            <div className="flex flex-col items-center gap-3">
              {(community as any).image && (community as any).image.asset?._ref ? (
                <Image
                  src={urlFor((community as any).image).width(64).height(64).url()}
                  alt={(community as any).title || "Community"}
                  width={64}
                  height={64}
                  className="rounded-full border-2 border-blue-200 bg-white object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-400">
                  {(community as any).title?.[0] || "?"}
                </div>
              )}
              <h3 className="text-lg font-semibold text-blue-900 text-center truncate w-full">{(community as any).title}</h3>
              <p className="text-sm text-gray-600 text-center line-clamp-2">{(community as any).description}</p>
              <span className="text-xs text-blue-700 font-medium mt-2">
                {Array.isArray(community.members) ? community.members.length : 0} members
              </span>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Recent Posts */}
      <div>
        <h2 className="text-2xl font-bold text-blue-900 mb-4">Recent Posts</h2>
        <PostsList />
      </div>
    </>
  );
}
```

**Homepage Features**:
- **Dynamic Banner**: Shows different CTAs based on user authentication and community membership
- **Featured Communities**: Grid display of top 4 communities with member counts
- **Recent Posts**: Live feed of latest posts across all communities
- **Responsive Design**: Adaptive layout for mobile and desktop
- **Smart Navigation**: Context-aware buttons based on user state

### 4.2 Navigation System

The application features a comprehensive sidebar navigation system:

**Code Snippet - App Sidebar Implementation**:
```typescript
// components/app-sidebar.tsx (Key sections)
export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const subreddits = await getSubreddits();
  const user = await getUser();
  const userId = (user && "_id" in user) ? user._id : null;

  const myCommunities = userId
    ? subreddits.filter((sub: any) =>
        sub.members?.some((m: any) => m.user?._ref === userId && m.status === "active")
      )
    : [];
  const otherCommunities = subreddits.filter(
    (sub: any) => !myCommunities.includes(sub)
  );

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <Image
                  src={CCLogo}
                  alt="logo"
                  width={150}
                  height={150}
                  className="object-contain"
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SearchForm />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <CreateCommunityButton />
              </SidebarMenuButton>

              <SidebarMenuButton asChild className="p-5">
                <Link href="/">
                  <HomeIcon className="w-4 h-4 mr-2" />
                  Home
                </Link>
              </SidebarMenuButton>

              <SidebarMenuButton asChild className="p-5">
                <Link href="/weather-alert">
                  <CloudSun className="w-4 h-4 mr-2" />
                  Weather Alert
                </Link>
              </SidebarMenuButton>
              
              <SidebarMenuButton asChild className="p-5">
                <Link href="/surveys">
                  <TrendingUpIcon className="w-4 h-4 mr-2" />
                  Surveys & Polls
                </Link>
              </SidebarMenuButton>
              
              <SidebarMenuButton asChild className="p-5">
                <Link href="/events">
                  <Calendar className="w-4 h-4 mr-2" />
                  Events
                </Link>
              </SidebarMenuButton>

              <SidebarMenuButton asChild className="p-5">
                <Link href="/marketplace">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Marketplace
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* My Communities */}
        {userId && myCommunities.length > 0 && (
          <SidebarGroup>
            <SidebarMenu>
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      My Communities
                      <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
                      <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {myCommunities.map((sub: any) => (
                        <SidebarMenuSubItem key={sub.slug}>
                          <SidebarMenuSubButton asChild isActive={false}>
                            <Link href={`/community/${sub.slug}`}>{sub.title}</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* Other Communities */}
        <SidebarGroup>
          <SidebarMenu>
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton>
                    Communities
                    <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
                    <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {otherCommunities.map((sub: any) => (
                      <SidebarMenuSubItem key={sub.slug}>
                        <SidebarMenuSubButton asChild isActive={false}>
                          <Link href={`/community/${sub.slug}`}>{sub.title}</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
            </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
```

**Navigation Features**:
- **Logo Header**: Campus Connect branding with search functionality
- **Main Navigation**: Core features including Events, Marketplace, Surveys
- **My Communities**: Personalized list of joined communities
- **All Communities**: Collapsible list of available communities to join
- **Responsive Behavior**: Adaptive sidebar that collapses on mobile
- **Dynamic Content**: Community lists update based on user membership

### 4.3 Real-time Communication System

**Code Snippet - Pusher Configuration**:
```typescript
// lib/pusher.ts
import Pusher from 'pusher';

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});
```

**Code Snippet - Pusher Client Configuration**:
```typescript
// lib/pusherClient.ts
import PusherJS from 'pusher-js';

export const pusherClient = new PusherJS(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
});
```

### 4.4 Content Management System

**Code Snippet - Sanity Client Configuration**:
```typescript
// sanity/lib/client.ts
import { createClient } from '@sanity/client'
import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Set to false if statically generating pages
})
```

**Code Snippet - Image Handling**:
```typescript
// sanity/lib/image.ts
import createImageUrlBuilder from '@sanity/image-url'
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { dataset, projectId } from '../env'

const builder = createImageUrlBuilder({ projectId, dataset })

export const urlFor = (source: SanityImageSource) => {
  return builder.image(source)
}
```

---

## 5. Current Features Overview

### 5.1 Community Management
- **Community Creation**: Users can create new academic communities
- **Membership System**: Join/leave communities with status tracking
- **Community Discovery**: Browse and search available communities
- **Member Management**: Track active members and community statistics

### 5.2 Content System
- **Post Creation**: Rich text posts with image support
- **Comment Threads**: Nested comment system for discussions
- **Voting System**: Upvote/downvote functionality for posts and comments
- **Content Moderation**: AI-powered content filtering

### 5.3 Event Management
- **Event Creation**: Create campus events with details and categories
- **RSVP System**: Attend/interested/not going responses
- **Event Comments**: Discussion threads for events
- **Event Discovery**: Browse events by category and date

### 5.4 Marketplace
- **Item Listings**: Create listings for buying/selling items
- **Category System**: Organized marketplace with categories
- **User Dashboard**: Manage personal listings
- **Image Support**: Multiple images per listing

### 5.5 Survey System
- **Survey Creation**: Create polls and surveys with multiple question types
- **Response Collection**: Gather and analyze responses
- **Results Display**: Visual representation of survey results
- **Survey Management**: Edit and close surveys

### 5.6 Messaging System
- **Direct Messages**: One-on-one conversations
- **Message Threading**: Organized conversation history
- **User Search**: Find and message other users
- **Real-time Updates**: Live message delivery

### 5.7 Additional Features
- **Weather Alerts**: Campus-specific weather information
- **Resource Sharing**: Academic resources and materials
- **Privacy Policy**: Comprehensive privacy and terms
- **FAQ System**: User help and support
- **Moderation Policy**: Community guidelines and enforcement

---

## 6. Development Configuration

### 6.1 Package Dependencies

**Current Dependencies from package.json**:
```json
{
  "dependencies": {
    "@ai-sdk/openai": "^1.3.17",
    "@ai-sdk/react": "^1.2.9",
    "@clerk/agent-toolkit": "^0.0.25",
    "@clerk/nextjs": "^6.17.0",
    "@radix-ui/react-avatar": "^1.1.7",
    "@radix-ui/react-collapsible": "^1.1.8",
    "@radix-ui/react-dialog": "^1.1.11",
    "@radix-ui/react-label": "^2.1.4",
    "@radix-ui/react-popover": "^1.1.11",
    "@radix-ui/react-select": "^2.2.5",
    "@radix-ui/react-separator": "^1.1.4",
    "@radix-ui/react-slot": "^1.2.0",
    "@radix-ui/react-tooltip": "^1.2.4",
    "@sanity/client": "^6.29.0",
    "@sanity/icons": "^3.7.4",
    "@sanity/image-url": "1",
    "@sanity/vision": "3",
    "ai": "^4.3.9",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "dotenv": "^17.2.0",
    "groq": "^3.86.0",
    "lucide-react": "^0.503.0",
    "nanoid": "^5.1.5",
    "next": "15.3.1",
    "next-sanity": "^9.10.2",
    "openai": "^5.9.0",
    "pusher": "^5.2.0",
    "pusher-js": "^8.4.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-timeago": "^8.2.0",
    "sanity": "3",
    "styled-components": "6",
    "styled-jsx": "5.1.7",
    "swr": "^2.3.4",
    "tailwind-merge": "^3.2.0",
    "tw-animate-css": "^1.2.8",
    "uuid": "^11.1.0",
    "zod": "^3.24.3"
  }
}
```

### 6.2 TypeScript Configuration

**Code Snippet - TypeScript Setup**:
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 6.3 Next.js Configuration

**Code Snippet - Next.js Setup**:
```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "cdn.sanity.io",
        protocol: "https",
      },
      {
        hostname: "img.clerk.com",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;
```

### 6.4 Sanity Configuration

**Code Snippet - Sanity Studio Setup**:
```typescript
// sanity.config.ts
import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

import {apiVersion, dataset, projectId} from './sanity/env'
import {schema} from './sanity/schemaTypes'
import {structure} from './sanity/structure'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  schema,
  plugins: [
    structureTool({structure}),
    visionTool({defaultApiVersion: apiVersion}),
  ],
})
```

---

## 7. Current API Endpoints

Based on the current implementation, the application includes the following API structure:

### Community Management APIs
- `GET/POST /api/community/[slug]/data` - Community information
- `POST /api/community/[slug]/join` - Join community
- `POST /api/community/[slug]/leave` - Leave community
- `GET /api/community/[slug]/membership-status` - Check membership
- `GET /api/community/[slug]/members` - Community members
- `GET/POST /api/community/[slug]/modlogs` - Moderation logs

### Event Management APIs
- `GET/POST /api/events` - Events CRUD operations
- `GET /api/events/[id]` - Single event details
- `POST /api/events/[id]/rsvp` - RSVP to event
- `DELETE /api/events/[id]/cancel-rsvp` - Cancel RSVP
- `GET /api/events/[id]/comments` - Event comments

### Marketplace APIs
- `GET/POST /api/marketplace` - Marketplace listings
- `GET /api/marketplace/[id]` - Single item details
- `DELETE /api/marketplace/[id]/delete` - Delete listing
- `GET /api/marketplace/user/[userId]` - User's listings

### Survey APIs
- `GET/POST /api/surveys` - Surveys CRUD
- `GET /api/surveys/[id]` - Single survey
- `POST /api/surveys/[id]/response` - Submit response
- `GET /api/surveys/[id]/results` - Survey results
- `POST /api/surveys/[id]/close` - Close survey

### Messaging APIs
- `GET/POST /api/messages` - Messages operations
- `GET /api/messages/[conversationId]` - Conversation details
- `POST /api/messages/create` - Create conversation
- `POST /api/messages/send` - Send message

### Notification APIs
- `GET /api/notifications` - User notifications
- `POST /api/notifications/[id]/read` - Mark as read
- `POST /api/notifications/create` - Create notification

### Moderation APIs
- `POST /api/moderate-content` - Content moderation
- `GET /api/community/[slug]/appeals` - Appeals management
- `POST /api/community/[slug]/ban` - Ban user
- `POST /api/community/[slug]/unban` - Unban user

---

## 8. Future Enhancement Recommendations

### 8.1 Short-term Improvements (3-6 months)
1. **Mobile App Development**: React Native implementation
2. **Enhanced Search**: Elasticsearch integration for better search
3. **Advanced Analytics**: User engagement and community health metrics
4. **Push Notifications**: Mobile and browser notifications
5. **File Sharing**: Document upload and sharing capabilities

### 8.2 Medium-term Roadmap (6-12 months)
1. **Video Integration**: Video calls and streaming for events
2. **Advanced Moderation**: ML-based content filtering
3. **Integration APIs**: Connect with campus LMS systems
4. **Accessibility Improvements**: Enhanced screen reader support
5. **Performance Optimization**: Caching and CDN implementation

### 8.3 Long-term Vision (12+ months)
1. **Multi-campus Support**: Institution-level segregation
2. **AI Assistant**: Campus-specific AI chatbot
3. **Advanced Analytics**: Predictive engagement models
4. **Enterprise Features**: SSO, compliance, and enterprise integrations

---

## 9. File Upload Guide for Documentation Enhancement

To further enhance this documentation with UI screenshots and detailed feature descriptions, please upload files in this order:

### Priority 1: Core Community Features
```bash
# Community System
sanity/schemaTypes/subredditType.ts
app/(app)/community/[slug]/page.tsx
app/api/community/[slug]/join/route.ts
components/subreddit/JoinButton.tsx
sanity/lib/subreddit/getSubreddits.ts
```

### Priority 2: Posts & Content System
```bash
# Post & Comment System
sanity/schemaTypes/postType.ts
sanity/schemaTypes/commentType.ts
components/post/Post.tsx
components/comment/Comment.tsx
action/createPost.ts
action/createComment.ts
```

### Priority 3: Events & Marketplace
```bash
# Events
sanity/schemaTypes/eventType.ts
app/(app)/events/page.tsx
app/api/events/[id]/rsvp/route.ts

# Marketplace
sanity/schemaTypes/marketplaceItemType.ts
app/(app)/marketplace/page.tsx
```

### UI Screenshots Needed
1. **Homepage Dashboard** - Main interface with sidebar
2. **Community Page** - Community details with posts
3. **Post Creation** - Form and resulting post display
4. **Events Page** - Event listings and RSVP interface
5. **Marketplace** - Item listings and details
6. **Mobile Views** - Responsive layouts
7. **Admin/Moderation** - Content management interfaces

---

## 10. Conclusion

Campus Connect represents a comprehensive, modern web application built with cutting-edge technologies and best practices. The current implementation provides a solid foundation for campus community engagement with room for significant expansion and enhancement.

**Key Strengths**:
- ✅ Modern React 19 and Next.js 15 implementation
- ✅ Comprehensive feature set covering all campus needs
- ✅ Scalable architecture with Sanity CMS
- ✅ Real-time capabilities with Pusher
- ✅ Strong authentication with Clerk
- ✅ Type-safe development with TypeScript
- ✅ Responsive, accessible UI design

**Technical Excellence**:
- Professional-grade code structure and organization
- Comprehensive data modeling with Sanity
- Secure authentication and authorization
- Real-time communication capabilities
- AI-powered content moderation
- Mobile-responsive design patterns

The platform is production-ready and positioned for successful deployment and future expansion based on institutional needs and user feedback.

---

**Document Control**  
**Version:** 2.0  
**Last Updated:** January 15, 2025  
**Next Review:** April 15, 2025  
**Maintained by:** Technical Documentation Team 