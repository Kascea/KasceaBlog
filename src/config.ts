import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://astro-paper.pages.dev/",
  author: "Cole Carlson",
  desc: "A minimal, responsive and SEO-friendly Astro blog theme.",
  title: "Kascea",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerPage: 3,
};

export const LOCALE = ["en-EN"]; // set to [] to use the environment default

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/Kascea",
    linkTitle: ` ${SITE.title} on Github`,
    active: true,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/Kascea4",
    linkTitle: `${SITE.title} on Twitter`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://github.com/coletcarlson",
    linkTitle: `${SITE.title} on LinkedIn`,
    active: true,
  },
  {
    name: "Mail",
    href: "colethomascarlson@gmail.com",
    linkTitle: `Send an email to ${SITE.title}`,
    active: true,
  }
];
