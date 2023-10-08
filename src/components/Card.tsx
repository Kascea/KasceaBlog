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
              className="icon-tabler"
              stroke-linecap="round"
              stroke-linejoin="round"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2 L14.37 8.62 L21 9.24 L16.62 13.12 L18 19 L12 16.62 L6 19 L7.38 13.12 L3 9.24 L9.63 8.62 L12 2 Z" />
            </svg>

            <span>{stargazers_count}</span>
          </div>
        ) : null}
      </div>
      <p>{description}</p>
    </li>
  );
}

