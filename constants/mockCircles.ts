export type Circle = {
  id: string;
  title: string;
  description: string;
  image: string;
  members: number;
  avatars?: string[];
};

export type AnchorType = "text" | "image" | "video" | "image_text";

export type CirclePost = {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  createdAt: string;
  text?: string;
  image?: string;
  likes: number;
  comments: number;
  likedImage?: number;
  likeCount?: number;
  anchorLikedCount?: number;
  savedCount?: number;
  sharedCount?: number;
};

export type BibleAnchor = {
  verseText: string;
  reference: string;
};

export type ActiveAnchor = {
  id: string;
  type: AnchorType;
  title: string;
  content?: string;
  scripture?: string;
  author?: string;
  likedImage?: number;
  anchorLikedCount?: number;
  anchorVerse?: string;
  anchorText?: string;
  backgroundColors?: [string, string];
  backgroundImage?: string;
  anchorImage?: string;
  anchorVideo?: string;
  anchorImageText?: string;
  anchorThumbnail?: string;
  createdAt: string;
  expiresAt?: string;
};

export type CircleFeedData = {
  bannerImage: string;
  profileImage: string;
  name: string;
  description: string;
  memberCount: number;
  isJoined: boolean;
  activeAnchor?: ActiveAnchor;
  pastAnchors?: ActiveAnchor[];
  posts: CirclePost[];
  memberAvatars?: string[];
};

// All available circles
export const MOCK_CIRCLES: Circle[] = [
  {
    id: "1",
    title: "Faith, Work & Purpose",
    description:
      "A community where Christians discuss career, business, finding purpose in work while honoring God.",
    image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d",
    members: 1247,
    avatars: [
      "https://i.pravatar.cc/150?img=1",
      "https://i.pravatar.cc/150?img=2",
      "https://i.pravatar.cc/150?img=3",
    ],
  },
  {
    id: "2",
    title: "Prayer & Intercession",
    description: "Believers come together to pray for one another and share prayer requests.",
    image: "https://images.unsplash.com/photo-1519491050282-cf00c82424b4",
    members: 892,
    avatars: [
      "https://i.pravatar.cc/150?img=10",
      "https://i.pravatar.cc/150?img=11",
      "https://i.pravatar.cc/150?img=12",
    ],
  },
  {
    id: "3",
    title: "Youth Fellowship",
    description: "Young believers gathering to grow together in faith and build lasting friendships.",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac",
    members: 456,
    avatars: [],
  },
  {
    id: "4",
    title: "Bible Study Group",
    description: "Daily Bible reading and discussion for spiritual growth and deeper understanding of Scripture.",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc",
    members: 2341,
    avatars: ["https://i.pravatar.cc/150?img=20", "https://i.pravatar.cc/150?img=21"],
  },
  {
    id: "5",
    title: "Worship & Praise",
    description: "Singing worship songs and sharing fellowship through music.",
    image: "https://images.unsplash.com/photo-1476681248696-466c012a3f1f",
    members: 678,
    avatars: [
      "https://i.pravatar.cc/150?img=31",
      "https://i.pravatar.cc/150?img=32",
      "https://i.pravatar.cc/150?img=33",
    ],
  },
  {
    id: "6",
    title: "Marriage & Family",
    description: "Building strong families through faith and fellowship.",
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18",
    members: 523,
    avatars: [
      "https://i.pravatar.cc/150?img=36",
      "https://i.pravatar.cc/150?img=37",
    ],
  },
  {
    id: "7",
    title: "Evangelism & Missions",
    description: "Sharing the gospel and supporting mission work around the world.",
    image: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3",
    members: 342,
    avatars: [
      "https://i.pravatar.cc/150?img=41",
      "https://i.pravatar.cc/150?img=42",
    ],
  },
];

