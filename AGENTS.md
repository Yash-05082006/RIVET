<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## Architecture rules
- All role/department/module access checks go through `src/lib/rivet/permissions.ts`; never compare `user.role` in screens — keeps RBAC in one place.
- The `/app` layout enforces `canAccessPath` for direct URLs instead of per-route redirects — one guard, no redirect loops.
- Temporary sign-in maps credentials to a user record (`demo-accounts.ts`); role and departments always come from that record.
- Pages with child routes live in `index.tsx` under a folder so detail pages actually render.
