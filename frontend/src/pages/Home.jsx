import React from 'react'
import Header from '../components/Header'
import ServiceMenu from '../components/ServiceMenu'
import TopServices from '../components/TopServices'
import Banner from '../components/Banner'

const Home = () => {
  return (
    <div>
        <Header />
        <ServiceMenu />
        <TopServices />
        <Banner />
    </div>
  )
}

export default Home