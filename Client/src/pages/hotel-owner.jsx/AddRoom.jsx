import React, { useState } from 'react'
import Title from '../../components/Title'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const AddRoom = () => {

  const { axios, getToken } = useAppContext()
  const [loading, setLoading] = useState(false)

  const [images, setImages] = useState({
    1: null,
    2: null,
    3: null,
    4: null,
  })


  const [inputs, setInputs] = useState({
    roomType: '',
    pricePerNight: 0,
    amenities: {
      'Free Wifi': false,
      'Free Breakfast': false,
      'Free Service': false,
      'Mountain View': false,
      'Pool Access': false,
    }
  })

const onSubmitHandler = async (e) => {
  e.preventDefault();

  // ✅ Validation
  if (
    !inputs.roomType ||
    !inputs.pricePerNight ||
    !inputs.amenities ||
    !Object.values(images).some((img) => img)
  ) {
    toast.error("Please fill all the details");
    return;
  }

  setLoading(true);

  try {
    // ✅ Prepare FormData
    const formData = new FormData();
    formData.append("roomType", inputs.roomType);
    formData.append("pricePerNight", inputs.pricePerNight);

    const amenitiesArray = Object.keys(inputs.amenities).filter(
      (key) => inputs.amenities[key]
    );
    formData.append("amenities", JSON.stringify(amenitiesArray));

    Object.keys(images).forEach((key) => {
      if (images[key]) formData.append("images", images[key]);
    });

    // ✅ Get token from Clerk
    const token = await getToken();

    // ✅ Send request
    const { data } = await axios.post("/api/rooms", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (data.success) {
      toast.success(data.message);

      // ✅ Reset form
      setInputs({
        roomType: "",
        pricePerNight: 0,
        amenities: {
          "Free Wifi": false,
          "Free Breakfast": false,
          "Free Service": false,
          "Mountain View": false,
          "Pool Access": false,
        },
      });

      setImages({
        1: null,
        2: null,
        3: null,
        4: null,
      });
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    console.error("Add Room Error:", error);
    toast.error(error.response?.data?.message || error.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <form onSubmit={onSubmitHandler} >
      <Title align='left' font='outfit' title='Add Room' subTitle='Fill in the details carefully and accurate room details, pricing, and amenities, to enhance the user booking experience.' />

      {/* Upload Area For Images */}
      <p className='text-gray-800 mt-10 text-lg font-medium'>Images</p>
      <div className='grid grid-cols-2 sm:flex gap-4 my-2 flex-wrap'>
        {Object.keys(images).map((key) => (
          <label htmlFor={`roomImage${key}`} key={key}>
            <img
              className='max-h-13 cursor-pointer opacity-80'
              src={images[key] ? URL.createObjectURL(images[key]) : assets.uploadArea}
              alt=""
            />
            <input type="file" accept="image/*" id={`roomImage${key}`} hidden onChange={(e) =>
              setImages({ ...images, [key]: e.target.files[0] })} />
          </label>
        ))}
      </div>
      {/* Room Type */}
      <div className='w-full flex max-sm:flex-col sm:gap-4 mt-4'>
        <div className='flex-1 max-w-48'>
          <p className='text-gray-800 mt-4 text-lg font-medium'>Room Type</p>
          <select onChange={(e) => setInputs({ ...inputs, roomType: e.target.value })} value={inputs.roomType} className='border opacity-70 border-gray-300 mt-1 rounded p-2 w-full'>
            <option value="">Select Room Type</option>
            <option value="Single Bed">Single Bed</option>
            <option value="Double Bed">Double Bed</option>
            <option value="Luxury Room">Luxury Room</option>
            <option value="Family Suite">Family Suite</option>
          </select>
        </div>

        <div className=''>
          <p className='mt-4 text-gray-800'>Price <span className='text-xs'>/night  </span></p>

          <input type="number" placeholder='0' className='border border-gray-300 mt-1 rounded p-2 w-24' onChange={(e) => setInputs({ ...inputs, pricePerNight: e.target.value })} value={inputs.pricePerNight} />
        </div>
      </div>

      {/* Amenities */}
      <p class="text-gray-800 mt-4 text-lg font-medium">Amenities</p>
      <div class="flex flex-col flex-wrap mt-1 text-gray-400 max-w-sm">
        {Object.keys(inputs.amenities).map((amenity, index) => (
          <div key={index} className='flex gap-2'>
            <input onChange={() => setInputs({ ...inputs, amenities: { ...inputs.amenities, [amenity]: !inputs.amenities[amenity] } })} type="checkbox" id={`amenities${index + 1}`}
              checked={inputs.amenities[amenity]}
              className='w-3.5' />
            <label htmlFor={`amenities${index + 1}`}>{amenity}</label>
          </div>
        ))}
      </div>
      <button disabled={loading} className='bg-blue-500 text-black px-8 py-2 rounded mt-8 cursor-pointer'>{loading ? "Adding..." : "Add Room"}</button>
    </form>

  )
}

export default AddRoom