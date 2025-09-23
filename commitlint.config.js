/**
 * Commitlint config for LevelUp5
 * Enforces Conventional Commits to keep history readable and automatable.
 * Example:
 *   feat(learn): scaffold empty state grid
 *   fix(rls): restrict user_progress updates to owner
 *   chore(ci): add typecheck to CI workflow
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Allowed types (extend as needed)
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert'
      ]
    ],
    // Prefer kebab-case scopes like learn, auth, admin, api, rls, ci
    'scope-case': [2, 'always', 'kebab-case'],
    // Allow any subject casing except SHOUTING and unwanted cases
    'subject-case': [
      2,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case']
    ],
    'subject-empty': [2, 'never'],
    'header-max-length': [2, 'always', 100]
  }
};