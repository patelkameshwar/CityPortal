import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Header = () => {
  const navigate = useNavigate()

  return (
    <div className='flex flex-col-reverse md:flex-row items-center bg-gray-200 rounded-lg px-4 sm:px-6 md:px-10 lg:px-14 my-10 md:my-16 gap-6'>

      {/* Left Side */}
      <div className='flex-1 py-6 sm:py-8 md:py-12 lg:py-16 text-center md:text-left'>
        <div className='text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold text-gray-800'>
          <p>What is in City Today?</p>
          <p className='text-sm sm:text-base md:text-lg text-gray-600 mt-2'>
            Stay updated with CityPortal
          </p>
        </div>

        <div className='flex flex-col sm:flex-row items-center md:items-start justify-center md:justify-start gap-3 text-gray-800 text-sm sm:text-base mt-6'>
          <img
            className='w-16 sm:w-20'
            src={assets.groupprofiles}
            alt='profiles'
          />
          <p className='text-center md:text-left'>
            Visit the city with our extensive list of Hotels, Events, Tourism
            <br className='hidden sm:block' />
            and schedule your booking
          </p>
        </div>

        <button
          onClick={() => {
            navigate('/login')
            window.scrollTo(0, 0)
          }}
          className='bg-gray-800 text-gray-200 text-sm sm:text-base px-6 sm:px-8 py-2.5 sm:py-3 rounded-full mt-6 hover:scale-105 transition-all'
        >
          Book now
        </button>
      </div>

      {/* Right Side */}
      <div className='w-full md:w-1/2 flex justify-center'>
        <img
          className='w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg object-contain'
          src={assets.headers}
          alt='header'
        />
      </div>
    </div>
  )
}

export default Header
