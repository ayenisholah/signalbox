# M4: Accounts and saved workspaces

**Needs:** [account setup](account-setup.md).

**Outcome:** a signed-in user can save schema drafts and screen maps. The rest of the app still works with no account.

## Work

1. `feat/web-auth`: Cognito code flow with PKCE, a server-side session, `HttpOnly` cookies, and a local issuer for development and tests.
2. `feat/workspace-subgraph`: saved workspaces in Postgres, scoped by the verified user ID.

## Exit

- One user can't reach another's workspace through any operation.
- A forged header has no effect.
