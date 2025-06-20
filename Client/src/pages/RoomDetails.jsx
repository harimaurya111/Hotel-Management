import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { assets, facilityIcons, roomCommonData } from '../assets/assets';
import StarRating from '../components/StarRating';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const RoomDetails = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [isAvailable, setIsAvailable] = useState(false);

  const { rooms, getToken, axios, navigate } = useAppContext();

  // Check Availability
  const checkAvailability = async () => {
    try {
      if (!checkInDate || !checkOutDate) return toast.error("Please select both dates");
      if (checkInDate >= checkOutDate) {
        toast.error("Check-In Date must be earlier than Check-Out Date");
        return;
      }

      const { data } = await axios.post("/api/bookings/check-availability", {
        room: id,
        checkInDate,
        checkOutDate,
      });

      if (data.success) {
        setIsAvailable(data.isAvailable);
        toast[data.isAvailable ? 'success' : 'error'](
          data.isAvailable ? "Room is Available" : "Room is Not Available"
        );
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  // Book Room if Available
  const OnsubmitHandler = async (e) => {
    e.preventDefault();
    if (!isAvailable) return checkAvailability();

    try {
      const { data } = await axios.post(
        "/api/bookings/book",
        {
          room: id,
          checkInDate,
          checkOutDate,
          guests,
          paymentMethod: "Pay at Hotel",
        },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }
      );

      if (data.success) {
        toast.success(data.message);
        navigate("/my-bookings");
        window.scrollTo(0, 0);
      }

    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  //  Get room details on mount
  useEffect(() => {
    const selectedRoom = rooms.find(r => r._id === id);
    if (selectedRoom) {
      setRoom(selectedRoom);
      setMainImage(selectedRoom.images[0]);
    }
  }, [rooms, id]);

  if (!room) return null;

  return (
    <div className='py-28 md:py-10 px-4 md:px-16 lg:px-24 xl:px-32'>
      {/* Heading & Rating */}
      <div className='flex flex-col md:flex-row items-start md:items-center gap-2'>
        <h1 className='text-3xl md:text-4xl font-playfair'>
          {room.hotel.name}
          <span className='font-inter text-sm ml-2'>({room.roomType})</span>
        </h1>
        <p className='text-xs font-inter py-1.5 px-3 text-white bg-orange-500 rounded-full'>
          20% OFF
        </p>
      </div>
      <div className='flex items-center gap-1 mt-2'>
        <StarRating rating={room.rating} />
        <p className='ml-2'>{room.reviewCount || 0}+ reviews</p>
      </div>
      <div className='flex items-center gap-1 text-gray-500 mt-2'>
        <img src={assets.locationIcon} alt="location icon" />
        <span>{room.hotel.address}</span>
      </div>

      {/* Room Images */}
      <div className='flex flex-col lg:flex-row mt-6 gap-6'>
        <div className='lg:w-1/2'>
          <img src={mainImage} alt="Main" className='w-full rounded-xl shadow-lg object-cover' />
        </div>
        <div className='grid grid-cols-2 gap-4 lg:w-1/2'>
          {room.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt="room"
              onClick={() => setMainImage(img)}
              className={`w-full rounded-xl shadow-md object-cover cursor-pointer ${mainImage === img ? 'outline-3 outline-orange-500' : ''}`}
            />
          ))}
        </div>
      </div>

      {/* Amenities and Price */}
      <div className='flex flex-col md:flex-row md:justify-between mt-10'>
        <div>
          <h2 className='text-3xl font-playfair mb-3'>Experience Luxury Like Never Before</h2>
          <div className='flex flex-wrap gap-4'>
            {room.amenities.map((a, i) => (
              <div key={i} className='flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg'>
                <img src={facilityIcons[a]} alt={a} className='w-5 h-5' />
                <p className='text-xs'>{a}</p>
              </div>
            ))}
          </div>
        </div>
        <p className='text-2xl font-medium mt-4 md:mt-0'>${room.pricePerNight} / night</p>
      </div>

      {/* Booking Form */}
      <form 
  onSubmit={OnsubmitHandler} 
  className='flex flex-col md:flex-row items-start md:items-center justify-between bg-white shadow-[0px_0px_20px_rgba(0,0,0,0.15)] p-6 rounded-xl mx-auto mt-16 max-w-6xl'
>
  <div className='flex flex-col flex-wrap md:flex-row items-start md:items-center gap-4 md:gap-10 text-gray-500'>
    {/* Check-In */}
    <div className='flex flex-col'>
      <label htmlFor="checkInDate" className='font-medium'>Check-In</label>
      <input
        onChange={(e) => setCheckInDate(e.target.value)}
        value={checkInDate}
        min={new Date().toISOString().split('T')[0]}
        type="date"
        id="checkInDate"
        className='w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none'
        required
      />
    </div>

    {/* Vertical Divider */}
    <div className='w-px h-14 bg-gray-300/70 max-md:hidden'></div>

    {/* Check-Out */}
    <div className='flex flex-col'>
      <label htmlFor="checkOutDate" className='font-medium'>Check-Out</label>
      <input
        onChange={(e) => setCheckOutDate(e.target.value)}
        value={checkOutDate}
        min={checkInDate}
        disabled={!checkInDate}
        type="date"
        id="checkOutDate"
        className='w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none'
        required
      />
    </div>

    {/* Vertical Divider */}
    <div className='w-px h-14 bg-gray-300/70 max-md:hidden'></div>

    {/* Guests */}
    <div className='flex flex-col'>
      <label htmlFor="guests" className='font-medium'>Guests</label>
      <input
        type="number"
        id="guests"
        min={1}
        value={guests}
        onChange={(e) => setGuests(e.target.value)}
        className='max-w-20 rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none'
        required
      />
    </div>
  </div>

  {/* Submit Button */}
  <button 
    type='submit' 
    className='bg-blue-500 hover:bg-primary-dull active:scale-95 transition-all text-white rounded-md max-md:w-full max-md:mt-6 md:px-25 py-3 md:py-4 text-base cursor-pointer'
  >
    {isAvailable ? "Book Now" : "Check Availability"}
  </button>
</form>


      {/* Additional Details */}
      <div className='mt-10 space-y-4'>
        {roomCommonData.map((spec, idx) => (
          <div key={idx} className='flex items-start gap-3'>
            <img src={spec.icon} alt={spec.title} className='w-6' />
            <div>
              <p className='font-semibold'>{spec.title}</p>
              <p className='text-sm text-gray-500'>{spec.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Description */}
      <div className='my-10 py-8 border-t border-b text-gray-500'>
        <p>
          Guests will be allocated on the ground floor according to availability.
          The price quoted is for two guests. For groups, please mark the number of guests.
        </p>
      </div>

      {/* Hosted By */}
      <div className='flex flex-col gap-4'>
        <div className='flex gap-4 items-center'>
          <img src={room.hotel.owner.image} alt={room.hotel.owner.name} className='h-16 w-16 rounded-full' />
          <div>
            <p className='text-lg font-semibold'>Hosted by {room.hotel.name}</p>
            <div className='flex items-center mt-1'>
              <StarRating rating={room.hotel.rating} />
              <p className='ml-2'>200+ reviews</p>
            </div>
          </div>
        </div>
        <button className='px-6 py-2 rounded bg-primary text-white hover:bg-primary-dull'>
          Contact Now
        </button>
      </div>
    </div>
  );
};

export default RoomDetails;
