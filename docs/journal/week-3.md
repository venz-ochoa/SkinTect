## Reflection Journal
Week of: October 4, 2026

## My goal this week
Turn the prototype into a full app: add user accounts, scan history, and the heatmap, polish the UI, and deploy everything online.

## What I did
- Moved from Supabase to an Express and PostgreSQL backend, and deployed the database and API on Render and the frontend on GitHub Pages
- Built sign up, login, user sessions, and a profile page (edit name, picture, and password, or delete the account)
- Added scan history (save, view, delete), the heatmap overlay with a toggle, body part tagging, activity tracking, PDF export, and dark mode
- Retrained the model on dermoscopic and phone-camera images so the heatmap lands on the lesion
- Polished the UI with animations and icons, wrote a one-run setup script, filled out the README, and recorded a demo video
## What blocked me
Login and navigation took the most time. After logging in I stayed stuck on the login page, and it took several rounds of fixes to get right. The heatmap also wouldn't show because the file was too large, so I added compression. On top of that, deploying to Render gave me CORS and database schema path errors.

## What I learned
Hosting the frontend and backend on different domains means regular cookies don't work, so I had to use a token in the headers to keep users logged in. I also learned that a heatmap is only as good as the data behind it, since retraining on more kinds of photos fixed it highlighting the edges. Lastly, the model always picks a best match, even when the photo is not a skin lesion, so I documented that as out of scope.
