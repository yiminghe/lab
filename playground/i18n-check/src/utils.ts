import { simpleGit } from 'simple-git';
import { ESLint } from 'eslint';

export const git = simpleGit();

export function filterEslintResults(
  results: ESLint.LintResult[],
): ESLint.LintResult[] {
  return results
    .map((r) => {
      r.messages = r.messages.filter((m) => {
        return m.ruleId === 'i18n/check';
      });
      return r.messages.length ? r : null;
    })
    .filter(Boolean) as any;
}

export async function ensureSha(sha: string | undefined) {
  if (!sha) {
    return;
  }
  try {
    await git.show(['-q', sha]);
  } catch (e: any) {
    await git.fetch(['--depth=1', 'origin', sha]);
  }
}
