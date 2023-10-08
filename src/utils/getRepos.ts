import type { Repo } from "../types";
import { z } from 'zod';

const repoSchema = z.object({
  id: z.number(),
  name: z.string(),
  private: z.boolean(),
  html_url: z.string(),
  description: z.string().nullable(),
  stargazers_count: z.number(),
})

const apiUrl = "https://api.github.com/users/Kascea/repos";

export async function getRepos(
  number: 1 | 2 | 3 | 4 | 5 | 6,
): Promise<Repo[]> {
  const res = await fetch(apiUrl)
  .then(
    res => res.json(),
  )

  const repos = repoSchema.array().parse(res).filter(repo => !repo.private).sort((a, b) => b.stargazers_count - a.stargazers_count);

  return repos.slice(0, number)
}

export default getRepos;