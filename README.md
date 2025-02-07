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

## Local Database Setup with Docker

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Database Setup

1. Start the PostgreSQL database container:
```bash
docker compose up -d
```

2. Create a `.env` file in the project root and add the following environment variable:
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:54322/tweet_automation_dev"
```

3. Run database migrations (if any):
```bash
npx prisma migrate dev
```

4. Start the development server:
```bash
npm run dev
```

The PostgreSQL database will be available at:
- Host: localhost
- Port: 54322
- User: postgres
- Password: postgres
- Database: tweet_automation_dev

### Useful Commands

- Start the database: `docker compose up -d`
- Stop the database: `docker compose down`
- View database logs: `docker compose logs postgres`
- Reset database (delete all data): `docker compose down -v && docker compose up -d`

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
