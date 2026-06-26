# Triage Rules

Defaults for classifying issues. Override per team after reading actual labels and statuses from MCP.

## Blocked

Match when **any** of:

- Label (case-insensitive): `blocked`, `blocker`, `waiting`, `waiting-on`, `dependency`
- State name contains: `blocked`, `waiting`
- Linear `get_issue` with `includeRelations: true` shows an unresolved `blocks` / blocking relation
- Title or description starts with `[blocked]` or `[waiting on]`

## Review ready

Match when **any** of:

- State name (case-insensitive): `in review`, `review`, `ready for review`, `in qa`, `qa`, `ready to merge`, `pending review`
- Label: `review`, `review-ready`, `needs-review`, `ready-for-review`

Exclude items also marked blocked.

## Out of scope

Match when **any** of:

- State type/name: `canceled`, `cancelled`, `duplicate`, `wontfix`, `won't fix`
- Label: `out-of-scope`, `out of scope`, `wontfix`, `won't do`, `deferred`, `icebox` (when explicitly marked as won't do)
- Title prefix: `[oos]`, `[out of scope]`, `[wontfix]`

Done/completed states are excluded from the report entirely, not listed here.

## Out of radar

Match active in-scope issues **not** already in Blocked, Review ready, or Recommended, when **any** of:

- Label: `radar`, `off-radar`, `someday`, `icebox`, `backlog` (and not in current cycle)
- No assignee for **> 7 days** since last update (use `updatedAt` from issue)
- Last updated **> 14 days** ago while still in an active (non-backlog) state
- Not in the current cycle/sprint and priority is None or Low

Cap this section at **10 items**; prefer oldest `updatedAt` first. Mention truncation: `… and N more off radar.`

## Active states

Treat as active (eligible for radar / recommendations): anything that is not Done, Canceled, or Duplicate. Resolve exact names via `list_issue_statuses` — do not hardcode team-specific state IDs.

## Staleness

| Threshold | Use |
| --------- | --- |
| 7 days | unassigned → out of radar candidate |
| 14 days | assigned but untouched → out of radar candidate |

Adjust if the user specifies a sprint length or SLA.

## Other providers

When not on Linear, map equivalent fields:

| Concept | Linear | GitHub Issues | Jira |
| ------- | ------ | ------------- | ---- |
| Identifier | `ENG-123` | `#123` | `PROJ-123` |
| Blocked | relations / label | `blocked` label / linked issue | "Blocked" status / "is blocked by" |
| Review ready | state / label | `ready for review` label | "In Review" |
| Out of scope | canceled + label | closed + `wontfix` label | "Won't Do" / canceled |
| Assignee me | `assignee: "me"` | `@me` filter | current user JQL |

If the provider lacks relations, rely on labels and state names only.
