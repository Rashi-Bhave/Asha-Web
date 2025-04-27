import MentorshipContextProvider, { useMentorship } from './MentorshipContextProvider';
import MentorshipDashboard from './MentorshipDashboard';
import MentorCard from './MentorCard';
import MentorshipProgram from './MentorshipProgram';
import BookSessionModal from './BookSessionModal';
import ProgramDetailsModal from './ProgramDetailsModal';
import NotFound from './NotFound';
import MentorshipPage from './MentorshipPage';
import MentorshipSessions from './MentorshipSessions'; // Import the new component

export {
    MentorshipContextProvider,
    useMentorship,
    MentorshipDashboard,
    MentorCard,
    MentorshipProgram,
    BookSessionModal,
    ProgramDetailsModal,
    NotFound,
    MentorshipPage,
    MentorshipSessions // Export the new component
};

// Default export for simpler import
export default MentorshipDashboard;