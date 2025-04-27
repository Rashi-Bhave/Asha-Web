import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import Login from './Components/Login/Login.jsx'
import Register from './Components/Register/Register.jsx'
import Home from './Components/Home/Home.jsx'
import { Toaster } from 'react-hot-toast'
import Profile from './Components/Profile/Profile.jsx'
import EditProfile from './Components/Profile/EditProfile.jsx'
import Discuss from './Components/Discuss/Discuss.jsx'
import AllProblems from './Components/Problemset/AllProblems.jsx'
import Problem from './Components/Problemset/Problem.jsx'
import JoinInterview from './Components/InterviewRooms/JoinInterview.jsx'
import {Provider} from 'react-redux'
import store from './Store/store.js'
import Room from './Components/InterviewRooms/Room.jsx'
import Loading from './Components/Loading/Loading.jsx'
import HostInterview from './Components/InterviewRooms/HostInterview.jsx'
// Import Admin components
import Admin from './Components/Admin/Admin.jsx'
import CreateProblem from './Components/Admin/CreateProblem.jsx'
// Import Career Visualizer component
import CareerVisualizer from './Components/CareerVisualizer/CareerVisualizer.jsx'
// Import Interview Preparation Components
import InterviewPreparation from './Components/InterviewSimulator/InterviewPreparation.jsx'
import InterviewSimulator from './Components/InterviewSimulator/InterviewSimulator.jsx'
import CustomInterviewBuilder from './Components/InterviewSimulator/CustomInterviewBuilder.jsx'
import QuestionBank from './Components/InterviewSimulator/QuestionBank.jsx'
import InterviewAnalytics from './Components/InterviewSimulator/InterviewAnalytics.jsx'
import SavedQuestions from './Components/InterviewSimulator/SavedQuestions.jsx'
import InterviewReport from './Components/InterviewSimulator/InterviewReport.jsx'
// Import new Interview components
import CustomInterviewsPage from './Components/InterviewSimulator/CustomInterviewsPage.jsx'
import InterviewReports from './Components/InterviewSimulator/InterviewReports.jsx'

import ChatInterface from './Components/Chat/ChatInterface.jsx'
import JobsPage from './Components/Jobs/JobsPage.jsx'
// Import Mentorship components

// Import Mentorship components
// Import Mentorship components
import { 
  MentorshipContextProvider, 
  MentorshipDashboard,
  MentorshipSessions 
} from './Components/Mentorship'
import MentorshipSessionsPage from './Components/Mentorship/MentorshipSessionsPage.jsx'
import MentorshipMeeting from './Components/Mentorship/MentorshipMeeting.jsx'
import MentorDashboard from './Components/Mentorship/MentorDashboard.jsx'

import EventsPage from './Components/Events/EventsPage.jsx'
import EventDetailPage from './Components/Events/EventDetailPage.jsx'


// Wrap the Mentorship component with the provider
const MentorshipWithProvider = () => (
  <MentorshipContextProvider>
    <MentorshipDashboard />
  </MentorshipContextProvider>
);

// Wrap the MentorshipSessionsPage with the provider
const MentorshipSessionsWithProvider = () => (
  <MentorshipContextProvider>
    <MentorshipSessionsPage />
  </MentorshipContextProvider>
);

let router=createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='/login' element={<Login/>}/>
      <Route path='/register' element={<Register/>}/>
      <Route path='/profile' element=<Profile/>/>
      <Route path='' element={<App/>}>
        <Route path='/' element=<Home/>/>
        <Route path='/discuss' element=<Discuss/>/>
        <Route path='/problems' element=<AllProblems/>/>
        <Route path='/join-interview' element=<JoinInterview/>/>
        <Route path='/host-interview' element=<HostInterview/>/>
        <Route path='/editprofile' element=<EditProfile/>/>
        <Route path="/problems/:id" element={<Problem/>}/>
        <Route path='/loading' element={<Loading/>}/>
        {/* Career Visualizer route */}
        <Route path='/career' element=<CareerVisualizer/>/>
        {/* Interview Preparation routes */}
        <Route path='/interview-prep' element=<InterviewPreparation/>/>
        <Route path='/interview-simulator' element=<InterviewSimulator/>/>
        <Route path='/custom-interview' element=<CustomInterviewBuilder/>/>
        <Route path='/custom-interview/:id' element=<CustomInterviewBuilder/>/>
        <Route path='/custom-interviews' element=<CustomInterviewsPage/>/>
        <Route path='/question-bank' element=<QuestionBank/>/>
        <Route path='/interview-analytics' element=<InterviewAnalytics/>/>
        <Route path='/saved-questions' element=<SavedQuestions/>/>
        <Route path='/interview-report/:sessionId' element=<InterviewReport/>/>
        <Route path='/interview-reports' element=<InterviewReports/>/>

        <Route path='/chat' element=<ChatInterface/>/>

        <Route path='/jobs' element=<JobsPage/>/>

        <Route path='/events' element=<EventsPage/>/>
        <Route path='/events/:id' element=<EventDetailPage/>/>


        {/* Mentorship Routes */}
        <Route path='/mentorship' element=<MentorshipWithProvider/>/>
        <Route path='/mentorship/:category' element=<MentorshipWithProvider/>/>
        <Route path='/mentorship-sessions' element=<MentorshipSessionsWithProvider/>/>
        <Route path='/mentorship-meeting/:sessionId' element=<MentorshipMeeting/>/>
        <Route path='/mentor-dashboard' element=<MentorDashboard/>/>

        {/* Admin routes */}
        <Route path='/admin' element={<Admin/>}/>
        <Route path='/admin/problems/create' element={<CreateProblem/>}/>
      </Route>
      <Route path='/room/:roomId' element=<Room/>/>
    </>
  )
)

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <StrictMode>
      <Toaster position='bottom-right' toastOptions={{duration:3000}}/>
      <RouterProvider router={router}/>
    </StrictMode>
  </Provider>
)