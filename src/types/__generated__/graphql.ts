export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: unknown; output: unknown; }
  JSON: { input: unknown; output: unknown; }
  Upload: { input: unknown; output: unknown; }
};

export type ActivityType = {
  __typename: 'ActivityType';
  action: Scalars['String']['output'];
  adminName: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['String']['output'];
  targetId: Scalars['String']['output'];
  targetType: Scalars['String']['output'];
};

export type AddPasswordPayload = {
  __typename: 'AddPasswordPayload';
  error: Maybe<ErrorType>;
  /** Specific error code if operation failed (e.g. UNAUTHENTICATED) */
  errorCode: Maybe<Scalars['String']['output']>;
  /** Success or error message */
  message: Maybe<Scalars['String']['output']>;
  /** Whether the password was added successfully */
  success: Scalars['Boolean']['output'];
  /** The updated user data */
  user: Maybe<UserType>;
};

export type AdminAnalyticsType = {
  __typename: 'AdminAnalyticsType';
  contentHealth: ChartDataType;
  engagementMetrics: ChartDataType;
  userGrowth: ChartDataType;
};

export type AdminAnchorPayload = {
  __typename: 'AdminAnchorPayload';
  anchor: Maybe<AdminAnchorType>;
  error: Maybe<ErrorType>;
  success: Scalars['Boolean']['output'];
};

export type AdminAnchorType = {
  __typename: 'AdminAnchorType';
  anchorStatus: Scalars['String']['output'];
  anchorType: Scalars['String']['output'];
  authorName: Scalars['String']['output'];
  circleId: Scalars['String']['output'];
  content: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  expiresAt: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  mediaUrl: Scalars['String']['output'];
  postedAt: Maybe<Scalars['String']['output']>;
  previewUrl: Maybe<Scalars['String']['output']>;
  publishedAt: Maybe<Scalars['String']['output']>;
  scheduledFor: Maybe<Scalars['String']['output']>;
  scriptureBook: Scalars['String']['output'];
  scriptureChapter: Maybe<Scalars['Int']['output']>;
  scriptureText: Scalars['String']['output'];
  scriptureTranslation: Scalars['String']['output'];
  scriptureVerseEnd: Maybe<Scalars['Int']['output']>;
  scriptureVerseStart: Maybe<Scalars['Int']['output']>;
  styleData: Scalars['JSON']['output'];
  title: Scalars['String']['output'];
};

