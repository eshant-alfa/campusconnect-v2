import { sanityFetch } from "../live";
import { defineQuery } from "groq";
import { currentUser } from "@clerk/nextjs/server";
import { addOrUpdateUser } from "./addUser";

interface UserResult {
  _id: string;
  username: string;
  imageUrl: string;
  email: string;
}

const parseUsername = (username: string | null | undefined) => {
  if (!username) return `user${Math.floor(1000 + Math.random() * 9000)}`;
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return (
    username
      .replace(/\s+(.)/g, (_, char) => char.toUpperCase())
      .replace(/\s+/g, "") + randomNum
  );
};

export async function getUser(): Promise<UserResult | { error: string }> {
  try {
    console.log("Getting current user from Clerk");
    const loggedInUser = await currentUser();

    if (!loggedInUser) {
      console.log("No user logged in");
      return { error: "User not found" };
    }

    console.log(`Found Clerk user: ${loggedInUser.id}`);

    // Check if user exists in the database first
    const getExistingUserQuery = defineQuery(
      `*[_type == "user" && clerkId == $clerkId][0]`
    );

    console.log("Checking if user exists in Sanity database");
    const existingUser = await sanityFetch({
      query: getExistingUserQuery,
      params: { clerkId: loggedInUser.id },
    });

    // If user exists, return the user data
    if (existingUser.data?._id) {
      console.log(`User found in database with ID: ${existingUser.data._id}`);
      const user = {
        _id: existingUser.data._id,
        username: existingUser.data.username!,
        imageUrl: existingUser.data.imageUrl!,
        email: existingUser.data.email!,
      };

      return user;
    }

    console.log("User not found in database - manual creation required");
    return { error: "User not found in database. Please create a user profile first." };
  } catch (error) {
    console.error("Error getting user:", error);
    return { error: "Failed to get user" };
  }
}
