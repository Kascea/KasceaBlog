import type { Repo } from "../types";
import { z } from 'zod';

const repoSchema = z.object({
  id: z.number(),
  name: z.string(),
  private: z.boolean(),
  html_url: z.string(),
  description: z.string().nullable(),
})

export async function getRepos(
  number: 1 | 2 | 3 | 4 | 5 | 6,
): Promise<Repo[]> {
  const res = await fetch("https://api.github.com/users/Kascea/repos").then(
    res => res.json(),
  )
  const repos = repoSchema.array().parse(res).filter((repo: Repo) => !repo.private);

  return repos.slice(0, number)
}

export default getRepos;