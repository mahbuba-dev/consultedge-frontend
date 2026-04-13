This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Realtime Transport

This project uses a hybrid realtime architecture for chat:

- Native WebSocket client to `/ws/chat` for live events.
- REST API for sending text messages and file attachments.
- Automatic polling fallback (`4s`) when websocket is disconnected/reconnecting.

### Reliability Design

- Connection states: `connecting`, `connected`, `reconnecting`, `disconnected`.
- Exponential reconnect backoff: `1s`, `2s`, `4s`, ... capped at `20s`.
- Heartbeat: client sends `{"type":"ping"}` every `25s` and expects `pong`.
- Auto-reconnect if pong is missed twice.
- Per-room subscribe lifecycle using:
	- `{"type":"subscribe","roomId":"..."}`
	- `{"type":"unsubscribe","roomId":"..."}`

### Secure Auth Handshake

- Preferred auth is cookie-based browser handshake.
- Fallback mode appends `?token=<accessToken>` when a browser-accessible token exists.
- No `userId` or `role` are sent in websocket query parameters.
