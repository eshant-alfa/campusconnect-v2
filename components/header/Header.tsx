"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "../ui/button";
import CCLogo from "@/images/cc_full_logo.png";
import { ChevronLeftIcon, MenuIcon, Bell, MessageCircle, Users, CheckCircle, XCircle, Plus, UserPlus, Mail, Calendar, Clock, Edit, BarChart3, Heart, MessageSquare, Megaphone, PartyPopper, Lock } from "lucide-react";
import Image from "next/image";
import { useSidebar } from "../ui/sidebar";
import CreatePost from "../post/CreatePost";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState, useRef } from "react";
import { pusherClient } from "@/lib/pusherClient";
import Link from "next/link";
import GlobalCreatePostButton from "@/components/post/GlobalCreatePostButton";

// Notification type configurations
const NOTIFICATION_CONFIGS = {
  // Community notifications
  community_joined: {
    icon: UserPlus,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    title: "New Member",
    action: "view_community",
  },
  community_approved: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    title: "Request Approved",
    action: "view_community",
  },
  community_denied: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    title: "Request Denied",
    action: "none",
  },
  community_rejected: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    title: "Request Rejected",
    action: "none",
  },
  community_created: {
    icon: Plus,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    title: "Community Created",
    action: "view_community",
  },
  
  // Message notifications
  message: {
    icon: Mail,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    title: "New Message",
    action: "view_messages",
  },
  
  // Event notifications
  event_created: {
    icon: Calendar,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    title: "New Event",
    action: "view_event",
  },
  event_reminder: {
    icon: Clock,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    title: "Event Reminder",
    action: "view_event",
  },
  event_updated: {
    icon: Edit,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    title: "Event Updated",
    action: "view_event",
  },
  event_cancelled: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    title: "Event Cancelled",
    action: "none",
  },
  
  // Survey notifications
  survey_created: {
    icon: BarChart3,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    title: "New Survey",
    action: "view_survey",
  },
  survey_reminder: {
    icon: Clock,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    title: "Survey Reminder",
    action: "view_survey",
  },
  survey_closed: {
    icon: Lock,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    title: "Survey Closed",
    action: "view_survey",
  },
  
  // Post notifications
  post_liked: {
    icon: Heart,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    title: "Post Liked",
    action: "view_post",
  },
  post_commented: {
    icon: MessageSquare,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    title: "New Comment",
    action: "view_post",
  },
  
  // System notifications
  system_announcement: {
    icon: Megaphone,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    title: "Announcement",
    action: "none",
  },
  welcome: {
    icon: PartyPopper,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    title: "Welcome",
    action: "none",
  },
  
  default: {
    icon: Bell,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    title: "Notification",
    action: "none",
  },
};

function formatTimeAgo(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

function NotificationDropdown() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!user) return;
    
    // Fetch notifications
    setLoading(true);
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data.notifications || []);
        setUnreadCount((data.notifications || []).filter((n: any) => !n.isRead).length);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    // Subscribe to Pusher for real-time notifications
    if (pusherClient && user.id) {
      channelRef.current = pusherClient.subscribe(`user-${user.id}`);
      channelRef.current.bind("new-notification", (data: any) => {
        setNotifications((prev) => [data.notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });
    }

    return () => {
      if (pusherClient && user?.id && channelRef.current) {
        channelRef.current.unbind_all();
        pusherClient.unsubscribe(`user-${user.id}`);
      }
    };
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      await Promise.all(
        unreadNotifications.map(n => 
          fetch(`/api/notifications/${n._id}/read`, { method: "POST" })
        )
      );
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const getNotificationConfig = (type: string) => {
    return NOTIFICATION_CONFIGS[type as keyof typeof NOTIFICATION_CONFIGS] || NOTIFICATION_CONFIGS.default;
  };

  const handleNotificationClick = (notification: any) => {
    // Mark as read
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }

    const config = getNotificationConfig(notification.type);
    
    // Navigate based on notification action
    switch (config.action) {
      case 'view_messages':
        if (notification.relatedId) {
          window.location.href = `/messages?conversation=${notification.relatedId}`;
        } else {
          window.location.href = '/messages';
        }
        break;
      case 'view_community':
        if (notification.relatedId) {
          // You might need to fetch the community slug from the relatedId
          // For now, navigate to communities page
          window.location.href = '/communities';
        }
        break;
      case 'view_event':
        if (notification.relatedId) {
          window.location.href = `/events/${notification.relatedId}`;
        } else {
          window.location.href = '/events';
        }
        break;
      case 'view_survey':
        if (notification.relatedId) {
          window.location.href = `/surveys/${notification.relatedId}`;
        } else {
          window.location.href = '/surveys';
        }
        break;
      case 'view_post':
        if (notification.relatedId) {
          // Navigate to the specific post
          window.location.href = `/post/${notification.relatedId}`;
        }
        break;
      case 'none':
      default:
        // Just close the dropdown for notifications that don't need navigation
        setOpen(false);
        break;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-6 h-6 text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 font-bold min-w-[18px] flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0 max-h-[500px]">
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-blue-900 text-lg">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No notifications</p>
              <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => {
                const config = getNotificationConfig(notification.type);
                const IconComponent = config.icon;
                
                return (
                  <button
                    key={notification._id}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? "bg-blue-50/50" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bgColor} ${config.borderColor} border flex items-center justify-center`}>
                        <IconComponent className={`w-5 h-5 ${config.color}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {config.title}
                          </p>
                          {!notification.isRead && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                          {notification.content}
                        </p>
                        
                        <p className="text-xs text-gray-400">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function MessageButton() {
  // Placeholder for unread badge logic (can be wired to real data later)
  const unread = 0; // Replace with real unread count if available
  return (
    <Link href="/messages" aria-label="Messages">
      <button className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none transition-colors">
        <MessageCircle className="w-6 h-6 text-gray-700" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5 font-bold min-w-[18px] flex items-center justify-center">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>
    </Link>
  );
}

function Header() {
  const { toggleSidebar, open, isMobile } = useSidebar();

  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-200">
      {/* Left Side */}
      <div className="h-10 flex items-center">
        {open && !isMobile ? (
          <ChevronLeftIcon className="w-6 h-6" onClick={toggleSidebar} />
        ) : (
          <div className="flex items-center gap-2">
            <MenuIcon className="w-6 h-6" onClick={toggleSidebar} />
            <Image
              src={CCLogo}
              alt="logo"
              width={180}
              height={180}
              className="hidden md:block"
            />
            <Image
              src={CCLogo}
              alt="logo"
              width={60}
              height={40}
              className="block md:hidden"
            />
          </div>
        )}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        <GlobalCreatePostButton />
        <MessageButton />
        <NotificationDropdown />
        <SignedIn>
          <UserButton />
        </SignedIn>

        <SignedOut>
          <Button asChild variant="outline">
            <SignInButton mode="modal" />
          </Button>
        </SignedOut>
      </div>
    </header>
  );
}

export default Header;
