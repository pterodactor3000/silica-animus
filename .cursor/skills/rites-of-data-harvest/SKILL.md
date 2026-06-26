---
name: rites-of-data-harvest
description: Produce a short status report from a task management system via MCP (Linear, Jira, GitHub Issues). Surfaces blocked items, review-ready work, out-of-scope and off-radar issues, and up to three recommended next picks. Use when the user asks for status, standup, triage, "what should I work on", or invokes rites-of-data-harvest.
---

# Data Harvest

Use this skill when the user says "status", "standup", "what's blocked", "what should I take", "triage", or "rites-of-data-harvest".

## Workflow

1. **Detect provider** — prefer Linear MCP when available; fall back to another task MCP the user names or has enabled (Jira, GitHub Issues). If none is available, say so and stop.
2. **Read tool schemas** — list MCP tool descriptors for the chosen provider before calling anything.
3. **Resolve scope** — default to issues assigned to the current user (`assignee: "me"` on Linear). If the user names a team, project, or cycle, narrow to that.
4. **Fetch issues** — pull active (non-done, non-canceled) issues. Paginate when results hit the limit. For blocked classification, fetch relations on candidates (`includeRelations: true` on Linear `get_issue`).
5. **Classify** — apply rules in [triage-rules.md](references/triage-rules.md). When team labels or states differ, read `list_issue_statuses` / label tools once and map locally; do not guess state names.
6. **Recommend picks** — choose at most three unblocked, in-scope issues the user should take next (see Recommendations below).
7. **Emit report** — use the output template exactly. Keep the whole report short; one line per issue unless the user asked for detail.

## Report Sections

| Section | Meaning |
| ------- | ------- |
| **Blocked** | Cannot proceed — blocking relation, blocked label/state, or explicit dependency called out in title/description |
| **Review ready** | Implementation done; waiting on review, QA, or merge |
| **Out of scope** | Explicitly deferred, canceled, or labeled/named as out of scope / won't do |
| **Out of radar** | Active but neglected — stale updates, no assignee, icebox/radar labels, or outside current cycle with no owner |
| **Recommended** | Up to three issues to pick up next |

An issue appears in **one** primary section only. Priority order when multiple rules match: Out of scope → Blocked → Review ready → Out of radar → (eligible for Recommended).

## Recommendations

Pick **at most three** from issues that are:

- In scope (not out of scope, not done)
- Unblocked
- Assigned to the user **or** unassigned on the user's team (prefer user's assignments first)

Rank by:

1. Priority (Urgent > High > Medium > Low > None)
2. In current cycle/sprint over backlog
3. Most recently updated among ties

Each recommendation is one line: `IDENTIFIER — title — <why now>` where *why now* is brief (priority, cycle, unblocks others, review SLA, etc.).

## Linear Quick Reference

```
list_teams          → resolve team id/name if user scoped a team
list_issue_statuses → map state names before filtering
list_issues         → assignee "me", optional team/project/cycle/state/label filters
get_issue           → includeRelations true for blocked-by checks
```

Typical fetch pattern:

- My active work: `list_issues` with `assignee: "me"`, exclude done/canceled states after mapping statuses
- Review queue: `list_issues` with `state` matching review-ready states from triage rules
- Team radar: `list_issues` with `assignee: null` on the team, or `updatedAt: "-P14D"` for stale items

## Output Format

Structure the report with these headers exactly:

```
// [Status Report] //
Provider: <Linear | …> · Scope: <me | team | project> · As of: <YYYY-MM-DD>

// [Blocked] //
<IDENTIFIER> — <title> — <blocker or reason>
… or `None.`

// [Review ready] //
<IDENTIFIER> — <title> — <reviewer or waiting-on if known>
… or `None.`

// [Out of scope] //
<IDENTIFIER> — <title> — <reason>
… or `None.`

// [Out of radar] //
<IDENTIFIER> — <title> — <why off radar, e.g. stale 21d, unassigned>
… or `None.`

// [Recommended] //
1. <IDENTIFIER> — <title> — <why now>
… up to 3 items, or `None — nothing ready; resolve blocked items first.`
```

Rules for output:

- One issue per bullet; no paragraphs.
- Use the tracker identifier (e.g. `ENG-123`), not internal UUIDs.
- If a section has no items, write `None.` under that header.
- Do not invent issues, assignees, or blockers — only report what MCP returned.
- If classification is ambiguous, pick the best fit and append `(?)` to the reason.

## Additional Resources

- Label, state, and staleness defaults: [references/triage-rules.md](references/triage-rules.md)
