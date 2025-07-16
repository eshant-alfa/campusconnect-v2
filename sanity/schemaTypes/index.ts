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

export * from "./subredditType";
export * from "./modActionType";
export * from "./appealType";
export { eventType } from "./eventType";
export { eventCommentType } from "./eventCommentType";
export { conversationType } from "./conversationType";
export { messageType } from "./messageType";
export { notificationType } from "./notificationType";
export { surveyType, surveyQuestionType, surveyResponseType, surveyResponseEntryType } from "./surveyType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [userType, postType, commentType, voteType, subredditType, modActionType, appealType, eventType, eventCommentType, marketplaceItemType, conversationType, messageType, notificationType, flaggedContentType, surveyType, surveyQuestionType, surveyResponseType, surveyResponseEntryType],
};
