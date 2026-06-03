export interface HelpArticle {
  title: string;
  content: string;
}

export interface HelpSection {
  icon: string;
  title: string;
  articles: HelpArticle[];
}

export const HELP_SECTIONS: HelpSection[] = [
  {
    icon: "lock-closed",
    title: "Account Management",
    articles: [
      {
        title: "How to create an account",
        content:
          "Download the Ziona app\nTap \u201cSign Up\u201d\nEnter your email\nEnter the 6-digit verification code\nChoose a username and password\nComplete your profile setup",
      },
      {
        title: "How to log in to my account",
        content:
          "Open the app\nEnter your email and password\nTap \u201cLog In\u201d\nIf login fails:\n  Check your details\n  Reset password if needed",
      },
      {
        title: "I forgot my password",
        content:
          "Tap \u201cForgot Password\u201d\nEnter your email\nEnter the 6-digit OTP\nCreate a new password\n\nCode expires in 10 minutes",
      },
      {
        title: "How to delete my account",
        content:
          "Go to Settings\nTap \u201cDelete Account\u201d\nConfirm action\n\nThis cannot be undone",
      },
    ],
  },
  {
    icon: "rocket",
    title: "Getting Started",
    articles: [
      {
        title: "What is Ziona?",
        content:
          "Ziona is a Christian social platform where you can:\n  Share faith-based content\n  Discover uplifting posts\n  Engage with a like-minded community",
      },
      {
        title: "First steps after joining",
        content:
          "Set up your profile\nFollow users\nExplore your feed\nCreate your first post",
      },
    ],
  },
  {
    icon: "create",
    title: "Content Creation & Posting",
    articles: [
      {
        title: "How to create a post",
        content:
          "Tap the \u201c+\u201d button\nChoose content type\nAdd caption\nSelect a Tag\nTap \u201cPost\u201d",
      },
      {
        title: "What can I post on Ziona?",
        content:
          "You can share:\n  Videos (60\u2013180 seconds)\n  Images or graphics\n  Carousel posts (up to 5 images)\n  Text posts\n  Bible posts\n\nAll content must follow community guidelines",
      },
      {
        title: "How to create a Bible post",
        content:
          "Tap \u201c+\u201d\nSelect \u201cShare a Bible verse\u201d\nAdd scripture or reference\nSelect a Tag\nPost",
      },
      {
        title: "Why is my post not uploading?",
        content:
          "Check internet connection\nEnsure content meets limits\nRetry upload\nRestart the app",
      },
      {
        title: "Post guidelines before publishing",
        content:
          "Keep content faith-aligned\nAvoid harmful or offensive content\nBe respectful and uplifting",
      },
    ],
  },
  {
    icon: "heart",
    title: "Feed, Following & Engagement",
    articles: [
      {
        title: "How the feed works",
        content:
          "Based on who you follow\nBased on engagement\nBased on relevance",
      },
      {
        title: "How to follow users",
        content: "Visit profile\nTap \u201cFollow\u201d",
      },
      {
        title: "How to like, comment, and save posts",
        content: "Like\nComment\nSave",
      },
      {
        title: "Why am I not seeing certain posts?",
        content:
          "Feed adapts to your activity\nEngage more with content you like",
      },
    ],
  },
  {
    icon: "people",
    title: "Circles & Communities",
    articles: [
      {
        title: "What are Circles?",
        content:
          "Circles are smaller communities where users can:\n  Connect around shared faith interests\n  Share more focused content\n  Engage in a closer community",
      },
      {
        title: "How to join a Circle",
        content:
          "Go to the Circles section\nBrowse available circles\nTap \u201cJoin\u201d",
      },
      {
        title: "How are Circles created?",
        content:
          "Currently, Circles are created by the Ziona team.\nIf you would like a new Circle:\n  Send a request via support chat\n  Or email support@ziona.app\n\nInclude:\n  Circle name\n  Description or purpose",
      },
      {
        title: "How to post in a Circle",
        content: "Open the Circle\nTap \u201cPost\u201d\nCreate and share your content",
      },
      {
        title: "What are Anchor posts?",
        content:
          "Anchor posts are important posts pinned or highlighted within a Circle to guide discussions or provide key information.\nCurrently, Anchor posts are managed by the Ziona team.",
      },
      {
        title: "How to request an Anchor post",
        content:
          "To request an Anchor post:\n  Send a message via support chat\n  Or email support@ziona.app\n\nInclude:\n  The content you want posted\n  The name of the Circle\n  Any additional context",
      },
      {
        title: "Who can see my Circle posts?",
        content: "Visible to everyone in the Circle.",
      },
      {
        title: "How to leave a Circle",
        content: "Open the Circle\nTap settings\nSelect \u201cLeave Circle\u201d",
      },
    ],
  },
  {
    icon: "shield",
    title: "Safety & Community Guidelines",
    articles: [
      {
        title: "Community guidelines overview",
        content:
          "Ziona promotes:\n  Respectful conversations\n  Faith-based content\n  Positive engagement",
      },
      {
        title: "What content is not allowed?",
        content: "Hate speech\nHarassment\nExplicit or harmful content\nMisleading religious content",
      },
      {
        title: "What content is encouraged?",
        content:
          "Faith-based messages\nScripture sharing\nEncouragement\nRespectful discussions\n\n\u201cLet your conversation be always full of grace\u2026\u201d",
      },
    ],
  },
  {
    icon: "flag",
    title: "Reporting & Moderation",
    articles: [
      {
        title: "How to report a post",
        content:
          "Tap \u201c...\u201d on the post\nSelect \u201cReport\u201d\nChoose reason\nSubmit",
      },
      {
        title: "What happens after I report content?",
        content: "Moderators review the report\nAction is taken if needed",
      },
      {
        title: "Can I appeal a removed post?",
        content: "Use support chat\nProvide details\nRequest review",
      },
    ],
  },
  {
    icon: "person",
    title: "Profile & Settings",
    articles: [
      {
        title: "How to edit my profile",
        content: "Go to profile\nTap \u201cEdit Profile\u201d\nUpdate details",
      },
      {
        title: "How to change my account information",
        content: "Go to Settings\nUpdate email or password",
      },
    ],
  },
  {
    icon: "construct",
    title: "App Issues & Troubleshooting",
    articles: [
      {
        title: "App is not loading",
        content: "Check internet\nRestart app",
      },
      {
        title: "Videos are not playing",
        content: "Check network\nUpdate app",
      },
      {
        title: "App keeps crashing",
        content: "Restart device\nReinstall app",
      },
    ],
  },
  {
    icon: "chatbubble-ellipses",
    title: "Contact & Support",
    articles: [
      {
        title: "How to chat with support",
        content: "Tap \u201cChat with us\u201d\nSend your message\nWait for response",
      },
    ],
  },
];
