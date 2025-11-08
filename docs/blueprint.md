# **App Name**: PerFinRule

## Core Features:

- User Authentication: Secure user authentication via Firebase Authentication (email/password, Google Sign-In).
- Income and Expense Tracking: Record income and expenses with categorization (Needs 50%, Wants 30%, Savings 20%).
- Automatic Category Assignment: AI-powered tool to automatically categorize transactions based on type or amount using predefined rules.
- Real-time Financial Visualization: Display dynamic charts (e.g., with Chart.js) for financial balance and 50/30/20 rule adherence.
- Personalized Notifications: Send automatic notifications when category limits are exceeded, providing personalized financial insights.
- Data Security: Implement Firebase Security Rules to ensure each user can only access their financial data stored in Cloud Firestore.
- Data Persistence: Utilize Firestore to save transaction data.

## Style Guidelines:

- Primary color: Deep teal (#008080) for a sense of trust and financial stability.
- Background color: Light grayish-teal (#E0F8F8) for a calm, uncluttered interface.
- Accent color: Muted gold (#B8860B) for highlighting key metrics and actions.
- Body and headline font: 'Inter', a grotesque-style sans-serif for its clean and objective appearance.
- Use minimalistic icons to represent transaction categories.
- Prioritize a clean, intuitive layout that follows Jakob Nielsen's usability principles for easy navigation.
- Use subtle transitions and animations to provide feedback and enhance user experience.