export type AdminAnchorsPaginatedType = {
  __typename: 'AdminAnchorsPaginatedType';
  anchors: Array<AdminAnchorType>;
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type AdminCirclePayload = {
  __typename: 'AdminCirclePayload';
  circle: Maybe<AdminCircleType>;
  error: Maybe<ErrorType>;
  success: Scalars['Boolean']['output'];
};

export type AdminCircleType = {
  __typename: 'AdminCircleType';
  canEdit: Scalars['Boolean']['output'];
  cooldownRemainingDays: Scalars['Int']['output'];
  coverImage: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  createdByName: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  lastEditedAt: Maybe<Scalars['String']['output']>;
  memberCount: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  profileImageUrl: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type AdminCirclesPaginatedType = {
  __typename: 'AdminCirclesPaginatedType';
  circles: Array<AdminCircleType>;
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  summary: CircleSummaryType;
  totalCount: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type AdminContactPayload = {
  __typename: 'AdminContactPayload';
  contact: Maybe<AdminContactType>;
  error: Maybe<ErrorType>;
  success: Scalars['Boolean']['output'];
};

export type AdminContactReplyPayload = {
  __typename: 'AdminContactReplyPayload';
  contact: Maybe<AdminContactType>;
  error: Maybe<ErrorType>;
  success: Scalars['Boolean']['output'];
};

export type AdminContactType = {
  __typename: 'AdminContactType';
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  id: Scalars['String']['output'];
  message: Scalars['String']['output'];
  name: Scalars['String']['output'];
  repliedAt: Maybe<Scalars['String']['output']>;
  replies: Array<ContactReplyType>;
  status: Scalars['String']['output'];
};

export type AdminContactsPaginatedType = {
  __typename: 'AdminContactsPaginatedType';
  contacts: Array<AdminContactType>;
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  summary: ContactSummaryType;
  totalCount: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type AdminDashboardType = {
  __typename: 'AdminDashboardType';
  contentHealth: Array<ContentHealthItemType>;
  engagement: MetricCardType;
  pendingReports: MetricCardType;
  postsToday: MetricCardType;
  statistics: StatisticsType;
  totalUsers: MetricCardType;
};

export type AdminLoginPayload = {
  __typename: 'AdminLoginPayload';
  accessToken: Maybe<Scalars['String']['output']>;
  error: Maybe<ErrorType>;
  message: Maybe<Scalars['String']['output']>;
  refreshToken: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type AdminReportReviewPayload = {
  __typename: 'AdminReportReviewPayload';
  error: Maybe<ErrorType>;
  report: Maybe<AdminReportType>;
  success: Scalars['Boolean']['output'];
};

export type AdminReportType = {
  __typename: 'AdminReportType';
  action: Scalars['String']['output'];
  commentId: Maybe<Scalars['String']['output']>;
  contentOwner: Scalars['String']['output'];
  contentPreview: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['String']['output'];
  internalNotes: Scalars['String']['output'];
  postId: Maybe<Scalars['String']['output']>;
  reason: Scalars['String']['output'];
  reporter: Maybe<ReporterType>;
  reviewedAt: Maybe<Scalars['String']['output']>;
  reviewedByName: Scalars['String']['output'];
  status: Scalars['String']['output'];
  targetId: Maybe<Scalars['String']['output']>;
  targetType: Scalars['String']['output'];
};

export type AdminReportsPaginatedType = {
  __typename: 'AdminReportsPaginatedType';
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  reports: Array<AdminReportType>;
  summary: ReportSummaryType;
  totalCount: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type AdminUserType = {
  __typename: 'AdminUserType';
  avatarUrl: Scalars['String']['output'];
  bio: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isEmailVerified: Scalars['Boolean']['output'];
  lastLogin: Maybe<Scalars['String']['output']>;
  postsCount: Scalars['Int']['output'];
  role: Scalars['String']['output'];
  status: Scalars['String']['output'];
  suspendedAt: Maybe<Scalars['String']['output']>;
  suspensionReason: Scalars['String']['output'];
  username: Scalars['String']['output'];
  warnedAt: Maybe<Scalars['String']['output']>;
};

export type AdminUsersPaginatedType = {
  __typename: 'AdminUsersPaginatedType';
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  summary: UserSummaryType;
  totalCount: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
  users: Array<AdminUserType>;
};

export type AnchorPageType = {
  __typename: 'AnchorPageType';
  content: Scalars['String']['output'];
  mediaUrl: Scalars['String']['output'];
  pageNumber: Scalars['Int']['output'];
  title: Scalars['String']['output'];
};

export type AnchorResponsePayload = {
  __typename: 'AnchorResponsePayload';
  error: Maybe<ErrorType>;
  response: Maybe<AnchorResponseType>;
  success: Scalars['Boolean']['output'];
};

export type AnchorResponseReactionType = {
  __typename: 'AnchorResponseReactionType';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  reactionType: Scalars['String']['output'];
  user: UserType;
};

export type AnchorResponseType = {
  __typename: 'AnchorResponseType';
  author: UserType;
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  mediaType: Maybe<Scalars['String']['output']>;
  mediaUrl: Maybe<Scalars['String']['output']>;
  reactionCount: Scalars['Int']['output'];
  replyCount: Scalars['Int']['output'];
  responseType: Scalars['String']['output'];
  viewerReactionType: Maybe<Scalars['String']['output']>;
};

export type AnchorType = {
  __typename: 'AnchorType';
  anchorType: Scalars['String']['output'];
  author: Maybe<UserType>;
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  expiresAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  mediaUrl: Maybe<Scalars['String']['output']>;
  pages: Array<AnchorPageType>;
  publishedAt: Scalars['DateTime']['output'];
  responseCount: Scalars['Int']['output'];
  scriptureReference: Maybe<ScriptureReference>;
  timeRemaining: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type AuthPayload = {
  __typename: 'AuthPayload';
  /** JWT access token (valid for 15 minutes) */
  accessToken: Maybe<Scalars['String']['output']>;
  error: Maybe<ErrorType>;
  /** Specific error code if operation failed (e.g. INVALID_CREDENTIALS) */
  errorCode: Maybe<Scalars['String']['output']>;
  /** Success or error message */
  message: Maybe<Scalars['String']['output']>;
  /** JWT refresh token (valid for 7 days) */
  refreshToken: Maybe<Scalars['String']['output']>;
  /** Whether the authentication operation was successful */
  success: Scalars['Boolean']['output'];
  /** The authenticated user data */
  user: Maybe<UserType>;
};

export type BibleBook = {
  __typename: 'BibleBook';
  /** Volume capacity Cap */
  chapters: Scalars['Int']['output'];
  /** Full label ('Genesis') */
  name: Scalars['String']['output'];
  /** URL safe ('genesis') */
  slug: Scalars['String']['output'];
};

export type BibleVersion = {
  __typename: 'BibleVersion';
  /** Display tag ('KJV') */
  abbreviation: Scalars['String']['output'];
  /** Short code ('kjv') */
  code: Scalars['String']['output'];
  /** Public domain flag */
  free: Scalars['Boolean']['output'];
  /** ISO Code ('eng') */
  language: Scalars['String']['output'];
  /** Full text name ('King James Version') */
  name: Scalars['String']['output'];
  /** Coverage bounds ('complete', 'nt') */
  scope: Scalars['String']['output'];
};

export type BookmarkFolderPayload = {
  __typename: 'BookmarkFolderPayload';
  error: Maybe<ErrorType>;
  errorCode: Maybe<Scalars['String']['output']>;
  folder: Maybe<BookmarkFolderType>;
  message: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type BookmarkFolderType = {
  __typename: 'BookmarkFolderType';
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  savedCount: Scalars['Int']['output'];
};

export type BulkRemovePayload = {
  __typename: 'BulkRemovePayload';
  error: Maybe<ErrorType>;
  errorCode: Maybe<Scalars['String']['output']>;
  message: Maybe<Scalars['String']['output']>;
  removedCount: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
};

export type CategoryType = {
  __typename: 'CategoryType';
  bdColor: Scalars['String']['output'];
  bgColor: Scalars['String']['output'];
  icon: Scalars['String']['output'];
  id: Scalars['String']['output'];
  label: Scalars['String']['output'];
  order: Maybe<Scalars['Int']['output']>;
  slug: Scalars['String']['output'];
  textPostBg: Maybe<Scalars['String']['output']>;
};

export type ChangePasswordPayload = {
  __typename: 'ChangePasswordPayload';
  error: Maybe<ErrorType>;
  /** Specific error code if operation failed (e.g. INVALID_CREDENTIALS) */
  errorCode: Maybe<Scalars['String']['output']>;
  /** Success or error message */
  message: Maybe<Scalars['String']['output']>;
  /** Number of other device sessions terminated */
  signedOutDevices: Scalars['Int']['output'];
  /** Whether the password change was successful */
  success: Scalars['Boolean']['output'];
};

export type ChartDataType = {
  __typename: 'ChartDataType';
  datasets: Array<DatasetType>;
  labels: Array<Scalars['String']['output']>;
  summary: Scalars['JSON']['output'];
};

export type CircleMemberType = {
  __typename: 'CircleMemberType';
  avatarUrl: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  joinedAt: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export type CircleMembersPaginatedType = {
  __typename: 'CircleMembersPaginatedType';
  members: Array<CircleMemberType>;
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type CircleReportPayload = {
  __typename: 'CircleReportPayload';
  error: Maybe<ErrorType>;
  success: Scalars['Boolean']['output'];
};

export type CircleRule = {
  __typename: 'CircleRule';
  description: Scalars['String']['output'];
  ruleNumber: Scalars['Int']['output'];
  title: Scalars['String']['output'];
};

export type CircleSummaryType = {
  __typename: 'CircleSummaryType';
  active: Scalars['Int']['output'];
  inactive: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type CircleType = {
  __typename: 'CircleType';
  activeAnchor: Maybe<AnchorType>;
  coverImage: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isSubscribed: Scalars['Boolean']['output'];
  memberCount: Scalars['Int']['output'];
  memberPreviews: Array<UserType>;
  name: Scalars['String']['output'];
  rules: Array<CircleRule>;
};

export type CommentAuthor = {
  __typename: 'CommentAuthor';
  avatarUrl: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export type CommentPayload = {
  __typename: 'CommentPayload';
  comment: Maybe<CommentType>;
  error: Maybe<ErrorType>;
  errorCode: Maybe<Scalars['String']['output']>;
  message: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type CommentStats = {
  __typename: 'CommentStats';
  likesCount: Scalars['Int']['output'];
  repliesCount: Scalars['Int']['output'];
};

export type CommentType = {
  __typename: 'CommentType';
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  parentCommentId: Maybe<Scalars['String']['output']>;
  postId: Scalars['String']['output'];
  replies: Array<CommentType>;
  stats: CommentStats;
  text: Scalars['String']['output'];
  user: CommentAuthor;
  viewerState: Maybe<CommentViewerState>;
};

export type CommentViewerState = {
  __typename: 'CommentViewerState';
  isOwner: Scalars['Boolean']['output'];
  liked: Scalars['Boolean']['output'];
};

export type CommentsResponse = {
  __typename: 'CommentsResponse';
  comments: Array<CommentType>;
  hasMore: Scalars['Boolean']['output'];
  nextCursor: Maybe<Scalars['String']['output']>;
  totalCount: Scalars['Int']['output'];
};

export type ContactReplyType = {
  __typename: 'ContactReplyType';
  id: Scalars['String']['output'];
  message: Scalars['String']['output'];
  sentAt: Scalars['String']['output'];
  sentByName: Scalars['String']['output'];
};

export type ContactSummaryType = {
  __typename: 'ContactSummaryType';
  inProgress: Scalars['Int']['output'];
  pending: Scalars['Int']['output'];
  resolved: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type ContentHealthItemType = {
  __typename: 'ContentHealthItemType';
  color: Scalars['String']['output'];
  label: Scalars['String']['output'];
  percentage: Scalars['Float']['output'];
  value: Scalars['Int']['output'];
};

export type CreateAnchorPayload = {
  __typename: 'CreateAnchorPayload';
  anchor: Maybe<AnchorType>;
  error: Maybe<ErrorType>;
  success: Scalars['Boolean']['output'];
};

export type CreatePostPayload = {
  __typename: 'CreatePostPayload';
  /** Explicit error info */
  error: Maybe<ErrorType>;
  /** The resulting post */
  post: Maybe<Post>;
  /** Whether the mutation succeeded */
  success: Scalars['Boolean']['output'];
};

export type CurrentUserResponse = {
  __typename: 'CurrentUserResponse';
  createdAt: Scalars['String']['output'];
  displayName: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  hasPassword: Scalars['Boolean']['output'];
  hideLikeCount: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  isEmailVerified: Scalars['Boolean']['output'];
  lastNameChange: Maybe<Scalars['String']['output']>;
  lastUsernameChange: Maybe<Scalars['String']['output']>;
  profile: UserProfileType;
  stats: ProfileStatsType;
  username: Scalars['String']['output'];
};

export type DatasetType = {
  __typename: 'DatasetType';
  data: Array<Scalars['Int']['output']>;
  label: Scalars['String']['output'];
};

export type DeleteFolderPayload = {
  __typename: 'DeleteFolderPayload';
  error: Maybe<ErrorType>;
  errorCode: Maybe<Scalars['String']['output']>;
  message: Maybe<Scalars['String']['output']>;
  movedPostsCount: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
};

export type EmptyState = {
  __typename: 'EmptyState';
  message: Scalars['String']['output'];
  suggestions: Array<UserSuggestion>;
};

export type ErrorType = {
  __typename: 'ErrorType';
  code: Scalars['String']['output'];
  details: Maybe<Scalars['JSON']['output']>;
  field: Maybe<Scalars['String']['output']>;
  message: Scalars['String']['output'];
};

export type FeedPost = {
  __typename: 'FeedPost';
  author: FeedPostAuthor;
  /** Caption/note attached to a BIBLE post. Null for TEXT and MEDIA posts. */
  bibleMessage: Maybe<Scalars['String']['output']>;
  /** Caption for MEDIA posts. Null for TEXT and BIBLE posts. */
  caption: Maybe<Scalars['String']['output']>;
  /** Full category object natively */
  category: Maybe<CategoryType>;
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  /** Image data array mapping */
  image: Maybe<ImageData>;
  savedInFolders: Maybe<Array<BookmarkFolderType>>;
  scripture: Maybe<FeedPostScripture>;
  shareUrl: Scalars['String']['output'];
  stats: FeedPostStats;
  /** Content body for TEXT posts only. Null for MEDIA and BIBLE posts. */
  textMessage: Maybe<Scalars['String']['output']>;
  type: PostType;
  /** Video metadata mapping */
  video: Maybe<VideoData>;
  viewerState: Maybe<FeedViewerState>;
};

export type FeedPostAuthor = {
  __typename: 'FeedPostAuthor';
  avatarUrl: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export type FeedPostScripture = {
  __typename: 'FeedPostScripture';
  book: Scalars['String']['output'];
  chapter: Scalars['Int']['output'];
  reference: Scalars['String']['output'];
  text: Scalars['String']['output'];
  translation: Scalars['String']['output'];
  verseEnd: Maybe<Scalars['Int']['output']>;
  verseStart: Scalars['Int']['output'];
  verses: Array<ScriptureVerse>;
};

export type FeedPostStats = {
  __typename: 'FeedPostStats';
  commentsCount: Scalars['String']['output'];
  likesCount: Scalars['String']['output'];
  savesCount: Scalars['String']['output'];
  sharesCount: Scalars['String']['output'];
};

export type FeedResponse = {
  __typename: 'FeedResponse';
  emptyState: Maybe<EmptyState>;
  hasMore: Scalars['Boolean']['output'];
  nextCursor: Maybe<Scalars['String']['output']>;
  posts: Array<FeedPost>;
};

export type FeedViewerState = {
  __typename: 'FeedViewerState';
  followedByAuthor: Scalars['Boolean']['output'];
  followingAuthor: Scalars['Boolean']['output'];
  isOwner: Scalars['Boolean']['output'];
  liked: Scalars['Boolean']['output'];
  saved: Scalars['Boolean']['output'];
};

export type FollowListResponse = {
  __typename: 'FollowListResponse';
  /** Scrolling bounds limit tracking flag */
  hasMore: Scalars['Boolean']['output'];
  /** Passed backwards safely */
  nextCursor: Maybe<Scalars['String']['output']>;
  /** Directly resolved mapping array of users */
  users: Array<FollowUserType>;
};

export type FollowPayload = {
  __typename: 'FollowPayload';
  /** Explicit error object */
  error: Maybe<ErrorType>;
  /** Detailed failure string identifier */
  errorCode: Maybe<Scalars['String']['output']>;
  /** The new resultant state boolean flag natively */
  following: Scalars['Boolean']['output'];
  /** Detailed logging message or success */
  message: Maybe<Scalars['String']['output']>;
  /** Updated profile stats */
  stats: Maybe<ProfileStatsType>;
  /** Whether the state change persisted */
  success: Scalars['Boolean']['output'];
};

export type FollowUserType = {
  __typename: 'FollowUserType';
  avatarUrl: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  isFollowing: Scalars['Boolean']['output'];
  username: Scalars['String']['output'];
};

export type FriendType = {
  __typename: 'FriendType';
  avatarUrl: Maybe<Scalars['String']['output']>;
  fullName: Scalars['String']['output'];
  id: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export type GoogleOAuthPayload = {
  __typename: 'GoogleOAuthPayload';
  /** JWT access token */
  accessToken: Maybe<Scalars['String']['output']>;
  error: Maybe<ErrorType>;
  /** Specific error code */
  errorCode: Maybe<Scalars['String']['output']>;
  /** True if a new account was created */
  isNewUser: Scalars['Boolean']['output'];
  /** Success or error message */
  message: Maybe<Scalars['String']['output']>;
  /** JWT refresh token */
  refreshToken: Maybe<Scalars['String']['output']>;
  /** Whether the authentication was successful */
  success: Scalars['Boolean']['output'];
  /** The authenticated user data */
  user: Maybe<UserType>;
};

export type HiddenPostsResponse = {
  __typename: 'HiddenPostsResponse';
  hasMore: Scalars['Boolean']['output'];
  nextCursor: Maybe<Scalars['String']['output']>;
  posts: Array<FeedPost>;
};

export type HidePostPayload = {
  __typename: 'HidePostPayload';
  error: Maybe<ErrorType>;
  errorCode: Maybe<Scalars['String']['output']>;
  message: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type ImageData = {
  __typename: 'ImageData';
  items: Array<MediaFileType>;
};

export type JoinCirclePayload = {
  __typename: 'JoinCirclePayload';
  circle: Maybe<CircleType>;
  error: Maybe<ErrorType>;
  success: Scalars['Boolean']['output'];
};

export type LikePayload = {
  __typename: 'LikePayload';
  error: Maybe<ErrorType>;
  errorCode: Maybe<Scalars['String']['output']>;
  liked: Scalars['Boolean']['output'];
  message: Maybe<Scalars['String']['output']>;
  stats: Maybe<PostStats>;
  success: Scalars['Boolean']['output'];
};

export type MediaFileType = {
  __typename: 'MediaFileType';
  duration: Maybe<Scalars['Int']['output']>;
  height: Maybe<Scalars['Int']['output']>;
  id: Scalars['String']['output'];
  thumbnailUrl: Maybe<Scalars['String']['output']>;
  type: MediaType;
  url: Scalars['String']['output'];
  width: Maybe<Scalars['Int']['output']>;
};

export enum MediaType {
  Image = 'IMAGE',
  Video = 'VIDEO'
}

export type MediaUploadPayload = {
  __typename: 'MediaUploadPayload';
  error: Maybe<ErrorType>;
  expiresIn: Maybe<Scalars['Int']['output']>;
  mediaId: Maybe<Scalars['String']['output']>;
  mediaUrl: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
  uploadUrl: Maybe<Scalars['String']['output']>;
};

export type MetricCardType = {
  __typename: 'MetricCardType';
  change: Scalars['Float']['output'];
  label: Scalars['String']['output'];
  value: Scalars['Int']['output'];
};

export type ModerationActionPayload = {
  __typename: 'ModerationActionPayload';
  error: Maybe<ErrorType>;
  success: Scalars['Boolean']['output'];
  user: Maybe<AdminUserType>;
};

export type Mutation = {
  __typename: 'Mutation';
  /** Add password to OAuth-only account. Allows Google sign-in users to also login with password. Only works if user doesn't already have password. */
  addPassword: AddPasswordPayload;
  /** Activate a circle. */
  adminActivateCircle: AdminCirclePayload;
  /** Cancel a scheduled anchor. */
  adminCancelScheduledAnchor: AdminAnchorPayload;
  /** Create a draft anchor. */
  adminCreateAnchor: AdminAnchorPayload;
  /** Create a new circle (admin only). */
  adminCreateCircle: AdminCirclePayload;
  /** Deactivate a circle. */
  adminDeactivateCircle: AdminCirclePayload;
  /** Edit a circle (admin only, 60-day cooldown enforced). */
  adminEditCircle: AdminCirclePayload;
  /** Edit a scheduled anchor's content. */
  adminEditScheduledAnchor: AdminAnchorPayload;
  /** Admin login — validates admin role. */
  adminLogin: AdminLoginPayload;
  /** Reply to a contact message. */
  adminReplyToContact: AdminContactReplyPayload;
  /** Review a report and take action. */
  adminReviewReport: AdminReportReviewPayload;
  /** Schedule an anchor for posting. */
  adminScheduleAnchor: AdminAnchorPayload;
  /** Post an anchor immediately. */
  adminSendAnchorNow: AdminAnchorPayload;
  /** Update contact message status. */
  adminUpdateContactStatus: AdminContactPayload;
  /** Remove multiple bookmarks at once */
  bulkRemoveBookmarks: BulkRemovePayload;
  /** Change password for authenticated user. Requires current password. Can optionally sign out all other devices. */
  changePassword: ChangePasswordPayload;
  /** Check if a username is available */
  checkUsernameAvailability: UsernameCheckResult;
  /** Complete password reset using resetToken from OTP verification. Sets new password and optionally signs out all other devices. */
  confirmPasswordReset: ChangePasswordPayload;
  createAnchor: CreateAnchorPayload;
  /** Create a bookmark folder */
  createBookmarkFolder: BookmarkFolderPayload;
  /** Create a nested or top-level text comment on a Post payload. */
  createComment: CommentPayload;
  /** Create a new multimedia app post. Supports Text, Media, and Bible variants. */
  createPost: CreatePostPayload;
  /** Delete a bookmark folder */
  deleteBookmarkFolder: DeleteFolderPayload;
  /** Delete a comment */
  deleteComment: CommentPayload;
  deleteNotification: SuccessResponse;
  /** Soft delete an existing post. */
  deletePost: PostPayload;
  /** Soft-delete a user (admin only). */
  deleteUser: ModerationActionPayload;
  /** Directly upload media file (image or video) seamlessly */
  directUploadMedia: MediaUploadPayload;
  /** Set permanent username after Google OAuth signup. Replaces temporary username (user_XXXXXXXX) with chosen username. Validates availability. */
  finalizeUsername: AuthPayload;
  /** Optimistically toggle a direct Edge relationship connecting to a User account globally. */
  followUser: FollowPayload;
  /** Authenticate user via Google OAuth. Creates account if new user, or logs in existing user. Sets needsUsernameSelection=true for new OAuth users. */
  googleOauth: GoogleOAuthPayload;
  /** Hide a post from the current user's feed */
  hidePost: HidePostPayload;
  joinCircle: JoinCirclePayload;
  leaveCircle: JoinCirclePayload;
  /** Like a comment */
  likeComment: LikePayload;
  /** Optimistically toggle a 'like' on a specific post. */
  likePost: LikePayload;
  /** Authenticate existing user with email/password. Returns user data and access/refresh tokens. */
  login: AuthPayload;
  markAllNotificationsAsRead: SuccessResponse;
  markNotificationAsRead: SuccessResponse;
  reactToResponse: ReactionPayload;
  /** Reactivate a user (admin only). */
  reactivateUser: ModerationActionPayload;
  /** Rotate refresh token for new token pair. */
  refreshToken: AuthPayload;
  /** Create a new user account with email and password. Returns user object and JWT tokens for immediate login. */
  register: AuthPayload;
  registerDeviceToken: SuccessResponse;
  replyToResponse: AnchorResponsePayload;
  reportCircleContent: CircleReportPayload;
  /** File a Community Guidelines violation against an active node. */
  reportContent: ReportPayload;
  /** Request password reset via email. Sends OTP code to user's email address. */
  resetPassword: OtpPayload;
  respondToAnchor: AnchorResponsePayload;
  /** Update specific report processing state dynamically (Admin only). */
  reviewReport: ReportPayload;
  /** Add bookmark saving a post strictly. */
  savePost: SavePayload;
  sendAdminAnnouncement: SuccessResponse;
  /** Send one-time password code via email. Supports three purposes: registration, email_verification, password_reset. Rate-limited to 3 requests per 10 minutes. */
  sendOtp: OtpPayload;
  /** Set user interests for feed personalization */
  setInterests: SetInterestsPayload;
  /** Share a post to another user */
  sharePostDirect: SharePayload;
  /** Share a post externally (generate link) */
  sharePostExternal: SharePayload;
  /** Public: submit a contact/support message (no auth required). */
  submitContactMessage: SubmitContactPayload;
  /** Get username suggestions based on a name */
  suggestUsernames: Array<Scalars['String']['output']>;
  /** Suspend a user (admin only). */
  suspendUser: ModerationActionPayload;
  /** Delete an existing following Edge relation targeting a User account. */
  unfollowUser: FollowPayload;
  /** Unhide a previously hidden post */
  unhidePost: HidePostPayload;
  /** Unlike a post */
  unlikePost: LikePayload;
  /** Unsave/remove a bookmark */
  unsavePost: SavePayload;
  updateNotificationPreferences: NotificationPreferencesType;
  /** Edit the caption of an existing post. Only accessible by post owner. */
  updatePost: PostPayload;
  /** Update the authenticated user's public profile information. */
  updateProfile: ProfilePayload;
  /** Update the authenticated user's username (rate-limited to once every 30 days). */
  updateUsername: UpdateUsernamePayload;
  /** Request a signed URL for media upload correctly matching uploadMedia mapping */
  uploadMedia: MediaUploadPayload;
  /** Verify email address using verification token. Returns tokens for registration/verification or resetToken for password reset. */
  verifyEmail: AuthPayload;
  /** Verify OTP code and complete action. For registration/email_verification returns tokens. For password_reset returns resetToken for next step. */
  verifyOtp: VerifyOtpPayload;
  /** Warn a user (admin only). */
  warnUser: ModerationActionPayload;
};


export type MutationAddPasswordArgs = {
  password: Scalars['String']['input'];
};


export type MutationAdminActivateCircleArgs = {
  circleId: Scalars['String']['input'];
};


export type MutationAdminCancelScheduledAnchorArgs = {
  anchorId: Scalars['String']['input'];
};


export type MutationAdminCreateAnchorArgs = {
  anchorType: Scalars['String']['input'];
  circleId: Scalars['String']['input'];
  content?: Scalars['String']['input'];
  mediaUrl?: Scalars['String']['input'];
  scriptureBook?: Scalars['String']['input'];
  scriptureChapter?: InputMaybe<Scalars['Int']['input']>;
  scriptureText?: Scalars['String']['input'];
  scriptureTranslation?: Scalars['String']['input'];
  scriptureVerseEnd?: InputMaybe<Scalars['Int']['input']>;
  scriptureVerseStart?: InputMaybe<Scalars['Int']['input']>;
  styleData?: InputMaybe<Scalars['JSON']['input']>;
  title: Scalars['String']['input'];
};


export type MutationAdminCreateCircleArgs = {
  coverImage: Scalars['String']['input'];
  description: Scalars['String']['input'];
  name: Scalars['String']['input'];
  profileImageUrl?: Scalars['String']['input'];
};


export type MutationAdminDeactivateCircleArgs = {
  circleId: Scalars['String']['input'];
};


export type MutationAdminEditCircleArgs = {
  circleId: Scalars['String']['input'];
  coverImage?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  profileImageUrl?: InputMaybe<Scalars['String']['input']>;
};


export type MutationAdminEditScheduledAnchorArgs = {
  anchorId: Scalars['String']['input'];
  content?: InputMaybe<Scalars['String']['input']>;
  mediaUrl?: InputMaybe<Scalars['String']['input']>;
  scriptureBook?: InputMaybe<Scalars['String']['input']>;
  scriptureChapter?: InputMaybe<Scalars['Int']['input']>;
  scriptureText?: InputMaybe<Scalars['String']['input']>;
  scriptureTranslation?: InputMaybe<Scalars['String']['input']>;
  scriptureVerseEnd?: InputMaybe<Scalars['Int']['input']>;
  scriptureVerseStart?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};


export type MutationAdminLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationAdminReplyToContactArgs = {
  contactId: Scalars['String']['input'];
  message: Scalars['String']['input'];
};


export type MutationAdminReviewReportArgs = {
  action: Scalars['String']['input'];
  internalNotes?: Scalars['String']['input'];
  reason?: Scalars['String']['input'];
  reportId: Scalars['String']['input'];
};


export type MutationAdminScheduleAnchorArgs = {
  anchorId: Scalars['String']['input'];
  scheduledFor: Scalars['String']['input'];
};


export type MutationAdminSendAnchorNowArgs = {
  anchorId: Scalars['String']['input'];
};


export type MutationAdminUpdateContactStatusArgs = {
  contactId: Scalars['String']['input'];
  status: Scalars['String']['input'];
};


export type MutationBulkRemoveBookmarksArgs = {
  postIds: Array<Scalars['String']['input']>;
};


export type MutationChangePasswordArgs = {
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
  signOutOtherDevices?: Scalars['Boolean']['input'];
};


export type MutationCheckUsernameAvailabilityArgs = {
  username: Scalars['String']['input'];
};


export type MutationConfirmPasswordResetArgs = {
  newPassword: Scalars['String']['input'];
  resetToken: Scalars['String']['input'];
  signOutAllDevices?: Scalars['Boolean']['input'];
};


export type MutationCreateAnchorArgs = {
  anchorType: Scalars['String']['input'];
  circleId: Scalars['String']['input'];
  content?: Scalars['String']['input'];
  mediaUrl?: Scalars['String']['input'];
  publishedAt?: InputMaybe<Scalars['String']['input']>;
  scriptureBook?: Scalars['String']['input'];
  scriptureChapter?: InputMaybe<Scalars['Int']['input']>;
  scriptureText?: Scalars['String']['input'];
  scriptureTranslation?: Scalars['String']['input'];
  scriptureVerseEnd?: InputMaybe<Scalars['Int']['input']>;
  scriptureVerseStart?: InputMaybe<Scalars['Int']['input']>;
  title: Scalars['String']['input'];
};


export type MutationCreateBookmarkFolderArgs = {
  name: Scalars['String']['input'];
};


export type MutationCreateCommentArgs = {
  parentCommentId?: InputMaybe<Scalars['String']['input']>;
  postId: Scalars['String']['input'];
  text: Scalars['String']['input'];
};


export type MutationCreatePostArgs = {
  bibleMessage?: InputMaybe<Scalars['String']['input']>;
  caption?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  height?: InputMaybe<Scalars['Int']['input']>;
  mediaIds?: InputMaybe<Array<Scalars['String']['input']>>;
  mediaType?: InputMaybe<MediaType>;
  mediaUrls?: InputMaybe<Array<Scalars['String']['input']>>;
  postType: PostType;
  scriptureBook?: InputMaybe<Scalars['String']['input']>;
  scriptureChapter?: InputMaybe<Scalars['Int']['input']>;
  scriptureTranslation?: InputMaybe<Scalars['String']['input']>;
  scriptureVerseEnd?: InputMaybe<Scalars['Int']['input']>;
  scriptureVerseStart?: InputMaybe<Scalars['Int']['input']>;
  textMessage?: InputMaybe<Scalars['String']['input']>;
  thumbnailUrl?: InputMaybe<Scalars['String']['input']>;
  width?: InputMaybe<Scalars['Int']['input']>;
};


export type MutationDeleteBookmarkFolderArgs = {
  folderId: Scalars['String']['input'];
};


export type MutationDeleteCommentArgs = {
  commentId: Scalars['String']['input'];
};


export type MutationDeleteNotificationArgs = {
  notificationId: Scalars['ID']['input'];
};


export type MutationDeletePostArgs = {
  postId: Scalars['String']['input'];
};


export type MutationDeleteUserArgs = {
  userId: Scalars['String']['input'];
};


export type MutationDirectUploadMediaArgs = {
  file: Scalars['Upload']['input'];
  mediaType: MediaType;
};


export type MutationFinalizeUsernameArgs = {
  username: Scalars['String']['input'];
};


export type MutationFollowUserArgs = {
  userId: Scalars['String']['input'];
};


export type MutationGoogleOauthArgs = {
  idToken: Scalars['String']['input'];
};


export type MutationHidePostArgs = {
  postId: Scalars['String']['input'];
};


export type MutationJoinCircleArgs = {
  circleId: Scalars['String']['input'];
};


export type MutationLeaveCircleArgs = {
  circleId: Scalars['String']['input'];
};


export type MutationLikeCommentArgs = {
  commentId: Scalars['String']['input'];
};


export type MutationLikePostArgs = {
  postId: Scalars['String']['input'];
};


export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationMarkNotificationAsReadArgs = {
  notificationId: Scalars['ID']['input'];
};


export type MutationReactToResponseArgs = {
  reactionType: Scalars['String']['input'];
  responseId: Scalars['String']['input'];
};


export type MutationReactivateUserArgs = {
  userId: Scalars['String']['input'];
};


export type MutationRefreshTokenArgs = {
  refreshToken: Scalars['String']['input'];
};


export type MutationRegisterArgs = {
  email: Scalars['String']['input'];
  fullName?: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationRegisterDeviceTokenArgs = {
  platform: Scalars['String']['input'];
  token: Scalars['String']['input'];
};


export type MutationReplyToResponseArgs = {
  content: Scalars['String']['input'];
  mediaType?: Scalars['String']['input'];
  mediaUrl?: Scalars['String']['input'];
  parentResponseId: Scalars['String']['input'];
};


export type MutationReportCircleContentArgs = {
  circleId: Scalars['String']['input'];
  reason: Scalars['String']['input'];
  targetId: Scalars['String']['input'];
  targetType: Scalars['String']['input'];
};


export type MutationReportContentArgs = {
  commentId?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  postId?: InputMaybe<Scalars['String']['input']>;
  reason: Scalars['String']['input'];
};


export type MutationResetPasswordArgs = {
  email: Scalars['String']['input'];
};


export type MutationRespondToAnchorArgs = {
  anchorId: Scalars['String']['input'];
  content: Scalars['String']['input'];
  mediaType?: Scalars['String']['input'];
  mediaUrl?: Scalars['String']['input'];
  responseType: Scalars['String']['input'];
};


export type MutationReviewReportArgs = {
  reportId: Scalars['String']['input'];
  status: Scalars['String']['input'];
};


export type MutationSavePostArgs = {
  folderId?: InputMaybe<Scalars['String']['input']>;
  folderName?: InputMaybe<Scalars['String']['input']>;
  postId: Scalars['String']['input'];
};


export type MutationSendAdminAnnouncementArgs = {
  message: Scalars['String']['input'];
  targetUsers?: InputMaybe<Array<Scalars['ID']['input']>>;
};


export type MutationSendOtpArgs = {
  email: Scalars['String']['input'];
  purpose: Scalars['String']['input'];
};


export type MutationSetInterestsArgs = {
  interests: Array<Scalars['String']['input']>;
};


export type MutationSharePostDirectArgs = {
  postId: Scalars['String']['input'];
  recipientId: Scalars['String']['input'];
};


export type MutationSharePostExternalArgs = {
  postId: Scalars['String']['input'];
};


export type MutationSubmitContactMessageArgs = {
  email: Scalars['String']['input'];
  message: Scalars['String']['input'];
  name: Scalars['String']['input'];
};


export type MutationSuggestUsernamesArgs = {
  baseName: Scalars['String']['input'];
};


export type MutationSuspendUserArgs = {
  reason: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationUnfollowUserArgs = {
  userId: Scalars['String']['input'];
};


export type MutationUnhidePostArgs = {
  postId: Scalars['String']['input'];
};


export type MutationUnlikePostArgs = {
  postId: Scalars['String']['input'];
};


export type MutationUnsavePostArgs = {
  postId: Scalars['String']['input'];
};


export type MutationUpdateNotificationPreferencesArgs = {
  preferences: PreferencesInput;
};


export type MutationUpdatePostArgs = {
  caption?: InputMaybe<Scalars['String']['input']>;
  postId: Scalars['String']['input'];
};


export type MutationUpdateProfileArgs = {
  avatarUrl?: InputMaybe<Scalars['String']['input']>;
  bio?: InputMaybe<Scalars['String']['input']>;
  fullName?: InputMaybe<Scalars['String']['input']>;
  hideLikeCount?: InputMaybe<Scalars['Boolean']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateUsernameArgs = {
  username: Scalars['String']['input'];
};


export type MutationUploadMediaArgs = {
  fileName: Scalars['String']['input'];
  fileSize: Scalars['Int']['input'];
  fileType: Scalars['String']['input'];
};


export type MutationVerifyEmailArgs = {
  token: Scalars['String']['input'];
};


export type MutationVerifyOtpArgs = {
  code: Scalars['String']['input'];
  email: Scalars['String']['input'];
  purpose: Scalars['String']['input'];
};


export type MutationWarnUserArgs = {
  reason: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type NotificationConnection = {
  __typename: 'NotificationConnection';
  hasMore: Scalars['Boolean']['output'];
  items: Array<NotificationItem>;
  nextCursor: Maybe<Scalars['String']['output']>;
};

export type NotificationItem = {
  __typename: 'NotificationItem';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isRead: Scalars['Boolean']['output'];
  message: Scalars['String']['output'];
  referenceId: Maybe<Scalars['ID']['output']>;
  referenceType: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type NotificationPreferencesType = {
  __typename: 'NotificationPreferencesType';
  adminAnnouncements: Scalars['Boolean']['output'];
  anchorNotifications: Scalars['Boolean']['output'];
  circleActivityNotifications: Scalars['Boolean']['output'];
  likeNotifications: Scalars['Boolean']['output'];
  replyNotifications: Scalars['Boolean']['output'];
};

export type OtpPayload = {
  __typename: 'OTPPayload';
  error: Maybe<ErrorType>;
  /** Specific error code if operation failed */
  errorCode: Maybe<Scalars['String']['output']>;
  /** Seconds until the code expires */
  expiresIn: Maybe<Scalars['Int']['output']>;
  /** Success or error message */
  message: Maybe<Scalars['String']['output']>;
  /** The purpose string echoed back */
  purpose: Maybe<Scalars['String']['output']>;
  /** Seconds to wait before resend is allowed */
  resendAfter: Maybe<Scalars['Int']['output']>;
  /** Whether the OTP was sent successfully */
  success: Scalars['Boolean']['output'];
};

export type Post = {
  __typename: 'Post';
  /** Post author info */
  author: Maybe<PostAuthor>;
  /** Caption/note attached to a BIBLE post. Null for TEXT and MEDIA posts. */
  bibleMessage: Maybe<Scalars['String']['output']>;
  /** Caption for MEDIA posts. Null for TEXT and BIBLE posts. */
  caption: Maybe<Scalars['String']['output']>;
  /** Full category object */
  category: Maybe<CategoryType>;
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  /** Media files array */
  media: Array<MediaFileType>;
  savedInFolders: Maybe<Array<BookmarkFolderType>>;
  /** Attached scripture reference */
  scripture: Maybe<PostScripture>;
  shareUrl: Scalars['String']['output'];
  /** Engagement statistics */
  stats: PostStats;
  /** Content body for TEXT posts only. Null for MEDIA and BIBLE posts. */
  textMessage: Maybe<Scalars['String']['output']>;
  type: PostType;
  /** Viewer's relationship to this post */
  viewerState: Maybe<PostViewerState>;
};

export type PostAuthor = {
  __typename: 'PostAuthor';
  avatarUrl: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export type PostPayload = {
  __typename: 'PostPayload';
  error: Maybe<ErrorType>;
  errorCode: Maybe<Scalars['String']['output']>;
  message: Maybe<Scalars['String']['output']>;
  postId: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type PostScripture = {
  __typename: 'PostScripture';
  book: Scalars['String']['output'];
  chapter: Scalars['Int']['output'];
  reference: Scalars['String']['output'];
  text: Scalars['String']['output'];
  translation: Scalars['String']['output'];
  verseEnd: Maybe<Scalars['Int']['output']>;
  verseStart: Scalars['Int']['output'];
  verses: Array<ScriptureVerse>;
};

export type PostStats = {
  __typename: 'PostStats';
  commentsCount: Scalars['Int']['output'];
  likesCount: Scalars['Int']['output'];
  savesCount: Scalars['Int']['output'];
  sharesCount: Scalars['Int']['output'];
};

export enum PostType {
  Bible = 'BIBLE',
  Media = 'MEDIA',
  Text = 'TEXT'
}

export type PostViewerState = {
  __typename: 'PostViewerState';
  followingAuthor: Scalars['Boolean']['output'];
  isOwner: Scalars['Boolean']['output'];
  liked: Scalars['Boolean']['output'];
  saved: Scalars['Boolean']['output'];
};

export type PreferencesInput = {
  adminAnnouncements?: InputMaybe<Scalars['Boolean']['input']>;
  anchorNotifications?: InputMaybe<Scalars['Boolean']['input']>;
  circleActivityNotifications?: InputMaybe<Scalars['Boolean']['input']>;
  likeNotifications?: InputMaybe<Scalars['Boolean']['input']>;
  replyNotifications?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ProfilePayload = {
  __typename: 'ProfilePayload';
  /** Explicit error info */
  error: Maybe<ErrorType>;
  /** Code dictating failure reason safely */
  errorCode: Maybe<Scalars['String']['output']>;
  /** Success or error message */
  message: Maybe<Scalars['String']['output']>;
  /** The updated profile data */
  profile: Maybe<UserProfileType>;
  /** Whether the profile updated successfully */
  success: Scalars['Boolean']['output'];
};

export type ProfilePostResponseListDto = {
  __typename: 'ProfilePostResponseListDTO';
  hasMore: Scalars['Boolean']['output'];
  nextCursor: Maybe<Scalars['String']['output']>;
  posts: Array<FeedPost>;
};

export type ProfileStatsType = {
  __typename: 'ProfileStatsType';
  followersCount: Scalars['String']['output'];
  followingCount: Scalars['String']['output'];
  postsCount: Scalars['String']['output'];
};

export type ProfileViewerState = {
  __typename: 'ProfileViewerState';
  isFollowedBy: Scalars['Boolean']['output'];
  isFollowing: Scalars['Boolean']['output'];
  isOwner: Scalars['Boolean']['output'];
};

export type Query = {
  __typename: 'Query';
  activeAnchor: Maybe<AnchorType>;
  /** Get analytics charts for a time range. */
  adminAnalytics: AdminAnalyticsType;
  /** List anchors for a circle. */
  adminAnchors: AdminAnchorsPaginatedType;
  /** Get circle detail with cooldown info. */
  adminCircleDetail: AdminCirclePayload;
  /** List circle members. */
  adminCircleMembers: CircleMembersPaginatedType;
  /** List circles with search and filter. */
  adminCircles: AdminCirclesPaginatedType;
  /** List contact messages. */
  adminContacts: AdminContactsPaginatedType;
  /** Get dashboard overview metrics. */
  adminDashboard: AdminDashboardType;
  /** Get recent admin activities timeline. */
  adminRecentActivities: Array<ActivityType>;
  /** List reports with search and filter. */
  adminReports: AdminReportsPaginatedType;
  /** List users with search and filter. */
  adminUsers: AdminUsersPaginatedType;
  allCircles: Array<CircleType>;
  anchorByDate: Maybe<AnchorType>;
  anchorHistory: Array<AnchorType>;
  anchorResponses: Array<AnchorResponseType>;
  /** Filter hierarchical mapping structure list of volumes cleanly. */
  bibleBooks: Array<BibleBook>;
  /** Extract canonical list representing available supported free translations. */
  bibleVersions: Array<BibleVersion>;
  /** Get bookmark folders */
  bookmarkFolders: Array<BookmarkFolderType>;
  circle: Maybe<CircleType>;
  /** Get paginated replies for a specific comment (beyond the inline 3-reply preview). */
  commentReplies: CommentsResponse;
  /** Get all discovery categories securely formatted for algorithmic content filtering. */
  discoverCategories: Array<CategoryType>;
  /** Get the Discover feed by category */
  discoverFeed: FeedResponse;
  /** Get the public or personalized feed. Works with or without authentication. */
  feed: FeedResponse;
  /** Get hierarchical chronologically descending array of all User Nodes following a Profile. */
  followers: FollowListResponse;
  /** Get hierarchical descending list of all User Nodes a particular Profile is following. */
  following: FollowListResponse;
  /** Retrieve the strict chronological Following feed. */
  followingFeed: FeedResponse;
  /** Get the personalized For You content feed reliably. */
  forYouFeed: FeedResponse;
  /** Get friends list for sharing */
  friendsList: Array<FriendType>;
  /** Simple health check for the GraphQL endpoint. */
  health: Scalars['String']['output'];
  /** Get paginated list of hidden posts */
  hiddenPosts: HiddenPostsResponse;
  /** Get paginated list of posts the targeted user has liked. */
  likedPosts: ProfilePostResponseListDto;
  /** Extract paginated array list of raw Admin reports queued. */
  listReports: ReportListResponse;
  /** Get the currently authenticated user's complete data */
  me: CurrentUserResponse;
  myCircles: Array<CircleType>;
  notificationPreferences: NotificationPreferencesType;
  notifications: NotificationConnection;
  /** Retrieve a single post by its UUID with full engagement metrics and viewer context. */
  post: Maybe<Post>;
  /** Get hierarchical chronological array of comments bounded to an entity. */
  postComments: CommentsResponse;
  responseReplies: Array<AnchorResponseType>;
  /** Get saved/bookmarked posts */
  savedPosts: SavedPostsResponse;
  /** Fetch all verses in a chapter. Returns a ScriptureResponse with book, chapter, version, and every verse in the chapter. */
  scripture: ScriptureResponse;
  /** Fetch verses in a range and return combined text as a single string. No verse numbers included — just the concatenated text. */
  scriptureRange: Scalars['String']['output'];
  /** Generate 4 available username suggestions based on email and optional date of birth. Returns unique, available usernames. */
  suggestUsernames: Array<Scalars['String']['output']>;
  suggestedCircles: Array<CircleType>;
  /** Get highly validated creators algorithmically dynamically curated for the authenticating user. */
  suggestedCreators: Array<SuggestedCreatorType>;
  unreadNotificationCount: Scalars['Int']['output'];
  /** Get paginated list of posts authored by the targeted user. */
  userPosts: ProfilePostResponseListDto;
  /** Retrieve a targeted user's public profile and follower statistics. */
  userProfile: Maybe<UserProfileType>;
};


export type QueryActiveAnchorArgs = {
  circleId: Scalars['String']['input'];
};


export type QueryAdminAnalyticsArgs = {
  timeRange?: Scalars['String']['input'];
};


export type QueryAdminAnchorsArgs = {
  circleId: Scalars['String']['input'];
  page?: Scalars['Int']['input'];
  pageSize?: Scalars['Int']['input'];
  status?: Scalars['String']['input'];
};


export type QueryAdminCircleDetailArgs = {
  circleId: Scalars['String']['input'];
};


export type QueryAdminCircleMembersArgs = {
  circleId: Scalars['String']['input'];
  page?: Scalars['Int']['input'];
  pageSize?: Scalars['Int']['input'];
};


export type QueryAdminCirclesArgs = {
  page?: Scalars['Int']['input'];
  pageSize?: Scalars['Int']['input'];
  search?: Scalars['String']['input'];
  status?: Scalars['String']['input'];
};


export type QueryAdminContactsArgs = {
  page?: Scalars['Int']['input'];
  pageSize?: Scalars['Int']['input'];
  search?: Scalars['String']['input'];
  status?: Scalars['String']['input'];
};


export type QueryAdminRecentActivitiesArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryAdminReportsArgs = {
  page?: Scalars['Int']['input'];
  pageSize?: Scalars['Int']['input'];
  search?: Scalars['String']['input'];
  status?: Scalars['String']['input'];
};


export type QueryAdminUsersArgs = {
  page?: Scalars['Int']['input'];
  pageSize?: Scalars['Int']['input'];
  search?: Scalars['String']['input'];
  status?: Scalars['String']['input'];
};


export type QueryAllCirclesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
};


export type QueryAnchorByDateArgs = {
  circleId: Scalars['String']['input'];
  date: Scalars['String']['input'];
};


export type QueryAnchorHistoryArgs = {
  circleId: Scalars['String']['input'];
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
};


export type QueryAnchorResponsesArgs = {
  anchorId: Scalars['String']['input'];
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
  myPostsOnly?: Scalars['Boolean']['input'];
  sort?: Scalars['String']['input'];
};


export type QueryBibleBooksArgs = {
  testament?: Scalars['String']['input'];
};


export type QueryBibleVersionsArgs = {
  language?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCircleArgs = {
  id: Scalars['String']['input'];
};


export type QueryCommentRepliesArgs = {
  commentId: Scalars['String']['input'];
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
};


export type QueryDiscoverFeedArgs = {
  category?: InputMaybe<Scalars['String']['input']>;
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
  mediaType?: InputMaybe<Scalars['String']['input']>;
};


export type QueryFeedArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
};


export type QueryFollowersArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
  userId: Scalars['String']['input'];
};


export type QueryFollowingArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
  userId: Scalars['String']['input'];
};


export type QueryFollowingFeedArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
};


export type QueryForYouFeedArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
};


export type QueryFriendsListArgs = {
  limit?: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryHiddenPostsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
};


export type QueryLikedPostsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
  userId: Scalars['String']['input'];
};


export type QueryListReportsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
  status?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMyCirclesArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryNotificationsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
};


export type QueryPostArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPostCommentsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
  postId: Scalars['String']['input'];
};


export type QueryResponseRepliesArgs = {
  limit?: Scalars['Int']['input'];
  responseId: Scalars['String']['input'];
};


export type QuerySavedPostsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  folderId?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
  mediaType?: Scalars['String']['input'];
};


export type QueryScriptureArgs = {
  book: Scalars['String']['input'];
  chapter: Scalars['Int']['input'];
  translation?: Scalars['String']['input'];
};


export type QueryScriptureRangeArgs = {
  book: Scalars['String']['input'];
  chapter: Scalars['Int']['input'];
  translation?: Scalars['String']['input'];
  verseEnd?: InputMaybe<Scalars['Int']['input']>;
  verseStart?: Scalars['Int']['input'];
};


export type QuerySuggestUsernamesArgs = {
  dob?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
};


export type QuerySuggestedCirclesArgs = {
  limit?: Scalars['Int']['input'];
};


export type QuerySuggestedCreatorsArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryUserPostsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
  userId: Scalars['String']['input'];
};


export type QueryUserProfileArgs = {
  userId: Scalars['String']['input'];
};

export type ReactionPayload = {
  __typename: 'ReactionPayload';
  error: Maybe<ErrorType>;
  reaction: Maybe<AnchorResponseReactionType>;
  success: Scalars['Boolean']['output'];
};

export type ReportListResponse = {
  __typename: 'ReportListResponse';
  /** Volume bounds checker boolean */
  hasMore: Scalars['Boolean']['output'];
  /** Hash mapped string continuation flag */
  nextCursor: Maybe<Scalars['String']['output']>;
  /** Directly mapped queue items natively */
  reports: Array<ReportType>;
};

export type ReportPayload = {
  __typename: 'ReportPayload';
  /** Explicit error info */
  error: Maybe<ErrorType>;
  /** Detailed failure string identifier */
  errorCode: Maybe<Scalars['String']['output']>;
  /** String output detail natively */
  message: Maybe<Scalars['String']['output']>;
  /** Mapped explicit target UUID */
  report: Maybe<ReportType>;
  /** Confirmed processing natively flag */
  success: Scalars['Boolean']['output'];
};

export type ReportSummaryType = {
  __typename: 'ReportSummaryType';
  actioned: Scalars['Int']['output'];
  dismissed: Scalars['Int']['output'];
  pending: Scalars['Int']['output'];
  reviewed: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type ReportType = {
  __typename: 'ReportType';
  commentId: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  description: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  postId: Maybe<Scalars['String']['output']>;
  reason: Scalars['String']['output'];
  reporterId: Scalars['String']['output'];
  reviewedAt: Maybe<Scalars['String']['output']>;
  reviewedBy: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
};

export type ReporterType = {
  __typename: 'ReporterType';
  avatarUrl: Scalars['String']['output'];
  id: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export type SavePayload = {
  __typename: 'SavePayload';
  error: Maybe<ErrorType>;
  errorCode: Maybe<Scalars['String']['output']>;
  folder: Maybe<BookmarkFolderType>;
  message: Maybe<Scalars['String']['output']>;
  post: Maybe<FeedPost>;
  saved: Scalars['Boolean']['output'];
  stats: Maybe<PostStats>;
  success: Scalars['Boolean']['output'];
};

export type SavedPostsResponse = {
  __typename: 'SavedPostsResponse';
  hasMore: Scalars['Boolean']['output'];
  nextCursor: Maybe<Scalars['String']['output']>;
  posts: Array<FeedPost>;
};

export type ScriptureReference = {
  __typename: 'ScriptureReference';
  book: Scalars['String']['output'];
  chapter: Maybe<Scalars['Int']['output']>;
  text: Scalars['String']['output'];
  translation: Scalars['String']['output'];
  verseEnd: Maybe<Scalars['Int']['output']>;
  verseStart: Maybe<Scalars['Int']['output']>;
};

export type ScriptureResponse = {
  __typename: 'ScriptureResponse';
  /** Book name ('John') */
  book: Scalars['String']['output'];
  /** Chapter number */
  chapter: Scalars['Int']['output'];
  /** Translation version ('kjv') */
  translation: Scalars['String']['output'];
  /** Ending verse boundary */
  verseEnd: Maybe<Scalars['Int']['output']>;
  /** Starting verse boundary */
  verseStart: Maybe<Scalars['Int']['output']>;
  /** All verses in the chapter */
  verses: Array<ScriptureVerse>;
};

export type ScriptureVerse = {
  __typename: 'ScriptureVerse';
  number: Scalars['Int']['output'];
  text: Scalars['String']['output'];
};

export type SetInterestsPayload = {
  __typename: 'SetInterestsPayload';
  error: Maybe<ErrorType>;
  errorCode: Maybe<Scalars['String']['output']>;
  interests: Array<Scalars['String']['output']>;
  message: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type SharePayload = {
  __typename: 'SharePayload';
  error: Maybe<ErrorType>;
  errorCode: Maybe<Scalars['String']['output']>;
  message: Maybe<Scalars['String']['output']>;
  shareId: Maybe<Scalars['String']['output']>;
  shareUrl: Maybe<Scalars['String']['output']>;
  stats: Maybe<PostStats>;
  success: Scalars['Boolean']['output'];
};

export type StatisticsType = {
  __typename: 'StatisticsType';
  avgResolutionMinutes: Scalars['Float']['output'];
  dau: Scalars['Int']['output'];
  mau: Scalars['Int']['output'];
  wau: Scalars['Int']['output'];
};

export type SubmitContactPayload = {
  __typename: 'SubmitContactPayload';
  contactId: Maybe<Scalars['String']['output']>;
  error: Maybe<ErrorType>;
  message: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type SuccessResponse = {
  __typename: 'SuccessResponse';
  error: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type SuggestedCreatorType = {
  __typename: 'SuggestedCreatorType';
  avatarUrl: Maybe<Scalars['String']['output']>;
  bio: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  stats: Maybe<ProfileStatsType>;
  username: Scalars['String']['output'];
};

export type UpdateUsernamePayload = {
  __typename: 'UpdateUsernamePayload';
  error: Maybe<ErrorType>;
  errorCode: Maybe<Scalars['String']['output']>;
  message: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
  username: Maybe<Scalars['String']['output']>;
};

export type UserProfileType = {
  __typename: 'UserProfileType';
  avatarUrl: Maybe<Scalars['String']['output']>;
  bio: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  hideLikeCount: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  location: Scalars['String']['output'];
  recentPosts: Array<FeedPost>;
  stats: ProfileStatsType;
  username: Scalars['String']['output'];
  viewerState: Maybe<ProfileViewerState>;
};

export type UserSuggestion = {
  __typename: 'UserSuggestion';
  avatarUrl: Maybe<Scalars['String']['output']>;
  bio: Maybe<Scalars['String']['output']>;
  followersCount: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export type UserSummaryType = {
  __typename: 'UserSummaryType';
  active: Scalars['Int']['output'];
  suspended: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  warned: Scalars['Int']['output'];
};

export type UserType = {
  __typename: 'UserType';
  avatarUrl: Scalars['String']['output'];
  bio: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isEmailVerified: Scalars['Boolean']['output'];
  location: Scalars['String']['output'];
  role: Scalars['String']['output'];
  username: Maybe<Scalars['String']['output']>;
};

export type UsernameCheckResult = {
  __typename: 'UsernameCheckResult';
  available: Scalars['Boolean']['output'];
  reason: Maybe<Scalars['String']['output']>;
  suggestions: Maybe<Array<Scalars['String']['output']>>;
};

export type VerifyOtpPayload = {
  __typename: 'VerifyOTPPayload';
  /** JWT access token (if applicable) */
  accessToken: Maybe<Scalars['String']['output']>;
  error: Maybe<ErrorType>;
  /** Specific error code if operation failed */
  errorCode: Maybe<Scalars['String']['output']>;
  /** Success or error message */
  message: Maybe<Scalars['String']['output']>;
  /** JWT refresh token (if applicable) */
  refreshToken: Maybe<Scalars['String']['output']>;
  /** Token to use for confirming password reset */
  resetToken: Maybe<Scalars['String']['output']>;
  /** Whether the verification was successful */
  success: Scalars['Boolean']['output'];
  /** User data (if applicable) */
  user: Maybe<UserType>;
};

export type VideoData = {
  __typename: 'VideoData';
  duration: Maybe<Scalars['Int']['output']>;
  height: Maybe<Scalars['Int']['output']>;
  thumbnailUrl: Maybe<Scalars['String']['output']>;
  url: Scalars['String']['output'];
  width: Maybe<Scalars['Int']['output']>;
};
