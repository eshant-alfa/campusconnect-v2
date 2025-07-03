import { type SchemaTypeDefinition } from "sanity";
import { userType } from "./userType";
import { postType } from "./postType";
import { commentType } from "./commentType";
import { voteType } from "./voteType";
import { subredditType } from "./subredditType";
import { messageType } from "./messageType";
import { chatGroupType } from "./chatGroupType";
import { categoryType } from "./categoryType";
import { marketplaceItemType } from "./marketplaceItemType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [userType, postType, commentType, voteType, subredditType, messageType, chatGroupType, categoryType, marketplaceItemType],
};
