# Contributing to Booking Meeting App

Thank you for your interest in contributing to the Booking Meeting App! 🎉 We welcome contributions from developers of all skill levels. Whether you're fixing bugs, adding features, improving documentation, or suggesting ideas, your help is greatly appreciated.

This guide will help you get started with setting up your development environment and contributing to the project.

## Fork and Clone the Repository

1. **Fork the Repository**: Click the "Fork" button at the top right of this repository's page on GitHub. This creates a copy of the repository in your GitHub account.

2. **Clone Your Fork**: Clone your forked repository to your local machine:
   ```bash
   git clone https://github.com/YOUR_USERNAME/booking-meeting-app.git
   cd booking-meeting-app
   ```

3. **Set Up Upstream Remote**: Add the original repository as an upstream remote to keep your fork in sync:
   ```bash
   git remote add upstream https://github.com/joytivism/booking-meeting-app.git
   ```

## Setting Up Your Local Environment

1. **Install Dependencies**: Ensure you have Node.js (version 18 or higher) installed. Then, install the project dependencies:
   ```bash
   npm install
   ```

2. **Environment Variables**: Copy the example environment file and configure it for your local setup:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and fill in your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key.

   You can get these from your Supabase dashboard under Settings > API.

3. **Run the Development Server**: Start the local development server:
   ```bash
   npm run dev
   ```

   The app should now be running at `http://localhost:3000`.

## Database Setup

If you need to set up a local database or seed data:

1. **Create a Supabase Project**: Sign up for Supabase and create a new project.

2. **Run the Seed Script**: Execute the seed script to create the necessary tables and sample data:
   - Go to your Supabase dashboard.
   - Navigate to the SQL Editor.
   - Copy and paste the contents of `supabase/seed.sql`.
   - Run the script to set up your database schema.

This will create the `bookings` table and add some sample data for testing.

## Pull Request Guidelines

We use GitHub Pull Requests to review and merge contributions. Here's how to create a good PR:

1. **Create a Feature Branch**: Always create a new branch for your changes. Use descriptive names (see Branch Naming below).

2. **Make Your Changes**: Implement your feature or fix, ensuring you follow the project's coding standards.

3. **Test Your Changes**: Run the test suite to make sure everything works:
   ```bash
   npm test
   ```

4. **Commit Your Changes**: Write clear, concise commit messages. Use the imperative mood (e.g., "Add feature" not "Added feature").

5. **Push and Create PR**: Push your branch to your fork and create a Pull Request against the `main` branch of the original repository.

6. **PR Description**: Provide a clear description of what your PR does, why it's needed, and any relevant context. Reference any related issues.

7. **Code Review**: Be open to feedback and make requested changes. Once approved, your PR will be merged!

## Branch Naming

Use descriptive, lowercase branch names with hyphens. Prefix with the type of change:

- `feature/add-google-calendar-integration` - for new features
- `fix/booking-validation-bug` - for bug fixes
- `docs/update-contributing-guide` - for documentation updates
- `refactor/cleanup-date-helpers` - for code refactoring

## Additional Notes

- **Code Style**: We use ESLint for code linting. Run `npm run lint` to check your code.
- **Testing**: Write tests for new features and ensure existing tests pass.
- **Issues**: If you find a bug or have a feature request, please create an issue first before working on it.
- **Questions**: Feel free to ask questions in the issues or discussions section.

Thank you again for contributing! Your efforts help make this project better for everyone. 🚀