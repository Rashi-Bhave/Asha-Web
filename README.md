# Asha AI Chatbot Web Application

Asha AI Chatbot is a web application designed to help women with career opportunities, events, mentorship programs, and professional development. This project is a web version of the original mobile app.

## Features

- **AI Assistant**: Chat with Asha AI for personalized career guidance
- **Job Listings**: Browse and search for job opportunities
- **Events**: Discover workshops, webinars, and networking events
- **Mentorship Programs**: Find mentors to guide your professional journey
- **User Authentication**: Create an account or use as a guest
- **Responsive Design**: Works on both desktop and mobile devices

## Tech Stack

- **Frontend**: React.js, HTML5, CSS3, JavaScript (ES6+)
- **State Management**: React Context API
- **Styling**: Custom CSS with variables for theming
- **Icons**: Font Awesome
- **HTTP Client**: Axios
- **Storage**: Local Storage for persistence

## Installation and Setup

### Prerequisites

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

### Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/your-username/asha-ai-chatbot.git
cd asha-ai-chatbot
```

2. **Install dependencies**

```bash
npm install
```

3. **Create environment variables**

Create a `.env` file in the root directory with the following variables:

```
REACT_APP_API_BASE_URL=https://api.example.com
REACT_APP_ENV=development
```

4. **Start the development server**

```bash
npm start
```

The application should now be running at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
asha-ai-chatbot/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── styles/
│       └── app.css
├── src/
│   ├── api/
│   │   ├── index.js
│   │   ├── jobsApi.js
│   │   ├── eventsApi.js
│   │   └── mentorshipApi.js
│   ├── components/
│   │   ├── ChatBubble.js
│   │   ├── ChatInterface.js
│   │   ├── Header.js
│   │   ├── JobCard.js
│   │   ├── LoadingIndicator.js
│   │   ├── MessageInput.js
│   │   └── Sidebar.js
│   ├── context/
│   │   ├── AuthContext.js
│   │   └── ChatContext.js
│   ├── pages/
│   │   ├── AboutPage.js
│   │   ├── ChatPage.js
│   │   ├── EventsPage.js
│   │   ├── JobsPage.js
│   │   ├── LoginPage.js
│   │   ├── MentorshipPage.js
│   │   ├── SettingsPage.js
│   │   └── WelcomePage.js
│   ├── services/
│   │   ├── chatService.js
│   │   ├── encryptionService.js
│   │   └── storageService.js
│   ├── utils/
│   │   └── conversationUtils.js
│   ├── App.css
│   ├── App.js
│   └── index.js
├── .env
├── package.json
└── README.md
```

## Usage

### As a Guest User

1. Open the application
2. Click "Skip for now" on the welcome screen
3. Start chatting with Asha AI to explore job opportunities, events, and mentorship programs

### With an Account

1. Open the application
2. Click "Sign In / Create Account" on the welcome screen
3. Create a new account or sign in with existing credentials
4. Access all features including personalized recommendations and saved preferences

## Deployment

### Building for Production

```bash
npm run build
```

This creates a `build` directory with optimized production files.

### Deploying to a Server

Transfer the contents of the `build` directory to your web server or use a service like Netlify, Vercel, or GitHub Pages.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- This project was created for JobsForHer Foundation
- UI design inspired by modern web applications focused on user experience
- Icons provided by Font Awesome