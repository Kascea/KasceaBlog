import Fuse from "fuse.js";
import { useEffect, useRef, useState, useMemo } from "react";
import slugify from "@utils/slugify";
import type { BlogFrontmatter } from "@content/_schemas";
import { LOCALE } from "@config";

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

function SearchCard({
  href,
  frontmatter,
}: {
  href: string;
  frontmatter: BlogFrontmatter;
}) {
  const { title, pubDatetime, description, stargazers_count } = frontmatter;

  const myDatetime = new Date(pubDatetime);
  const date = myDatetime.toLocaleDateString(LOCALE, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const time = myDatetime.toLocaleTimeString(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <li className="my-6">
      <a
        href={href}
        className="inline-block text-lg font-medium text-skin-accent decoration-dashed underline-offset-4 focus-visible:no-underline focus-visible:underline-offset-0"
      >
        <h2 className="text-lg font-medium decoration-dashed hover:underline">
          {title}
        </h2>
      </a>
      <div className="text-skin-muted flex items-center space-x-4 text-sm">
        <div className="flex items-center space-x-2 opacity-80">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="inline-block h-6 w-6 scale-90 fill-skin-base"
            aria-hidden="true"
          >
            <path d="M7 11h2v2H7zm0 4h2v2H7zm4-4h2v2h-2zm0 4h2v2h-2zm4-4h2v2h-2zm0 4h2v2h-2z"></path>
            <path d="M5 22h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2h-2V2h-2v2H9V2H7v2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2zM19 8l.001 12H5V8h14z"></path>
          </svg>
          <span className="sr-only">Posted on:</span>
          <span className="text-sm italic">
            {date}
            <span aria-hidden="true"> | </span>
            <span className="sr-only">&nbsp;at&nbsp;</span>
            {time}
          </span>
        </div>
        {stargazers_count ? (
          <div className="flex items-center space-x-1 opacity-80">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="icon-tabler"
              strokeLinecap="round"
              strokeLinejoin="round"
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

export default function SearchBar({ searchList }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputVal, setInputVal] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(
    null
  );

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    setInputVal(e.currentTarget.value);
  };

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

  useEffect(() => {
    // if URL has search query,
    // insert that search query in input field
    const searchUrl = new URLSearchParams(window.location.search);
    const searchStr = searchUrl.get("q");
    if (searchStr) setInputVal(searchStr);

    // put focus cursor at the end of the string
    setTimeout(function () {
      inputRef.current!.selectionStart = inputRef.current!.selectionEnd =
        searchStr?.length || 0;
    }, 50);
  }, []);

  useEffect(() => {
    // Add search result only if
    // input value is more than one character
    let inputResult = inputVal.length > 1 ? fuse.search(inputVal) : [];
    setSearchResults(inputResult);

    // Update search string in URL
    if (inputVal.length > 0) {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set("q", inputVal);
      const newRelativePathQuery =
        window.location.pathname + "?" + searchParams.toString();
      history.replaceState(null, "", newRelativePathQuery);
    } else {
      history.replaceState(null, "", window.location.pathname);
    }
  }, [inputVal]);

  return (
    <>
      <label className="relative block">
        <span className="absolute inset-y-0 left-0 flex items-center pl-2 opacity-75">
          <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M19.023 16.977a35.13 35.13 0 0 1-1.367-1.384c-.372-.378-.596-.653-.596-.653l-2.8-1.337A6.962 6.962 0 0 0 16 9c0-3.859-3.14-7-7-7S2 5.141 2 9s3.14 7 7 7c1.763 0 3.37-.66 4.603-1.739l1.337 2.8s.275.224.653.596c.387.363.896.854 1.384 1.367l1.358 1.392.604.646 2.121-2.121-.646-.604c-.379-.372-.885-.866-1.391-1.36zM9 14c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5z"></path>
          </svg>
        </span>
        <input
          className="block w-full rounded border border-skin-fill
        border-opacity-40 bg-skin-fill py-3 pl-10
        pr-3 placeholder:italic placeholder:text-opacity-75
        focus:border-skin-accent focus:outline-none"
          placeholder="Search for anything..."
          type="text"
          name="search"
          value={inputVal}
          onChange={handleChange}
          autoComplete="off"
          autoFocus
          ref={inputRef}
        />
      </label>

      {inputVal.length > 1 && (
        <div className="mt-8">
          Found {searchResults?.length}
          {searchResults?.length && searchResults?.length === 1
            ? " result"
            : " results"}{" "}
          for '{inputVal}'
        </div>
      )}

      <ul>
        {searchResults &&
          searchResults.map(({ item, refIndex }) => (
            <SearchCard
              href={`/posts/${slugify(item.data)}`}
              frontmatter={item.data}
              key={`${refIndex}-${slugify(item.data)}`}
            />
          ))}
      </ul>
    </>
  );
}
