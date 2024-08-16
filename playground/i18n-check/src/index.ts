import parseGitDiff from 'parse-git-diff';
import { ESLint } from 'eslint';
import eslintPlugin from './plugin';
import path from 'path';
import { filterEslintResults, git, ensureSha } from './utils';

export async function check({
  owner,
  repo,
  pull_number,
  srcDir = '.',
}: {
  srcDir?: string;
  owner?: string;
  repo?: string;
  pull_number?: number;
}) {
  function createEslint() {
    return new ESLint({
      overrideConfigFile: true,
      overrideConfig: [
        {
          files: ['**/*.{ts,tsx,js,jsx}'],
          languageOptions: {
            // must use require!
            parser: require('@typescript-eslint/parser'),

            parserOptions: {
              sourceType: 'module',
              ecmaVersion: 'latest',
              jsx: true,
            },
          },
          plugins: { i18n: eslintPlugin() },
          linterOptions: {
            reportUnusedDisableDirectives: 'off',
          },
          rules: {
            'i18n/check': 'error',
          },
        },
      ],
    });
  }
  let repoRoot = process.cwd();
  try {
    repoRoot = await git.revparse(['--show-toplevel']);
  } catch (e: any) {}

  if (pull_number && owner && repo) {
    const { Octokit } = await import('octokit');
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    const pr = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number,
    });

    let lastCommit = pr.data.base.sha;
    let currentCommit = pr.data.head.sha;

    await ensureSha(lastCommit);
    await ensureSha(currentCommit);

    const diffString = await git.diff([lastCommit, currentCommit]);
    const diff = parseGitDiff(diffString);

    const fileInfo: Record<string, Set<number>> = {};

    for (const f of diff.files || []) {
      let cp = '';
      if (f.type === 'AddedFile' || f.type === 'ChangedFile') {
        cp = f.path;
      } else if (f.type == 'RenamedFile') {
        cp = f.pathAfter;
      }
      if (cp) {
        if (
          cp.endsWith('.ts') ||
          cp.endsWith('.tsx') ||
          cp.endsWith('.js') ||
          cp.endsWith('.jsx')
        ) {
          const p = path.join(repoRoot, cp);
          if (srcDir && !p.startsWith(srcDir)) {
            continue;
          }
          fileInfo[p] = new Set<number>();
          for (const c of f.chunks) {
            if (c.type === 'Chunk') {
              for (const l of c.changes) {
                if (l.type === 'AddedLine') {
                  fileInfo[p].add(l.lineAfter);
                }
              }
            }
          }
        }
      }
    }

    const eslint = createEslint();

    const results = filterEslintResults(
      await eslint.lintFiles(Object.keys(fileInfo)),
    );

    const finalResults: ESLint.LintResult[] = [];

    for (const r of results) {
      const info = fileInfo[r.filePath];
      const messages = r.messages.filter((m) => {
        return info.has(m.line);
      });
      if (messages.length > 0) {
        finalResults.push({
          ...r,
          messages,
        });
      }
    }

    for (const r of finalResults) {
      for (const m of r.messages) {
        await octokit.rest.pulls.createReviewComment({
          line: m.line,
          commit_id: currentCommit,
          owner,
          repo,
          body: m.message,
          path: r.filePath.slice(repoRoot.length + 1),
          pull_number,
        });
      }
    }

    if (process.env.LOCAL_DEV) {
      console.log(finalResults);
    }

    if (finalResults.length > 0) {
      process.exit(1);
    }
  } else if (srcDir) {
    const eslint = createEslint();
    const results = filterEslintResults(await eslint.lintFiles([srcDir]));
    const formatter = await eslint.loadFormatter('stylish');
    const resultText = formatter.format(results, {
      cwd: repoRoot,
      rulesMeta: {},
    });
    console.log(resultText);
    if (results.length > 0) {
      process.exit(1);
    }
  }
}
