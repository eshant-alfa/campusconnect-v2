import * as React from "react";
import { FlameIcon, HomeIcon, Minus, Plus, TrendingUpIcon, CloudSun, BookOpen, Info, ShoppingBag, Calendar, Shield, HelpCircle } from "lucide-react";

import { SearchForm } from "@/components/search-form";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Image from "next/image";
import CCLogo from "@/images/cc_full_logo.png";
import Link from "next/link";
import { getSubreddits } from "@/sanity/lib/subreddit/getSubreddits";
import CreateCommunityButton from "./header/CreateCommunityButton";
import { getUser } from "@/sanity/lib/user/getUser";

type SidebarData = {
  navMain: {
    title: string;
    url: string;
    items: {
      title: string;
      url: string;
      isActive: boolean;
    }[];
  }[];
};

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  // TODO: get all subreddits from sanity
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

  // This is sample data.
  const sidebarData: SidebarData = {
    navMain: [
      {
        title: "Communities",
        url: "#",
        items:
          subreddits?.map((subreddit: any) => ({
            title: subreddit.title || "unknown",
            url: `/community/${subreddit.slug}`,
            isActive: false,
          })) || [],
      },
    ],
  };

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
                <Link href="/resources">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Resources
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild className="p-5">
                <Link href="/marketplace">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Marketplace
                </Link>
              </SidebarMenuButton>
              {/* Move About Us to be just above Privacy Policy */}
              <SidebarMenuButton asChild className="p-5">
                <Link href="/about">
                  <Info className="w-4 h-4 mr-2" />
                  About Us
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild className="p-5">
                <Link href="/faq">
                  <HelpCircle className="w-4 h-4 mr-2 text-blue-600" />
                  FAQ
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild className="p-5">
                <Link href="/moderation-policy">
                  <Shield className="w-4 h-4 mr-2 text-blue-600" />
                  Moderation Policy
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild className="p-5">
                <Link href="/privacy-policy">
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy Policy
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
      <SidebarRail />
    </Sidebar>
  );
}
