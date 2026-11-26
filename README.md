# How much of the shuttle fund actually came in?

A funder update says the campaign received its entire $6,000 goal. The deposit log shows **$4,200 received**. A separate **$1,800 pledge** explains the difference. This n8n work sample produces a corrected draft and the source IDs behind the numbers, ready for a program manager to review.

| Fictional record | Amount | What counts today |
| --- | ---: | --- |
| D-101 · posted deposit | $1,800 | Received |
| D-102 · posted deposit | $2,400 | Received |
| P-201 · signed pledge | $1,800 | Pledged |
| **Cash received toward goal** | **$4,200** | **70% of $6,000** |

### Try it in n8n

Download [the workflow JSON](./shuttle-fund.n8n.json). In a new n8n workflow, choose **Import from File**, select the JSON and click **Execute workflow**. Open the last node to see the draft, the source trail, and the amount by which the original claim overstated receipts. All records are fictional. The example runs locally in n8n with a manual trigger and two built-in Code nodes. It needs no credentials and sends no email.

To test it, open **Fictional source records** and copy the first deposit into the records array a second time. Running it again still shows $4,200. Now give that second copy a different amount while keeping its ID. The result changes to **REVIEW**, names the conflicting source ID and withholds the draft.

### What the check covers

Each input represents one campaign in US dollars. Each cash amount is a positive integer number of cents. Only posted deposits count as received and signed pledges count separately. Empty inputs, invalid amounts, conflicting IDs or unknown statuses stop the draft. A real implementation would connect the program’s authorized sources, handle reversals and pledge-to-deposit matching, and retain a person’s approval before releasing a funder update.

Run `node verify.mjs` to replay six checks against the code embedded in the downloadable workflow. The repository’s Actions workflow also imports the JSON into n8n and checks the actual final node output. The original [interactive funder-update example](https://scope-and-sum-research.dylenrig.chatgpt.site/nonprofit-funder-update-guide) shows the decision from a program manager’s point of view.
