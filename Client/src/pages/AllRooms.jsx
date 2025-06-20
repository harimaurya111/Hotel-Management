import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { assets, facilityIcons } from '../assets/assets'
import StarRating from '../components/StarRating'
import { useAppContext } from '../context/AppContext'

const CheckBox = ({ label, selected = false, onChange = () => {} }) => (
  <label className='flex gap-3 items-center mt-2 cursor-pointer text-sm'>
    <input
      type="checkbox"
      checked={selected}
      onChange={(e) => onChange(e.target.checked, label)}
    />
    <span className='font-light select-none leading-7'>{label}</span>
  </label>
)

const RadioButton = ({ label, selected = false, onChange = () => {} }) => (
  <label className='flex gap-3 items-center mt-2 cursor-pointer text-sm'>
    <input type="radio" checked={selected} onChange={() => onChange(label)} />
    <span className='font-light select-none'>{label}</span>
  </label>
)

const AllRooms = () => {
  const navigate = useNavigate()
  const [openFilters, setOpenFilters] = useState(false)
  const [searchParams] = useSearchParams()
  const { rooms, currency } = useAppContext()

  // Read destination from URL
  const destination = searchParams.get('destination')?.toLowerCase() || ''

  // Filters & Sorting state
  const [selectedFilters, setSelectedFilters] = useState({
    roomTypes: [],
    priceRange: [],
  })
  const [selectedSort, setSelectedSort] = useState('')

  const roomTypes = ["Single Bed", "Double Bed", "Luxury Room", "Family Suite"]
  const priceRange = ["0 to 500", "500 to 1000", "1000 to 2000", "2000 to 3000"]
  const sortOptions = ["Price Low to High", "Price High to Low", "Newest First"]

  // Handlers
  const handleRoomTypeChange = (checked, label) => {
    setSelectedFilters(prev => {
      const roomTypes = checked
        ? [...prev.roomTypes, label]
        : prev.roomTypes.filter(type => type !== label)
      return { ...prev, roomTypes }
    })
  }

  const handlePriceRangeChange = (checked, label) => {
    const range = label.replace('$ ', '')
    setSelectedFilters(prev => {
      const priceRange = checked
        ? [...prev.priceRange, range]
        : prev.priceRange.filter(p => p !== range)
      return { ...prev, priceRange }
    })
  }

  const handleSortChange = (label) => setSelectedSort(label)


  // 1) First filter by destination (if any)
  let filteredRooms = rooms.filter(room => {
    if (!destination) return true
    return room.hotel.city.toLowerCase().includes(destination)
  })

  // 2) Then apply room-type and price filters
  if (selectedFilters.roomTypes.length > 0) {
    filteredRooms = filteredRooms.filter(room =>
      selectedFilters.roomTypes.includes(room.roomType)
    )
  }
  if (selectedFilters.priceRange.length > 0) {
    filteredRooms = filteredRooms.filter(room =>
      selectedFilters.priceRange.some(range => {
        const [min, max] = range.split(' to ').map(Number)
        return room.pricePerNight >= min && room.pricePerNight <= max
      })
    )
  }

  // 3) Finally sort
  if (selectedSort === "Price Low to High") {
    filteredRooms.sort((a, b) => a.pricePerNight - b.pricePerNight)
  } else if (selectedSort === "Price High to Low") {
    filteredRooms.sort((a, b) => b.pricePerNight - a.pricePerNight)
  } else if (selectedSort === "Newest First") {
    filteredRooms.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  return (
    <div className='flex flex-col-reverse lg:flex-row items-start justify-between pt-28 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32 gap-5'>
      
      {/* Main List */}
      <div className='flex-1'>
        <div className='flex flex-col items-start text-left mb-6'>
          <h1 className='font-playfair text-4xl md:text-[40px]'>Hotel Rooms</h1>
          {destination && (
            <p className='text-gray-600 mt-1'>
              Showing results for “<strong>{destination}</strong>”
            </p>
          )}
        </div>

        {filteredRooms.map(room => (
          <div key={room._id} className="flex flex-col md:flex-row gap-6 items-start py-10 border-b border-gray-300 last:pb-30 last:border-0">
            <img
              onClick={() => { navigate(`/rooms/${room._id}`); scrollTo(0, 0) }}
              src={room.images[0]}
              alt="hotel-img"
              className="max-h-[260px] md:w-1/2 rounded-xl shadow-lg object-cover cursor-pointer"
            />
            <div className="md:w-1/2 flex flex-col gap-2">
              <p className="text-gray-500">{room.hotel?.city}</p>
              <p
                onClick={() => { navigate(`/rooms/${room._id}`); scrollTo(0, 0) }}
                className="text-gray-800 text-3xl font-playfair cursor-pointer"
              >
                {room.hotel?.name}
              </p>
              <div className="flex items-center">
                <StarRating rating={room.rating} />
                <p className="ml-2">{room.reviewCount || 0}+ reviews</p>
              </div>
              <div className='flex items-center gap-1 text-gray-500 mt-2 text-sm'>
                <img src={assets.locationIcon} alt="location-icon" />
                <span>{room.hotel?.address}</span>
              </div>
              <div className='flex flex-wrap items-center mt-1 mb-2 gap-4'>
                {room.amenities.map((item, idx) => (
                  <div key={idx} className='flex items-center gap-2 px-3 py-2 rounded-lg bg-white/70'>
                    <img src={facilityIcons[item]} alt={item} className='w-5 h-5' />
                    <p className='text-xs capitalize'>{item}</p>
                  </div>
                ))}
              </div>
              <p className='text-xl font-medium text-gray-700'>
                {currency}{room.pricePerNight}/night
              </p>
            </div>
          </div>
        ))}

        {filteredRooms.length === 0 && (
          <p className="text-center text-lg text-gray-500 mt-20">
            No rooms found.
          </p>
        )}
      </div>

      {/* Filters Panel */}
      <div className='bg-white w-80 border border-gray-300 text-gray-600 lg:mb-8 lg:mt-16'>
        <div className={`flex items-center justify-between px-5 py-2.5 border-gray-300 ${openFilters ? 'border-b' : 'lg:border-b'}`}>
          <p className='text-base font-medium text-gray-800'>FILTERS</p>
          <div className='text-xs cursor-pointer'>
            <span onClick={() => setOpenFilters(!openFilters)} className='lg:hidden'>
              {openFilters ? 'HIDE' : 'SHOW'}
            </span>
            <span className='hidden lg:block'>CLEAR</span>
          </div>
        </div>

        <div className={`${openFilters ? 'h-auto' : 'h-0 lg:h-auto'} overflow-hidden transition-all duration-700`}>
          <div className='px-5 pt-5'>
            <p className='font-medium text-gray-800 pb-2'>Popular Filters</p>
            {roomTypes.map((type, i) => (
              <CheckBox
                key={i}
                label={type}
                selected={selectedFilters.roomTypes.includes(type)}
                onChange={handleRoomTypeChange}
              />
            ))}
          </div>

          <div className='px-5 pt-5'>
            <p className='font-medium text-gray-800 pb-2'>Price Range</p>
            {priceRange.map((range, i) => (
              <CheckBox
                key={i}
                label={`$ ${range}`}
                selected={selectedFilters.priceRange.includes(range)}
                onChange={handlePriceRangeChange}
              />
            ))}
          </div>

          <div className='px-5 pt-5 pb-3'>
            <p className='font-medium text-gray-800 pb-2'>Sort By</p>
            {sortOptions.map((opt, i) => (
              <RadioButton
                key={i}
                label={opt}
                selected={selectedSort === opt}
                onChange={handleSortChange}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AllRooms
