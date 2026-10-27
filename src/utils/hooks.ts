export const PRE_COMMIT_HOOK = `#!/bin/sh
# vaulty pre-commit
git diff --cached --name-only --diff-filter=ACM -z |
while IFS= read -r -d '' f; do
  case "$f" in
    .env|.env.*|*/.env|*/.env.*)
      case "$f" in
        *.example|*.sample|*.template) continue ;;
      esac
      echo "vaulty: refusing to commit $f (use 'git commit --no-verify' to override)"
      exit 1
      ;;
  esac
done
`;