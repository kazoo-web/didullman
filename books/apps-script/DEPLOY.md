# Setting up the book poll backend

The poll at didullman.com/books saves votes to a Google Sheet through a small
Apps Script web app. Setup takes about ten minutes and costs nothing.

Google changes the Apps Script editor from time to time, so a menu label below
may be worded slightly differently. Google's own guide to deployments is the
reference: <https://developers.google.com/apps-script/concepts/deployments>

## 1. Create the Sheet

1. Go to <https://sheets.new> while signed in to the Google account that should own the data.
2. Name it, e.g. **Book Club Poll 2026**.

You don't need to create the tabs. The script creates **Responses** and
**Matchups**, with header rows, the first time it runs. To create them up front
anyway, see step 2.5.

## 2. Add the script

1. In the Sheet: **Extensions → Apps Script**. This opens a script project attached to the Sheet.
2. Delete the placeholder code in `Code.gs`.
3. Paste in the whole of `books/apps-script/Code.gs` from this repo.
4. Click **Save** (disk icon).
5. Optional: pick `setup` in the function dropdown next to **Run** and click **Run**.
   This creates the two tabs now, and it's also when Google first asks for
   permission (see step 3.4).

## 3. Deploy as a web app

1. Click **Deploy → New deployment**.
2. Click the gear next to **Select type** and choose **Web app**.
3. Fill in:
   - **Description:** `v1`
   - **Execute as:** **Me** (your account). The script writes to your Sheet as you.
   - **Who has access:** **Anyone**. This lets the poll call it without
     anyone signing in to Google. Don't choose "Anyone with Google account",
     which would break the poll for everyone.
4. Click **Deploy**. Google asks you to authorize access to your spreadsheets.
   Because this is your own unverified script, you may see **"Google hasn't
   verified this app."** If so, click **Advanced → Go to (project name)
   (unsafe)**, then **Allow**. The only access granted is to this script,
   running as you. The permission should mention only *this* spreadsheet
   (the `@OnlyCurrentDoc` line at the top of the script limits it). If it
   asks for all your spreadsheets, check that line was pasted too.
5. Copy the **Web app URL**. It looks like
   `https://script.google.com/macros/s/AKfy…/exec`.

## 4. Put the URL in the page

Edit `books/config.js`:

```js
window.BOOK_POLL_CONFIG = {
  apiUrl: 'https://script.google.com/macros/s/AKfy…/exec'
};
```

Commit and push to `main`; the site redeploys automatically. Until the URL is
set, the page shows "Not open yet".

The URL is public by design. It can only check whether an email has voted
(yes/no), return the group ranking (no emails or individual answers), or accept
a well-formed ballot.

## 5. Test it end to end

Send Claude the web app URL to run the live check, or run it yourself from the repo:

```bash
node books/dev/live-check.cjs 'https://script.google.com/macros/s/AKfy…/exec'
```

It submits one test ballot from an address like
`poll-test-…@example.invalid`. Delete that row from **Responses** and its rows
from **Matchups** afterwards.

## Changing the script later

Saving the code does **not** update the live web app. To publish a change and
keep the same URL:

1. **Deploy → Manage deployments**.
2. Select the active deployment and click **Edit** (pencil).
3. Under **Version**, choose **New version**, then click **Deploy**.

Choosing **Deploy → New deployment** instead creates a *new* URL, and
`config.js` would need updating.

## What's in the Sheet

**Responses**: one row per person.

| column | contents |
|---|---|
| timestamp | when they submitted |
| email | trimmed, lowercased |
| books_read | JSON list of book ids, in month order |
| personal_ranking | JSON list of `{id, wins, rank, tied}`, best first, recalculated on the server |

**Matchups**: one row per choice, for your own analysis.

| column | contents |
|---|---|
| timestamp | same as their Responses row |
| email | same as above |
| book_a | book shown on the **left** |
| book_b | book shown on the **right** |
| winner | the one they picked |
| position | `left` or `right`: where the winner was shown |

Book ids: `vuong`, `taddeo`, `szalay`, `saunders`, `beatty`, `ferrante`, `butler`.

**Editing data by hand.** The group ranking is recalculated from both tabs on
every request. If you remove a person, delete their row in **Responses** and
all their rows in **Matchups**. Deleting only the Responses row frees the email
to vote again, but leaves their matchups counted.

## Adding a book later

Add its id to `BOOKS` in `Code.gs` (then publish a new version, as above).
Then add it to `BOOKS` in `books/app.js`, and add its cover as
`books/covers/<id>.jpg`.
