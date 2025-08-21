# Contribution Guidelines

Thank you for considering contributing to the Jotium AI Agent Platform! Your contributions help make this project even better.

## How to Contribute

We welcome contributions of all kinds, including:

*   **Bug Reports:** Identify and report issues to help us improve stability.
*   **Feature Suggestions:** Propose new features or enhancements.
*   **Code Contributions:** Submit pull requests for bug fixes, new features, or improvements.
*   **Documentation:** Improve existing documentation or add new content.

## Setting Up Your Development Environment

To get started with development, follow these steps:

1.  **Fork the Repository:** Fork the `whiterven/jotium-backup` repository to your GitHub account.
2.  **Clone Your Fork:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/jotium-backup.git
    cd jotium-backup
    ```
3.  **Install Dependencies:**
    ```bash
    npm install
    # or yarn install
    ```
4.  **Configure Environment Variables:** Create a `.env.local` file based on `.env.example` and fill in the necessary API keys and configurations (e.g., Google Gemini API key, database connection strings).
5.  **Database Setup:** Ensure your PostgreSQL database is running and configured correctly. Run migrations if necessary.
6.  **Run the Development Server:**
    ```bash
    npm run dev
    # or yarn dev
    ```
    The application should now be accessible at `http://localhost:3000`.

## Reporting Bugs

If you encounter a bug, please open an issue on the GitHub repository. When reporting, please include:

*   A clear and concise description of the bug.
*   Steps to reproduce the behavior.
*   Expected behavior.
*   Screenshots or error messages, if applicable.
*   Your operating system, browser, and Node.js version.

## Suggesting Enhancements

For feature requests or enhancements, open an issue on GitHub. Describe:

*   The proposed feature or enhancement.
*   Why it would be useful.
*   Any potential alternatives or considerations.

## Pull Request Guidelines

Before submitting a pull request, please ensure:

1.  **Branching:** Create a new branch from `main` for your changes (e.g., `feature/my-new-feature` or `bugfix/fix-issue-123`).
2.  **Code Style:** Adhere to the existing code style. We use Prettier for formatting.
3.  **Tests:** If applicable, add unit or integration tests for your changes.
4.  **Commit Messages:** Write clear and concise commit messages.
    *   Use the present tense ("Add feature" instead of "Added feature").
    *   Start with a capital letter.
    *   Limit the first line to 72 characters.
5.  **Documentation:** Update relevant documentation for any new features or significant changes.
6.  **Review:** Your pull request will be reviewed by maintainers. Be prepared to address feedback.

## Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project, you agree to abide by its terms.
