import React from 'react'
import { serviceData } from '../assets/assets'
import { Link } from 'react-router-dom'

const ServiceMenu = () => {
  return (
    <div className='flex flex-col items-center py-16 text-gray-800 -mt-12 px-4' id='service'>
      
      <h1 className='text-3xl font-medium'>Our Services</h1>
      <p className='sm:w-1/3 text-center text-base mt-2'>
        Explore our wide range of services including hotels, tourism, events, and more.
      </p>

      <div className='flex gap-4 pt-5 w-full overflow-x-auto sm:overflow-visible sm:justify-center'> 
        {serviceData.map((item, index) => (
          <Link
            key={index}
            to={`/${item.speciality.toLowerCase()}`}
            onClick={() => window.scrollTo(0, 0)}
            className='flex flex-col items-center text-xs cursor-pointer shrink-0 hover:-translate-y-2.5 transition-all duration-500'
          >
            <div className='w-20 sm:w-28 h-20 sm:h-28 rounded-full bg-linear-to-b from-gray-600 to-gray-300 flex items-center justify-center mb-2 overflow-hidden'>
              <img className='w-14 sm:w-20' src={item.image} alt='' />
            </div>
            <p className='text-base'>{item.speciality}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default ServiceMenu