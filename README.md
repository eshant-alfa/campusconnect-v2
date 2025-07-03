# Campus Connect

Campus Connect is a modern, full-featured platform designed to empower campus communities. Built with Next.js 15, Sanity CMS, and Clerk authentication, it provides a seamless experience for students, staff, and organizations to connect, collaborate, and share resources.

## 🚀 Features

- **Community Forums:** Create and join communities to discuss topics, share updates, and connect with peers.
- **Marketplace:** Buy, sell, or trade items and services within your campus network.
- **Real-Time Chat:** Engage in private or group conversations with instant messaging.
- **Resource Sharing:** Access and contribute to a curated list of campus resources, including maps, support services, and more.
- **User Authentication:** Secure sign-up and login powered by Clerk.
- **Modern UI:** Responsive, accessible, and intuitive interface for all devices.
- **Content Moderation:** Tools for reporting and managing inappropriate content.
- **Customizable Communities:** Manage membership, roles, and permissions for each community.

## 🛠️ Tech Stack

- **Next.js 15** – App router, server components, and fast development with Turbopack
- **Sanity CMS** – Headless content management for flexible data modeling
- **Clerk** – Authentication and user management
- **TypeScript** – Type safety across the stack
- **Tailwind CSS & Radix UI** – Modern, accessible, and customizable UI components

## 📦 Getting Started

1. **Clone the repository:**
   ```sh
   git clone https://github.com/eshant-alfa/campusconnect-v2.git
   cd campusconnect-v2
   ```

2. **Install dependencies:**
   ```sh
   pnpm install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env.local` and fill in the required values.

4. **Run the development server:**
   ```sh
   pnpm dev
   ```

5. **Access the app:**
   - Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Project Structure

- `/app` – Next.js app directory (routes, pages, API)
- `/components` – Reusable React components
- `/sanity` – Sanity schemas and utilities
- `/public` – Static assets
- `/action` – Server actions for business logic
- `/lib` – Utility functions and helpers

## 🧑‍💻 Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or suggestions.

## 📄 License

This project is licensed under the MIT License.
