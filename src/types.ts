export type Repo = {
  id: number;
  name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  languages_url: string;
  languageBreakdown?: RepoLanguageShare[];
};

export type RepoLanguageShare = {
  language: string;
  percentage: number;
};

export type ProjectData = {
  pinnedRepos: Repo[];
  otherRepos: Repo[];
  commonLanguages: string[];
  fetchError?: string;
};

export type ProjectsConfig = {
  githubUsername: string;
  reposToShow: 1 | 2 | 3 | 4 | 5 | 6;
  pinnedRepoNames: string[];
  commonLanguagesToShow: number;
};

export type Site = {
  website: string;
  author: string;
  desc: string;
  title: string;
  ogImage: string;
  lightAndDarkMode: boolean;
  postPerPage: number;
};

export type SocialObjects = {
  name: SocialMedia;
  href: string;
  active: boolean;
  linkTitle: string;
}[];

export type SocialIcons = {
  [social in SocialMedia]: string;
};

export type SocialMedia =
  | "Github"
  | "Facebook"
  | "Instagram"
  | "LinkedIn"
  | "Mail"
  | "Twitter"
  | "Twitch"
  | "YouTube"
  | "WhatsApp"
  | "Snapchat"
  | "Pinterest"
  | "TikTok"
  | "CodePen"
  | "Discord"
  | "GitLab"
  | "Reddit"
  | "Skype"
  | "Steam"
  | "Telegram"
  | "Mastodon"
  | "Star";
