import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { CoursesProvider } from "./Context/CourseContext.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CoursesProvider>
      <App />
    </CoursesProvider>
  </StrictMode>,
)
