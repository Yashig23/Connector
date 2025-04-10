export interface Media {
    media_id: string;
    media_type: MediaType;
    caption: string;
    media_url: File | string | File[];
    likes_count: number;
    likes_data? : string[];
    comments_count: number;
    views_count?: number; // Optional, as some media may not have views
    created_at: Date;
    tempmedia_url?: string;  

      // New properties for like functionality
  isLiked?: boolean;
  floatingHearts?: number[];
  showComments? : boolean;
  comments? : Comments[];
  mentions? : UserBasicInfo[];
  owner_id: string;
  owner_name: string;
  owner_profilePic?: string;
  }

  export enum MediaType {
    IMAGE = "image",
    VIDEO = "video",
    CAROUSEL = "carousel",
}


  export interface Comments {
    comment_id: string; 
    media_id: string; // Unique ID for each comment
    user_id: string;     // ID of the user who commented
    username: string;    // Name of the user
    profile_pic: string; // Profile picture URL
    text: string;        // The actual comment text
    created_at: Date;    // Timestamp of the comment
    likes_count: number; // Like count for the comment
    replies?: Comments[]; // Nested replies (same structure)
  }

  export interface UserBasicInfo{
    userId: string,
    userProfilePic: string,
    username: string;
  }

  export interface UserStory {
    instagram_id?: string;  // Optional field
    username?: string;  // Optional field
    current_story?: string;  // Optional field
    created_at?: Date;  // Story ka creation time
    expires_at?: Date;  // Expiry time (24 hours after creation)
  }
  
  
  
  export interface Engagement {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  }
  
  export interface Reach {
    impressions: number;
    unique_views: number;
  }
  
  export interface AudienceDemographics {
    age_range: { [key: string]: number }; // Example: { "18-24": 40, "25-34": 35 }
    gender: { male: number; female: number };
    top_countries: string[];
  }
  
  export interface Analytics {
    engagement: Engagement;
    reach: Reach;
    audience_demographics: AudienceDemographics;
  }
  
  export interface InstagramProfile {
    instagram_id: string;
    username: string;
    gmail: string;
    full_name: string;
    bio?: string;
    profile_picture_url?: string;
    website?: string;
    is_verified: boolean;
    is_private: boolean;
    account_type: AccountType;
    followers_count: number;
    user_status?: UserStory;
    community: followers[];
    collections? : Collection[];
    following_count: number;
    follow_status?: AccountStatus;
    chatting_people? : {username: string, userId: string}[];
    posts_count: number;
    created_at: Date;
    updated_at: Date;
    account_type2 : AccountType2;
    followers_data: followers[];
    following_data: followers[];
    media: Media[];
    analytics?: Analytics;
  }

  export interface User {
    id: string;
    username: string;
    name: string;
    location?: string | null;
    profile_image: string;
    followers? : string;
  }
  
  export interface Collection {
    instagram_id?: string;
    title?: string;
    description?: string;
    media: string[];
    created_at?: Date;
    updated_at?: Date;
    user?: User;
  }

  export interface followers{
    username: string,
    userId: string,
    profilePic?: string,
    follow_status?: AccountStatus,
    user_status?: string,
    account_type2?: AccountType2
  } 

  export interface NotificationResponse {
    notifications: Notification[];
    success: boolean;
  }

  export interface receiveSendMessages {
    message : string,
    data: followers[]
  }

  export interface Notification {
    senderId: string;
    receiverId: string;
    type: 'like' | 'comment' | 'follow' | 'mention'; // Restricting possible values
    message: string;
    profile_pic: string;
    isRead: boolean;
    createdAt: string; // ISO string format
  }
  

  export enum FileType {
    Text = 'text',
    Image = 'image',
    Video = 'video',
    File = 'file',
    Audio = 'audio'
  }
  
  export interface FileData {
    senderId: string;
    fileName: string;
    fileType: FileType;
    fileContent: string | ArrayBuffer | null; // Base64 string or ArrayBuffer
  }
  

  export interface Message {
    _id?: string;
    chatId?: string;
    senderId: string;
    receiverId?: string;
    messageType: FileType;
    content: string;
    timestamp?: Date;
    isRead?: boolean;  // ✅ Optional modifier added
    reactions?: { userId: string; emoji: string }[];
    deletedFor?: string[];
    replyTo?: string;
    files?: FileData[];
  }  

  export enum MessageType {
    Text = 'text',
    Image = 'image',
    Video = 'video',
    File = 'file',
    Audio = 'audio'
  }
  
  export enum AccountType {
    PERSONAL = 'personal',
    BUSINESS = 'business',
    CREATOR = 'creator',
    COMMUNITY = 'community'
  }

  export enum AccountType2{
    PUBLIC = 'public',
    PRIVATE = 'private'
  }

  export interface FollowRequestInterface{
    requesterInstagramId: string,
    targetInstagramId: string
  }
  
  export enum AccountStatus{
    Following = 'following',
    Requested = 'requested',
    Follow = 'follow',
    FollowBack = 'followback',
    Accept = 'accept'
  }
  

  export interface InstagramProfile {
    instagram_id: string;
    username: string;
    gmail: string;
    full_name: string;
    bio?: string;
    profile_picture_url?: string;
    website?: string;
    is_verified: boolean;
    is_private: boolean;
    account_type: AccountType;
    followers_count: number;
    community: followers[];
    collections?: Collection[];
    following_count: number;
    posts_count: number;
    created_at: Date;
    updated_at: Date;
    account_type2: AccountType2;
    followers_data: followers[];
    following_data: followers[];
    media: Media[];
    analytics?: Analytics;
  }
  
  // Fake Instagram Profiles
  export const MOCK_INSTAGRAM_PROFILES: InstagramProfile[] = [
    {
      instagram_id: "001",
      username: "alex_travels",
      gmail: "alex@gmail.com",
      full_name: "Alex Johnson",
      bio: "Exploring the world, one city at a time 🌍✈️",
      profile_picture_url: "https://example.com/alex.jpg",
      website: "https://alextravels.com",
      is_verified: true,
      is_private: false,
      account_type: AccountType.CREATOR,
      followers_count: 10500,
      community: [],
      collections: [],
      following_count: 500,
      follow_status: AccountStatus.Following,
      posts_count: 245,
      created_at: new Date("2020-01-10"),
      updated_at: new Date(),
      account_type2: AccountType2.PUBLIC,
      followers_data: [],
      following_data: [],
      media: [
        
      ],
    },
    {
      instagram_id: "002",
      username: "fashion_queen",
      gmail: "fashionqueen@gmail.com",
      full_name: "Sophie Carter",
      bio: "Fashion is my passion 👗✨ | DM for collaborations",
      profile_picture_url: "https://example.com/sophie.jpg",
      website: "https://sophiecouture.com",
      is_verified: true,
      is_private: false,
      account_type: AccountType.BUSINESS,
      followers_count: 75000,
      community: [],
      collections: [],
      following_count: 2000,
      follow_status: AccountStatus.Follow,
      posts_count: 890,
      created_at: new Date("2018-05-20"),
      updated_at: new Date(),
      account_type2: AccountType2.PUBLIC,
      followers_data: [],
      following_data: [],
      media: [
        // { id: "m2", type: "video", url: "https://example.com/fashion-show.mp4", caption: "Latest runway trends! 🔥", created_at: new Date() }
      ],
      // analytics: { impressions: 500000, reach: 250000, engagement: 75000 }
    },
    {
      instagram_id: "003",
      username: "chef_mike",
      gmail: "chefmike@gmail.com",
      full_name: "Michael Smith",
      bio: "Bringing gourmet food to your kitchen 🍽️ | Chef & Recipe Creator",
      profile_picture_url: "https://example.com/mike.jpg",
      website: "https://mikesrecipes.com",
      is_verified: false,
      is_private: false,
      account_type: AccountType.PERSONAL,
      followers_count: 3500,
      community: [],
      collections: [],
      following_count: 200,
      follow_status: AccountStatus.Following,
      posts_count: 145,
      created_at: new Date("2021-07-15"),
      updated_at: new Date(),
      account_type2: AccountType2.PUBLIC,
      followers_data: [],
      following_data: [],
      media: [
        // { id: "m3", type: "image", url: "https://example.com/food1.jpg", caption: "Homemade pasta night! 🍝", created_at: new Date() }
      ],
     
    },
    {
      instagram_id: "004",
      username: "tech_guru",
      gmail: "techguru@gmail.com",
      full_name: "David Brown",
      bio: "Tech reviews, gadgets, and AI news 📱💻 | YT: TechGuru",
      profile_picture_url: "https://example.com/david.jpg",
      website: "https://techguru.com",
      is_verified: true,
      is_private: false,
      account_type: AccountType.CREATOR,
      followers_count: 120000,
      community: [],
      collections: [],
      following_count: 1000,
      follow_status: AccountStatus.Following,
      posts_count: 600,
      created_at: new Date("2017-03-08"),
      updated_at: new Date(),
      account_type2: AccountType2.PRIVATE,
      followers_data: [],
      following_data: [],
      media: [
        // { id: "m4", type: "video", url: "https://example.com/review.mp4", caption: "Latest iPhone review 📱", created_at: new Date() }
      ],
      // analytics: { impressions: 700000, reach: 400000, engagement: 120000 }
    },
    {
      instagram_id: "005",
      username: "fitness_freak",
      gmail: "fitnessfreak@gmail.com",
      full_name: "Sarah White",
      bio: "Daily workouts & meal plans 🏋️‍♂️💪 | Fit is the new rich",
      profile_picture_url: "https://example.com/sarah.jpg",
      website: "https://sarahfitness.com",
      is_verified: false,
      is_private: false,
      account_type: AccountType.PERSONAL,
      followers_count: 52000,
      community: [],
      collections: [],
      following_count: 2500,
      follow_status: AccountStatus.Following,
      posts_count: 480,
      created_at: new Date("2019-09-12"),
      updated_at: new Date(),
      account_type2: AccountType2.PRIVATE,
      followers_data: [],
      following_data: [],
      media: [
        // { id: "m5", type: "image", url: "https://example.com/workout.jpg", caption: "Morning cardio session done! 🏃‍♀️🔥", created_at: new Date() }
      ],
      // analytics: { impressions: 320000, reach: 150000, engagement: 45000 }
    }
  ];