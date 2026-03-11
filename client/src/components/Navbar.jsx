
import React, { useState } from 'react';
import { assets } from '../assets/assets';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiX, FiUser, FiLogOut, FiCalendar } from 'react-icons/fi';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className='flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400'>
      <img 
        className='w-30 h-9 cursor-pointer' 
        src={assets.logo2} 
        alt="CityPortal" 
        onClick={() => navigate('/')}
      />
      
      <ul className='hidden md:flex items-start gap-5 font-medium'>
        <NavLink to='/'>
          <li className='py-1'>Home</li>
        </NavLink>
        <NavLink to='/hotels'>
          <li className='py-1'>Hotels</li>
        </NavLink>
        <NavLink to='/events'>
          <li className='py-1'>Events</li>
        </NavLink>
        <NavLink to='/tourism'>
          <li className='py-1'>Tourism</li>
        </NavLink>
        <NavLink to='/blogs'>
          <li className='py-1'>Blogs</li>
        </NavLink>
        <NavLink to='/about'>
          <li className='py-1'>About</li>
        </NavLink>
        <NavLink to='/contact'>
          <li className='py-1'>Contact</li>
        </NavLink>
      </ul>

      <div className='flex items-center gap-4'>
        {isAuthenticated ? (
          <div className='flex items-center gap-2 cursor-pointer group relative'>
            <img className='w-8 rounded-full bg-gray-200' src={assets.kaushalpic} alt="" />
            <img className='w-2.5' src={assets.dropdown} alt="" />
            <div className='absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block'>
              <div className='min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4'>
                <p className='text-gray-800 font-semibold'>{user?.name}</p>
                <hr className='border-gray-300' />
                <p onClick={() => navigate('/my-profile')} className='hover:text-black cursor-pointer flex items-center gap-2'><FiUser className="h-4 w-4" /> My Profile</p>
                <p onClick={() => navigate('/my-bookings')} className='hover:text-black cursor-pointer flex items-center gap-2'><FiCalendar className="h-4 w-4" /> My Bookings</p>
                <p onClick={handleLogout} className='hover:text-black cursor-pointer flex items-center gap-2'><FiLogOut className="h-4 w-4" /> Logout</p>
              </div>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => navigate('/login')} 
            className='bg-gray-800 text-white px-8 py-3 rounded-full font-light hidden md:block hover:bg-gray-700 transition'
          >
            Login
          </button>
        )}
        
        <button 
          className='md:hidden' 
          onClick={() => setShowMenu(!showMenu)}
        >
          {showMenu ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
        </button>
      </div>

      {showMenu && (
        <div className='fixed top-0 left-0 w-full h-full bg-white z-50 p-4 md:hidden'>
          <div className='flex justify-between items-center mb-4'>
            <img className='w-30 h-9' src={assets.logo2} alt="" />
            <button onClick={() => setShowMenu(false)}>
              <FiX className="w-6 h-6" />
            </button>
          </div>
          <ul className='flex flex-col gap-4 font-medium'>
            <NavLink to='/' onClick={() => setShowMenu(false)}>Home</NavLink>
            <NavLink to='/hotels' onClick={() => setShowMenu(false)}>Hotels</NavLink>
            <NavLink to='/events' onClick={() => setShowMenu(false)}>Events</NavLink>
            <NavLink to='/tourism' onClick={() => setShowMenu(false)}>Tourism</NavLink>
            <NavLink to='/blogs' onClick={() => setShowMenu(false)}>Blogs</NavLink>
            <NavLink to='/about' onClick={() => setShowMenu(false)}>About</NavLink>
            <NavLink to='/contact' onClick={() => setShowMenu(false)}>Contact</NavLink>
            {!isAuthenticated && (
              <NavLink to='/login' onClick={() => setShowMenu(false)}>Login</NavLink>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;

