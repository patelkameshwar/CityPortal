import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Hotels from './pages/Hotels'
import Events from './pages/Events'
import Tourism from './pages/Tourism'
import Blogs from './pages/Blogs'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'
import MyProfile from './pages/MyProfile'
import MyBookings from './pages/MyBookings'
import Navbar from './components/Navbar'

const App = () => {
  return (
    <AuthProvider>
      <div className='mx-4 sm:mx-[10%]'>
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/hotels' element={<Hotels />} />
          <Route path='/events' element={<Events />} />
          <Route path='/tourism' element={<Tourism />} />
          <Route path='/blogs' element={<Blogs />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/my-profile' element={<MyProfile />} />
          <Route path='/my-bookings' element={<MyBookings />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App

