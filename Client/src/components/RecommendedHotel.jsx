import React, { useEffect, useState } from 'react';
import HotelCard from './HotelCard';
import Title from './Title';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const RecommendedHotel = () => {
    const {rooms,searchCities} = useAppContext()
    const [RecommendedHotel, setRecommendedHotel] = useState([])
    const navigate = useNavigate()

    const filterHotels = async () => {
        const filteredHotels = rooms.slice().filter((room) => searchCities.includes(room.hotel.city))
        setRecommendedHotel(filteredHotels)
    }

    useEffect(() => {
        filterHotels()
    },[rooms,searchCities])
    return RecommendedHotel.length > 0 && (
        <div className='flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 pt-20 py-5'>
            <Title title="Recommended Hotel" subTitle="Discover our handpicked selection of exceptional properties around the world,offering unparalleled luxury and unforgettable experiences." />
            <div className='flex flex-wrap items-center justify-center gap-6 mt-20'>
                {RecommendedHotel.slice(0, 4).map((room, index) => (
                    <HotelCard key={room._id} room={room} index={index} />
                ))}
            </div>
            <button onClick={() => { navigate('/rooms'); scrollTo(0, 0); }} className='my-16 px-4 py-2 text-sm font-medium border border-gray-300 rounded bg-white hover:bg-gray-50 transition-all cursor-pointer'>
             View All Destinations
            </button>
        </div>
    );
};

export default RecommendedHotel;
