import Datetime from "./Datetime";
import type { BlogFrontmatter } from "@content/_schemas";
import socialIcons from "@assets/socialIcons";



export interface Props {
  href?: string;
  frontmatter: BlogFrontmatter;
  secHeading?: boolean;
}

export default function Card({ href, frontmatter, secHeading = true }: Props) {
  const { title, pubDatetime, description, stargazers_count } = frontmatter;

  return (
    <li className="my-6">
      <a
        href={href}
        className="inline-block text-lg font-medium text-skin-accent decoration-dashed underline-offset-4 focus-visible:no-underline focus-visible:underline-offset-0"
      >
        {secHeading ? (
          <h2 className="text-lg font-medium decoration-dashed hover:underline">
            {title}
          </h2>
        ) : (
          <h3 className="text-lg font-medium decoration-dashed hover:underline">
            {title}
          </h3>
        )}
      </a>
      <div className="flex items-center space-x-4 text-sm text-skin-muted">
        <Datetime datetime={pubDatetime} />
        {stargazers_count ? (
          <div className="flex items-center space-x-1 opacity-80">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="1"
              height="1"
              viewBox="0 0 100 100"
            >
              <path
                d="M50,10 L61.8,35.4 L90,41 L70,61 L76.4,89 L50,75 L23.6,89 L30,61 L10,41 L38.2,35.4 Z"
                fill="none"
                stroke="black"
                strokeWidth="8"
              />
            </svg>
            <span>{stargazers_count}</span>
          </div>
        ) : null}
      </div>
      <p>{description}</p>
    </li>
  );
}

