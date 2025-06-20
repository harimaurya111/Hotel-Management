import React from 'react'
import Hero from '../components/Hero'
import FeaturedDestination from '../components/FeaturedDestination'
import ExclusiveOffers from '../components/ExclusiveOffers'
import Testimonial from '../components/Testimonials'
import NewsLatter from '../components/NewsLatter'
import RecommendedHotel from '../components/RecommendedHotel'

const Home = () => {
    return (
        <div>
            <Hero />
            <FeaturedDestination/>
            <RecommendedHotel/>
            <ExclusiveOffers/>
            <Testimonial/>
            <NewsLatter/>
        </div>
    )
}

export default Home