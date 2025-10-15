# Finance Tracker


Finance Tracker is a comprehensive, full-stack application designed to help users manage their personal finances effectively. It provides an intuitive interface for tracking income and expenses, managing multiple wallets, and analyzing spending habits.

## Features

- **Secure Authentication**: User registration and login system powered by `better-auth`.
- **Dashboard Overview**: A centralized view of your total balance, monthly income/expense, savings, and recent transactions.
- **Multi-Wallet Management**: Create, edit, and delete various types of wallets (e.g., Cash, Card, Bank, Digital).
- **Transaction Logging**: Easily add, edit, and delete income and expense records with detailed descriptions.
- **Inter-Wallet Transfers**: Seamlessly move funds between your wallets.
- **Dynamic Activity Feed**: Filter transactions by type (income, expense, transfer, adjustment) and time period (monthly, yearly, custom range).
- **Financial Summaries**: View aggregated data for total income, expenses, and net amount based on selected filters.
- **Responsive Design**: A fully responsive user interface built with Shadcn/UI and Tailwind CSS for a seamless experience on any device.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn/UI](https://ui.shadcn.com/)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Authentication**: [better-auth](https://www.npmjs.com/package/better-auth)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/)
- **Schema Validation**: [Zod](https://zod.dev/)

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- Node.js (v18 or later)
- pnpm (v10 or later)
- Docker or Podman

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/usman-rizwan/Finance-Tracker.git
    cd Finance-Tracker
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file by copying the example file:
    ```bash
    cp .env.example .env
    ```
    Populate the `.env` file with your database URL and authentication secrets. You will need to set:
    - `DATABASE_URL`: Your PostgreSQL connection string. The default works with the provided Docker setup.
    - `BETTER_AUTH_SECRET`: A secret key for signing authentication tokens.
    - `BETTER_AUTH_URL`: The base URL of your application (e.g., `http://localhost:3000`).

4.  **Start the database:**
    The repository includes a script to start a PostgreSQL database in a Docker container.
    ```bash
    ./start-database.sh
    ```
    This script uses the `DATABASE_URL` from your `.env` file to configure the container.

5.  **Apply database migrations:**
    This will set up the database schema.
    ```bash
    pnpm db:generate
    ```

6.  **Run the development server:**
    ```bash
    pnpm dev
    ```
    The application will be available at `http://localhost:3000`.

## Available Scripts

The `package.json` file contains several scripts for running and managing the application:

- `pnpm dev`: Starts the development server with Hot-Module Replacement.
- `pnpm build`: Creates a production-ready build of the application.
- `pnpm start`: Starts the production server.
- `pnpm preview`: Builds and previews the production version.
- `pnpm db:generate`: Applies database migrations during development.
- `pnpm db:migrate`: Deploys database migrations.
- `pnpm db:studio`: Opens Prisma Studio to view and manage your database.
