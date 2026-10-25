import Fuse from "fuse.js";
import { useEffect, useRef, useState, useMemo } from "react";
import slugify from "@utils/slugify";
import { LOCALE } from "@config";
import type { BlogFrontmatter } from "@content/_schemas";

export type SearchItem = {
  title: string;
  description: string;
  data: BlogFrontmatter;
};

interface Props {
  searchList: SearchItem[];
}

interface SearchResult {
  item: SearchItem;
  refIndex: number;
}

export default function SearchOverlay({ searchList }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const fuse = useMemo(
    () =>
      new Fuse(searchList, {
        keys: ["title", "description"],
        includeMatches: true,
        minMatchCharLength: 2,
        threshold: 0.5,
      }),
    [searchList]
  );

  // Listen for open event from header button
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setInputVal("");
      setSearchResults([]);
    };
    window.addEventListener("search-open", handleOpen);
    return () => window.removeEventListener("search-open", handleOpen);
  }, []);

  // Focus input when overlay opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Escape to close + lock body scroll
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeydown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Run fuzzy search
  useEffect(() => {
    const results = inputVal.length > 1 ? fuse.search(inputVal) : [];
    setSearchResults(results);
  }, [inputVal, fuse]);

  const close = () => setIsOpen(false);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-skin-fill bg-opacity-[0.97] px-6 backdrop-blur-sm sm:px-8"
      onClick={e => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="mx-auto mt-16 w-full max-w-2xl sm:mt-24">
        {/* Header row */}
        <div className="section-head !mb-4">
          <span className="eyebrow">Search</span>
          <button
            onClick={close}
            className="focus-outline rounded border border-skin-line px-2 py-0.5 font-mono text-xs text-skin-muted transition-colors hover:border-skin-accent hover:text-skin-link"
            aria-label="Close search"
          >
            esc
          </button>
        </div>

        {/* Input */}
        <label className="group relative block">
          <span className="sr-only">Search posts</span>
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="!h-5 !w-5 !fill-skin-accent opacity-80"
              aria-hidden="true"
            >
              <path d="M19.023 16.977a35.13 35.13 0 0 1-1.367-1.384c-.372-.378-.596-.653-.596-.653l-2.8-1.337A6.962 6.962 0 0 0 16 9c0-3.859-3.14-7-7-7S2 5.141 2 9s3.14 7 7 7c1.763 0 3.37-.66 4.603-1.739l1.337 2.8s.275.224.653.596c.387.363.896.854 1.384 1.367l1.358 1.392.604.646 2.121-2.121-.646-.604c-.379-.372-.885-.866-1.391-1.36zM9 14c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5z" />
            </svg>
          </span>
          <input
            ref={inputRef}
            className="w-full border-b border-dotted border-skin-line bg-transparent py-3 pl-8 pr-4 text-2xl font-bold tracking-[-0.03em] text-skin-heading placeholder:font-normal placeholder:text-skin-muted placeholder:opacity-60 focus:border-solid focus:border-skin-accent focus:outline-none"
            placeholder="Search posts..."
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.currentTarget.value)}
            autoComplete="off"
          />
        </label>

        {/* Result count */}
        {inputVal.length > 1 && (
          <p className="mt-5 font-mono text-xs text-skin-muted">
            {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}{" "}
            for &ldquo;{inputVal}&rdquo;
          </p>
        )}

        {/* Results list */}
        <ul className="mt-6 max-h-[55vh] overflow-y-auto">
          {searchResults.map(({ item, refIndex }) => {
            const date = new Date(item.data.pubDatetime);
            return (
              <li
                key={`${refIndex}-${slugify(item.data)}`}
                className="border-b border-dotted border-skin-line py-5 first:pt-0 last:border-b-0"
              >
                <div className="flex flex-col gap-x-4 sm:flex-row sm:items-baseline">
                  <time
                    dateTime={date.toISOString()}
                    className="shrink-0 text-sm text-skin-muted sm:w-[120px]"
                  >
                    {date.toLocaleDateString(LOCALE, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                  <h3 className="text-base font-medium text-skin-base">
                    <a
                      href={`/blog/${slugify(item.data)}`}
                      className="ink-link"
                      onClick={close}
                    >
                      {item.title}
                    </a>
                  </h3>
                </div>
                {item.description && (
                  <p className="mt-2 line-clamp-2 max-w-xl text-sm leading-6 text-skin-muted sm:ml-[136px]">
                    {item.description}
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        {/* Empty state */}
        {inputVal.length > 1 && searchResults.length === 0 && (
          <p className="mt-4 text-sm text-skin-muted">
            Nothing matched. Try another word, or browse{" "}
            <a href="/tags" className="quiet-link" onClick={close}>
              tags
            </a>
            .
          </p>
        )}

        {/* Idle hint */}
        {inputVal.length === 0 && (
          <p className="mt-4 text-sm text-skin-muted">
            Start typing to search posts by title or description.
          </p>
        )}
      </div>
    </div>
  );
}
