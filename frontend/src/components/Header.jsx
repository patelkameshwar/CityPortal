import React from 'react'
import { assets } from '../assets/assets'

const Header = () => {
  return (
    <div className='flex bg-gray-200 rounded-lg px-6 sm:px-10 md:px-14 lg:px-12 my-20 mt-4'>

        {/*__________ left side ___________*/}
        <div className='flex-1 py-8 sm:py-10 md:py-16 lg:py-24 lg:pl-5'>
            <div className='text-xl mt-19 sm:text-2xl md:text-3xl lg:text-5xl font-semibold text-gray-800'>
                <p>What is in City Today ?</p>
                <p className=' text-lg text-gray-600 mt-2'>Stay update with CityPortal</p>
            </div>
            <div className='flex flex-col md:flex-row items-center gap-3 text-gray-800 text-base'>
                <img className='w-20 mt-8' src={assets.groupprofiles} alt="" />
                <p className='mt-8'>Visit the city with our extensive list of Hotels, Events, Toursim <br className='hidden sm:block' /> And schedule your booking</p>
            </div>
            <button onClick={()=>{navigate('/register'); scrollTo(0,0)}} className='bg-gray-800 text-gray-200 text-sm sm:text-base px-8 py-3 rounded-full mt-4 hover:scale-105 transition-all'>Book now</button>
        </div>
        
        {/* ________ Right Side _________ */}
                <div className='hidden md:block md:w-1/2 lg:w-117.5 relative'>
                    <img className='w-full absolute bottom-12 right-0 max-w-md h-auto' src={assets.headers} alt="" />
                </div>

        
    </div>
  )
}

export default Header