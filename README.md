# Boy Jail

A real-time multiplayer jail simulation game. Friends collaborate on a shared jail canvas — adding characters ("Boys"), placing them in rooms, and watching each other's moves happen live.

## What it does

- **Shared live canvas** — a map of the jail with rooms (Cell Block A/B, Cafeteria, Yard, Solitary)
- **Boys** — characters with a name and emoji that you drag between rooms
- **Real-time** — every move is instantly broadcast to all connected friends
- **Auth** — sign up and see who's online

## Tech Stack

- Next.js 15 + TypeScript
- React Konva (canvas)
- Tailwind CSS
- AWS Amplify Gen 2 (Cognito auth, AppSync GraphQL + subscriptions, DynamoDB)

## Getting Started

### Prerequisites

- Node.js 18+
- AWS account (free tier is fine)
- AWS CLI configured (`aws configure`)

### Install

```bash
npm install
```

### Run the backend sandbox (AWS)

```bash
npx ampx sandbox
```

This spins up your personal AWS dev environment. Leave it running while you develop.

### Run the frontend

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

Push to `main` — Amplify Hosting picks it up automatically and deploys to a `*.amplifyapp.com` URL.

## Project structure

```
amplify/          AWS backend (auth, data schema)
src/
  app/            Next.js pages
  components/
    canvas/       Jail map (React Konva)
    boys/         Boy cards and forms
    ui/           Shared components
  lib/            Amplify client, GraphQL ops
  types/          Shared TypeScript types
```