// Circle feeds keyed by circle ID
export const MOCK_CIRCLE_FEEDS: Record<string, CircleFeedData> = {
  "1": {
    bannerImage: "https://images.unsplash.com/photo-1509099836639-18ba1795216d",
    profileImage: "https://images.unsplash.com/photo-1519491050282-cf00c82424b4",
    name: "Faith, Work & Purpose",
    description:
      "A community where Christians discuss career, business, finding purpose in work while honoring God.",
    memberCount: 1247,
    isJoined: false,
    memberAvatars: [
      "https://i.pravatar.cc/150?img=1",
      "https://i.pravatar.cc/150?img=2",
      "https://i.pravatar.cc/150?img=3",
      "https://i.pravatar.cc/150?img=4",
      "https://i.pravatar.cc/150?img=5",
      "https://i.pravatar.cc/150?img=6",
      "https://i.pravatar.cc/150?img=7",
      "https://i.pravatar.cc/150?img=8",
    ],
    activeAnchor: {
      id: "anchor-1",
      type: "text",
      title: "Reflection of the Week",
      content: "Work as unto the Lord",
      likedImage: 1,
      anchorLikedCount: 234,
      anchorVerse: "Colossians 3:23",
      anchorText: "Lord, help me to see my work as an act of worship unto you. When I feel discouraged or overwhelmed, remind me that you are with me. Give me patience with colleagues and joy in serving. May my labor be a testimony of your love in the workplace.",
      backgroundImage: "https://images.unsplash.com/photo-1509099836639-18ba1795216d",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    pastAnchors: [
      {
        id: "anchor-1-past",
        type: "text",
        title: "Yesterday's Prayer",
        content: "Prayer for wisdom",
        likedImage: 1,
        anchorLikedCount: 156,
        backgroundColors: ["#A8D5A2", "#EDEDED"],
        anchorVerse: "Trust in the Lord with all your heart - Proverbs 3:5",
        anchorText: "Father, grant me wisdom for today.",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "anchor-1-2days",
        type: "image",
        title: "2 Days Ago",
        content: "Image anchor",
        likedImage: 1,
        anchorLikedCount: 89,
        anchorImage: "https://images.unsplash.com/photo-1519491050282-cf00c82424b4",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "anchor-1-3days",
        type: "video",
        title: "3 Days Ago",
        content: "Video anchor",
        likedImage: 1,
        anchorLikedCount: 234,
        anchorVideo: "https://storage.googleapis.com/ziona-media-dev/uploads/9232f97e-a63f-42a5-a7fe-eec5d153c89b/videos/efda4aab-a7a6-4816-827b-8221161cbfd0.mp4",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "anchor-1-4days",
        type: "text",
        title: "4 Days Ago - Gradient",
        content: "A prayer for guidance and direction",
        likedImage: 1,
        anchorLikedCount: 312,
        backgroundColors: ["#4A90A4", "#1A4A5E"],
        anchorVerse: "Your word is a lamp to my feet - Psalm 119:105",
        anchorText: "Lord, shine your light on my path.",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "anchor-1-5days",
        type: "image_text",
        title: "5 Days Ago",
        content: "Image with text",
        likedImage: 1,
        anchorLikedCount: 178,
        anchorImage: "https://images.unsplash.com/photo-1476681248696-466c012a3f1f",
        anchorImageText: "Let everything that has breath praise the Lord - Psalm 150:6",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    posts: [
      {
        id: "1",
        user: { name: "Sarah Kim", avatar: "https://i.pravatar.cc/100?img=1" },
        createdAt: "2h ago",
        text: "God is so good! I just got a promotion at work! All glory to Him! 🙏",
        likes: 24,
        comments: 5,
        likedImage: 1,
        likeCount: 24,
        anchorLikedCount: 18,
      },
      {
        id: "2",
        user: { name: "Mike Ross", avatar: "https://i.pravatar.cc/100?img=2" },
        createdAt: "4h ago",
        text: "Anyone looking for a job prayer? I've been searching for 3 months now. Please keep me in your prayers.",
        image: "https://images.unsplash.com/photo-1519491050282-cf00c82424b4",
        likes: 18,
        comments: 12,
        likedImage: 1,
        likeCount: 18,
        anchorLikedCount: 12,
      },
      {
        id: "3",
        user: { name: "Grace Lee", avatar: "https://i.pravatar.cc/100?img=3" },
        createdAt: "6h ago",
        text: "Today's devotional: 'Whatever you do, work at it with your whole being as for the Lord...' Colossians 3:23",
        likes: 45,
        comments: 8,
        likedImage: 1,
        likeCount: 45,
        anchorLikedCount: 32,
      },
      {
        id: "4",
        user: { name: "James Chen", avatar: "https://i.pravatar.cc/100?img=4" },
        createdAt: "Yesterday",
        text: "Thank you all for the prayers! I got the job! God is faithful!",
        image: "https://images.unsplash.com/photo-1519389950473-63b5a5b7f5e3",
        likes: 67,
        comments: 23,
        likedImage: 1,
        likeCount: 67,
        anchorLikedCount: 54,
      },
    ],
  },
  "2": {
    bannerImage: "https://images.unsplash.com/photo-1519491050282-cf00c82424b4",
    profileImage: "https://i.pravatar.cc/150?img=9",
    name: "Prayer & Intercession",
    description: "Believers come together to pray for one another and share prayer requests.",
    memberCount: 892,
    isJoined: true,
    memberAvatars: [
      "https://i.pravatar.cc/150?img=10",
      "https://i.pravatar.cc/150?img=11",
      "https://i.pravatar.cc/150?img=12",
      "https://i.pravatar.cc/150?img=13",
      "https://i.pravatar.cc/150?img=14",
    ],
    activeAnchor: {
      id: "anchor-2",
      type: "text",
      title: "Today's Prayer Focus",
      content: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
      likedImage: 1,
      anchorLikedCount: 156,
      anchorVerse: "Proverbs 3:5-6",
      anchorText: "Heavenly Father, we come before you today with hearts full of trust. Help us to lean not on our own understanding but to submit all our ways to you. Direct our paths and make them straight according to your will. We pray for wisdom in every decision we face today. In Jesus name, Amen.",
      backgroundColors: ["#A8D5A2", "#EDEDED"],
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    posts: [
      {
        id: "5",
        user: { name: "Rebecca Stone", avatar: "https://i.pravatar.cc/100?img=9" },
        createdAt: "1h ago",
        text: "Praying for my sick grandmother. God is our healer!",
        image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d",
        likes: 12,
        comments: 3,
      },
      {
        id: "6",
        user: { name: "David Wilson", avatar: "https://i.pravatar.cc/100?img=10" },
        createdAt: "3h ago",
        text: "Our prayer meeting this Sunday was amazing. God's presence was so strong!",
        likes: 28,
        comments: 7,
      },
    ],
  },
  "3": {
    bannerImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac",
    profileImage: "https://i.pravatar.cc/150?img=15",
    name: "Youth Fellowship",
    description: "Young believers gathering to grow together in faith and build lasting friendships.",
    memberCount: 456,
    isJoined: false,
    memberAvatars: [
      "https://i.pravatar.cc/150?img=16",
      "https://i.pravatar.cc/150?img=17",
      "https://i.pravatar.cc/150?img=18",
    ],
    activeAnchor: {
      id: "anchor-3",
      type: "text",
      title: "Youth Camp Theme",
      content: "Rooted in Love",
      likedImage: 1,
      anchorLikedCount: 89,
      anchorVerse: "Ephesians 3:17-19",
      anchorText: "Father, root us deeply in your love so that we may understand the width, length, height, and depth of your love. May our youth group be a place where everyone feels welcomed and valued. Help us to grow together in faith.",
      backgroundColors: ["#E8F4FD", "#FFF5E6"],
      createdAt: new Date().toISOString(),
    },
    posts: [
      {
        id: "7",
        user: { name: "Emma Davis", avatar: "https://i.pravatar.cc/100?img=12" },
        createdAt: "5h ago",
        text: "Youth camp was life-changing! Can't wait for next year! 🔥",
        likes: 56,
        comments: 15,
      },
    ],
  },
  "4": {
    bannerImage: "https://images.unsplash.com/photo-1546519638-68e109498ffc",
    profileImage: "https://i.pravatar.cc/150?img=19",
    name: "Bible Study Group",
    description: "Daily Bible reading and discussion for spiritual growth and deeper understanding of Scripture.",
    memberCount: 2341,
    isJoined: true,
    memberAvatars: [
      "https://i.pravatar.cc/150?img=20",
      "https://i.pravatar.cc/150?img=21",
      "https://i.pravatar.cc/150?img=22",
      "https://i.pravatar.cc/150?img=23",
      "https://i.pravatar.cc/150?img=24",
      "https://i.pravatar.cc/150?img=25",
    ],
    activeAnchor: {
      id: "anchor-4",
      type: "text",
      title: "This Week's Study",
      content: " Romans 8:28 - 'And we know that all things work together for good to those who love God.'",
      scripture: "Romans 8:28",
      likedImage: 1,
      anchorLikedCount: 412,
      backgroundColors: ["#F5E6D3", "#FFF8F0"],
      anchorVerse: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose. - Romans 8:28",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    posts: [
      {
        id: "8",
        user: { name: "Pastor Michael", avatar: "https://i.pravatar.cc/100?img=14" },
        createdAt: "Yesterday",
        text: "Great discussion on Romans 8 yesterday! The promise that all things work together for good gives me so much hope.",
        likes: 34,
        comments: 9,
      },
    ],
  },
  "5": {
    bannerImage: "https://images.unsplash.com/photo-1476681248696-466c012a3f1f",
    profileImage: "https://i.pravatar.cc/150?img=30",
    name: "Worship & Praise",
    description: "Singing worship songs and sharing fellowship through music.",
    memberCount: 678,
    isJoined: false,
    memberAvatars: [
      "https://i.pravatar.cc/150?img=31",
      "https://i.pravatar.cc/150?img=32",
      "https://i.pravatar.cc/150?img=33",
    ],
    activeAnchor: {
      id: "anchor-5",
      type: "image_text",
      title: "Sunday Worship",
      likedImage: 1,
      anchorLikedCount: 178,
      anchorImage: "https://images.unsplash.com/photo-1476681248696-466c012a3f1f",
      anchorImageText: "Let the word of Christ dwell in you richly, teaching and admonishing one another in all wisdom, and singing psalms and hymns and spiritual songs, with gratitude in your hearts to God. - Colossians 3:16",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    posts: [
      {
        id: "9",
        user: { name: "Sarah Worship", avatar: "https://i.pravatar.cc/100?img=25" },
        createdAt: "Yesterday",
        text: "What an amazing worship session! God's presence was so tangible!",
        likes: 45,
        comments: 8,
      },
    ],
  },
  "6": {
    bannerImage: "https://images.unsplash.com/photo-1511632765486-a01980e01a18",
    profileImage: "https://i.pravatar.cc/150?img=35",
    name: "Marriage & Family",
    description: "Building strong families through faith and fellowship.",
    memberCount: 523,
    isJoined: true,
    memberAvatars: [
      "https://i.pravatar.cc/150?img=36",
      "https://i.pravatar.cc/150?img=37",
    ],
    activeAnchor: {
      id: "anchor-6",
      type: "image",
      title: "Family Devotion",
      likedImage: 1,
      anchorLikedCount: 234,
      anchorImage: "https://images.unsplash.com/photo-1511632765486-a01980e01a18",
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    posts: [
      {
        id: "10",
        user: { name: "John Family", avatar: "https://i.pravatar.cc/100?img=30" },
        createdAt: "2 days ago",
        text: "Family devotion time is the best part of our day!",
        likes: 32,
        comments: 6,
      },
    ],
  },
  "7": {
    bannerImage: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3",
    profileImage: "https://i.pravatar.cc/150?img=40",
    name: "Evangelism & Missions",
    description: "Sharing the gospel and supporting mission work around the world.",
    memberCount: 342,
    isJoined: false,
    memberAvatars: [
      "https://i.pravatar.cc/150?img=41",
      "https://i.pravatar.cc/150?img=42",
    ],
    activeAnchor: {
      id: "anchor-7",
      type: "video",
      title: "Mission Trip Recap",
      likedImage: 1,
      anchorLikedCount: 156,
      anchorVideo: "https://storage.googleapis.com/ziona-media-dev/uploads/9232f97e-a63f-42a5-a7fe-eec5d153c89b/videos/efda4aab-a7a6-4816-827b-8221161cbfd0.mp4",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    posts: [
      {
        id: "11",
        user: { name: "Mission Mark", avatar: "https://i.pravatar.cc/100?img=35" },
        createdAt: "5 days ago",
        text: "Our mission trip was incredible! God is doing amazing work!",
        likes: 67,
        comments: 12,
      },
    ],
  },
};

// Default fallback for any circle
export const DEFAULT_CIRCLE_FEED: CircleFeedData = {
  bannerImage: "https://images.unsplash.com/photo-1509099836639-18ba1795216d",
  profileImage: "https://i.pravatar.cc/100?img=1",
  name: "Circle Name",
  description: "Circle description",
  memberCount: 0,
  isJoined: false,
  activeAnchor: {
    id: "anchor-default",
    type: "text",
    title: "Today's Anchor",
    content: "Welcome to this circle!",
    createdAt: new Date().toISOString(),
  },
  posts: [],
};