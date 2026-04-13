import Fuse from "fuse.js";
import { useEffect, useRef, useState, useMemo } from "react";
import slugify from "@utils/slugify";
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
      className="fixed inset-0 z-50 bg-skin-fill bg-opacity-[0.97] px-4"
      onClick={e => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="mx-auto mt-24 w-full max-w-2xl">
        {/* Header row */}
        <div className="mb-6 flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-skin-base opacity-60">
            Search
          </span>
          <button
            onClick={close}
            className="text-xs tracking-wide text-skin-base opacity-60 transition-opacity hover:opacity-90"
            aria-label="Close search"
          >
            esc
          </button>
        </div>

        {/* Input */}
        <label className="relative block">
          <span className="absolute inset-y-0 left-0 flex items-center opacity-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 fill-skin-base"
              aria-hidden="true"
            >
              <path d="M19.023 16.977a35.13 35.13 0 0 1-1.367-1.384c-.372-.378-.596-.653-.596-.653l-2.8-1.337A6.962 6.962 0 0 0 16 9c0-3.859-3.14-7-7-7S2 5.141 2 9s3.14 7 7 7c1.763 0 3.37-.66 4.603-1.739l1.337 2.8s.275.224.653.596c.387.363.896.854 1.384 1.367l1.358 1.392.604.646 2.121-2.121-.646-.604c-.379-.372-.885-.866-1.391-1.36zM9 14c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5z" />
            </svg>
          </span>
          <input
            ref={inputRef}
            className="bg-transparent w-full border-b border-skin-line py-3 pl-8 pr-4 text-xl text-skin-base placeholder:text-skin-base placeholder:opacity-40 focus:border-skin-accent focus:outline-none"
            placeholder="Search posts..."
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.currentTarget.value)}
            autoComplete="off"
          />
        </label>

        {/* Result count */}
        {inputVal.length > 1 && (
          <p className="mt-5 text-xs tracking-wide text-skin-base opacity-60">
            {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}{" "}
            for &ldquo;{inputVal}&rdquo;
          </p>
        )}

        {/* Results list */}
        <ul className="mt-4 max-h-[55vh] overflow-y-auto">
          {searchResults.map(({ item, refIndex }) => (
            <li
              key={`${refIndex}-${slugify(item.data)}`}
              className="border-b border-skin-line last:border-0"
            >
              <a
                href={`/blog/${slugify(item.data)}`}
                className="group block py-4"
              >
                <h3 className="font-medium text-skin-accent decoration-1 underline-offset-[6px] group-hover:underline">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="mt-1 line-clamp-1 text-sm text-skin-base opacity-70">
                    {item.description}
                  </p>
                )}
              </a>
            </li>
          ))}
        </ul>

        {/* Empty state */}
        {inputVal.length > 1 && searchResults.length === 0 && (
          <p className="mt-12 text-center text-sm text-skin-base opacity-50">
            No results found
          </p>
        )}

        {/* Idle hint */}
        {inputVal.length === 0 && (
          <p className="mt-12 text-center text-sm text-skin-base opacity-50">
            Start typing to search posts
          </p>
        )}
      </div>
    </div>
  );
}
