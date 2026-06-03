import type { ProjectData, Repo } from "../types";
import { PROJECTS } from "@config";
import { z } from "zod";

const repoSchema = z.object({
  id: z.number(),
  name: z.string(),
  private: z.boolean(),
  html_url: z.string(),
  description: z.string().nullable(),
  stargazers_count: z.number(),
  languages_url: z.string(),
});

const languageSchema = z.record(z.string(), z.number());

const apiUrl = `https://api.github.com/users/${PROJECTS.githubUsername}/repos`;
const PROJECT_DATA_CACHE_TTL_MS = 5 * 60 * 1000;

const githubHeaders = {
  Accept: "application/vnd.github+json",
  ...(import.meta.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${import.meta.env.GITHUB_TOKEN}` }
    : {}),
};

let projectDataCache: {
  key: string;
  expiresAt: number;
  value: ProjectData;
} | null = null;

const getRepoLanguageEntries = async (repos: Repo[]) => {
  return Promise.all(
    repos.map(async repo => {
      try {
        const response = await fetch(repo.languages_url, {
          headers: githubHeaders,
        });
        if (!response.ok)
          return { repoId: repo.id, entries: [] as [string, number][] };

        const languageData = languageSchema.parse(await response.json());
        return { repoId: repo.id, entries: Object.entries(languageData) };
      } catch {
        return { repoId: repo.id, entries: [] as [string, number][] };
      }
    })
  );
};

export async function getProjectData(
  number: 1 | 2 | 3 | 4 | 5 | 6,
  pinnedRepoNames: string[] = [],
  commonLanguagesToShow = 5
): Promise<ProjectData> {
  const cacheKey = JSON.stringify({
    number,
    pinnedRepoNames,
    commonLanguagesToShow,
  });

  if (
    projectDataCache &&
    projectDataCache.key === cacheKey &&
    projectDataCache.expiresAt > Date.now()
  ) {
    return projectDataCache.value;
  }

  try {
    const response = await fetch(`${apiUrl}?per_page=100&sort=updated`, {
      headers: githubHeaders,
    });

    if (!response.ok) {
      return {
        pinnedRepos: [],
        otherRepos: [],
        commonLanguages: [],
        fetchError: `GitHub API request failed (${response.status}).`,
      };
    }

    const parsed = repoSchema.array().parse(await response.json());
    const repos = parsed
      .filter(repo => !repo.private)
      .sort((a, b) => b.stargazers_count - a.stargazers_count);

    const normalizeRepoName = (name: string) =>
      name.toLowerCase().replace(/[^a-z0-9]/g, "");

    const reposByNormalizedName = new Map(
      repos.map(repo => [normalizeRepoName(repo.name), repo])
    );
    const pinnedRepos = pinnedRepoNames
      .map(name => {
        const normalizedName = normalizeRepoName(name);
        const exactMatch = reposByNormalizedName.get(normalizedName);
        if (exactMatch) return exactMatch;

        return repos.find(repo => {
          const repoName = normalizeRepoName(repo.name);
          return (
            repoName.includes(normalizedName) ||
            normalizedName.includes(repoName)
          );
        });
      })
      .filter((repo): repo is Repo => Boolean(repo));

    const pinnedRepoIds = new Set(pinnedRepos.map(repo => repo.id));
    const otherRepos = repos
      .filter(repo => !pinnedRepoIds.has(repo.id))
      .slice(0, number);

    const displayedRepos = [...pinnedRepos, ...otherRepos];
    const repoLanguageEntries = await getRepoLanguageEntries(displayedRepos);

    const languageTotals = new Map<string, number>();
    const languageBreakdownByRepo = new Map<
      number,
      Repo["languageBreakdown"]
    >();

    for (const { repoId, entries } of repoLanguageEntries) {
      const totalBytes = entries.reduce((total, [, bytes]) => total + bytes, 0);

      const breakdown = entries
        .sort((a, b) => b[1] - a[1])
        .map(([language, bytes]) => ({
          language,
          percentage:
            totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0,
        }));

      languageBreakdownByRepo.set(repoId, breakdown);

      for (const [language, bytes] of entries) {
        languageTotals.set(
          language,
          (languageTotals.get(language) ?? 0) + bytes
        );
      }
    }

    const commonLanguages = [...languageTotals.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, commonLanguagesToShow)
      .map(([language]) => language);

    const withLanguageBreakdown = (repo: Repo): Repo => ({
      ...repo,
      languageBreakdown: languageBreakdownByRepo.get(repo.id) ?? [],
    });

    const result = {
      pinnedRepos: pinnedRepos.map(withLanguageBreakdown),
      otherRepos: otherRepos.map(withLanguageBreakdown),
      commonLanguages,
    };

    projectDataCache = {
      key: cacheKey,
      expiresAt: Date.now() + PROJECT_DATA_CACHE_TTL_MS,
      value: result,
    };

    return result;
  } catch {
    return {
      pinnedRepos: [],
      otherRepos: [],
      commonLanguages: [],
      fetchError: "GitHub API request failed.",
    };
  }
}

export async function getRepos(number: 1 | 2 | 3 | 4 | 5 | 6): Promise<Repo[]> {
  const { otherRepos } = await getProjectData(number);
  return otherRepos;
}

export default getRepos;
