import React from 'react'
import { assets } from '../assets/assets'

const Header = () => {
  return (
    <div className='flex flex-col md:flex-row flex-wrap bg-gray-200 rounded-lg px-6 md:px-10 lg:px-20'>

        {/*__________ left side ___________*/}
        <div className='md:w-1/2 flex flex-col items-start justify-center gap-4 py-10 m-auto md:py-[10vw] md:mb-[-30px]'>
            <p className='text-3xl md:text-4xl lg:text-5xl text-gray-800 font-semibold leading-tight md:leading-tight lg:leading-tight'>
                What is in City Today ?<br /> With CityPortal
            </p>
            <div className='flex flex-col md:flex-row items-center gap-3 text-gray-800 text-sm'>
                <img className='w-28' src={assets.groupprofiles} alt="" />
                <p>Visit the city with our extensive list of Hotels, Events, Toursim <br className='hidden sm:block' /> And schedule your booking</p>
            </div>
            <a href="" className='flex items-center gap-2 bg-gray-900 px-8 py-3 rounded-full text-gray-200 text-sm m-auto md:m-0 hover:scale-105 transition-all duration-300'>
                Book now <img className='w-3' src={assets.arrowicon} alt="" />
            </a>
        </div>

        {/*__________ right side ___________*/}
        <div className='md:w-1/2 relative'>
            <img className='w-full md:absolute bottom-0 h-auto rounded-lg' src={assets.headers} alt="" />
        </div>
    </div>
  )
}

export default Header