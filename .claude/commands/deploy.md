# /deploy — Deploy Boy Jail to AWS Amplify Hosting

Runs pre-deploy checks then triggers a production deployment via Amplify Hosting (connected to GitHub main branch).

## Pre-deploy checklist

1. Run `npm run build` — must succeed with no errors
2. Run `npm run lint` — fix any lint errors before continuing
3. Check that `git status` is clean (all changes committed)
4. Confirm the current branch is `main`

## Deploy

Amplify Hosting deploys automatically on push to `main`. After confirming the checklist:

1. `git push origin main`
2. Tell the user to open the AWS Amplify console to watch the build
3. Remind them the Amplify Hosting URL is in the console under the app's "Hosting" tab

## If Amplify isn't connected to GitHub yet

Guide the user to:
1. Open the AWS Amplify console
2. Create a new app → "Host web app" → connect to GitHub
3. Select the `boy-jail` repo and `main` branch
4. Accept default build settings (Amplify detects Next.js automatically)
