# /dev — Start Boy Jail Development Environment

Starts both the Next.js dev server and the Amplify Gen 2 cloud sandbox in parallel.

## Steps

1. Check that `amplify/` directory exists (Amplify Gen 2 has been initialised)
2. Run `npx ampx sandbox` in the background to spin up the AWS backend sandbox
3. Run `npm run dev` to start the Next.js frontend on http://localhost:3000
4. Confirm both are running and print the local URL

If `amplify/` does not exist yet, tell the user to run `npx create-amplify` first and follow the setup wizard.
