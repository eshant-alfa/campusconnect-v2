import * as React from "react";
import { FlameIcon, HomeIcon, Minus, Plus, TrendingUpIcon, Users, ShoppingBag, Info } from "lucide-react";

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
import Link from "next/link";
import { getSubreddits } from "@/sanity/lib/subreddit/getSubreddits";
import { getUserCommunities } from "@/sanity/lib/subreddit/getUserCommunities";
import { GetSubredditsQueryResult } from "@/sanity.types";
import CreateCommunityButton from "./header/CreateCommunityButton";
import { currentUser } from "@clerk/nextjs/server";
import { SearchForm } from "@/components/search-form";

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

function isSlugObject(slug: unknown): slug is { current: string } {
  return typeof slug === 'object' && slug !== null && 'current' in slug && typeof (slug as { current: unknown }).current === 'string';
}

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  // Get all subreddits and user's communities
  const [subreddits, user] = await Promise.all([
    getSubreddits(),
    currentUser(),
  ]);

  const userCommunities: GetSubredditsQueryResult = user ? await getUserCommunities(user.id) : [];

  // This is sample data.
  const sidebarData: SidebarData = {
    navMain: [
      {
        title: "My Communities",
        url: "#",
        items:
          userCommunities?.map((subreddit) => ({
            title: subreddit.title || "unknown",
            url: `/community/${isSlugObject(subreddit.slug) ? subreddit.slug.current : subreddit.slug}`,
            isActive: false,
          })) || [],
      },
      {
        title: "All Communities",
        url: "#",
        items:
          (subreddits as GetSubredditsQueryResult)?.map((subreddit) => ({
            title: subreddit.title || "unknown",
            url: `/community/${isSlugObject(subreddit.slug) ? subreddit.slug.current : subreddit.slug}`,
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
              <Link href="/" className="flex items-center justify-center w-full py-6">
                <Image
                  src="/images/logo_only.png"
                  alt="Campus Connect Logo"
                  width={56}
                  height={56}
                  style={{ width: '56px', height: '56px', background: 'none', display: 'block', border: 'none', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)' }}
                  className="object-contain rounded-xl shadow-md"
                  priority
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <CreateCommunityButton />
              </SidebarMenuButton>
              <div className="px-3 py-2">
                <SearchForm />
              </div>

              <SidebarMenuButton asChild className="p-5">
                <Link href="/">
                  <HomeIcon className="w-4 h-4 mr-2" />
                  Home
                </Link>
              </SidebarMenuButton>

              <SidebarMenuButton asChild className="p-5">
                <Link href="/weather">
                  <FlameIcon className="w-4 h-4 mr-2" />
                  Weather Alert
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild className="p-5 hover:bg-[var(--color-primary-light)] rounded-lg transition-colors">
                <Link href="/resources">
                  <TrendingUpIcon className="w-4 h-4 mr-2" />
                  Student Resources
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild className="p-5 hover:bg-[var(--color-primary-light)] rounded-lg transition-colors">
                <Link href="/marketplace">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Marketplace
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild className="p-5 hover:bg-[var(--color-primary-light)] rounded-lg transition-colors">
                <Link href="/about">
                  <Info className="w-4 h-4 mr-2" />
                  About Us
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarMenu>
            {sidebarData.navMain.map((item, index) => (
              <Collapsible
                key={item.title}
                defaultOpen={index === 0}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      {index === 0 ? (
                        <Users className="w-4 h-4 mr-2" />
                      ) : (
                        <FlameIcon className="w-4 h-4 mr-2" />
                      )}
                      {item.title}{" "}
                      <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
                      <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {item.items?.length ? (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((item) => (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={item.isActive}
                            >
                              <Link href={item.url}>{item.title}</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  ) : (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <div className="px-3 py-2 text-sm text-gray-500">
                            {index === 0 ? "No communities joined" : "No communities"}
                          </div>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  )}
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
