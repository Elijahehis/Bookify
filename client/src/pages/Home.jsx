import React from 'react'
import Hero from '../components/Hero'
import FeaturedDestination from '../components/FeaturedDestination'
import ExclusiveOffers from '../components/ExclusiveOffers'
import Testimonial from '../components/Testimonial'
import NewSettler from '../components/Newsletter'
import Newsletter from '../components/Newsletter'
import RecommendedHotel from '../components/RecommendedHotel'

const Home = () => {
    return (
        <>
            <Hero />
            <RecommendedHotel />
            <FeaturedDestination />
            <ExclusiveOffers />
            <Testimonial />
            <Newsletter />
        </>
    )
}

export default Home