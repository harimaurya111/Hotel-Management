import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { useUser, useAuth } from "@clerk/clerk-react"
import toast from "react-hot-toast";
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL

const AppContext = createContext()

export const AppProvider = ({ children }) => {
    const currency = import.meta.env.CURRENCY || "$"
    const navigate = useNavigate()
    const { user } = useUser()
    const { getToken } = useAuth()

    const [isOwner, setIsOwner] = useState(false)
    const [showHotelReg, setShowHotelReg] = useState(false)
    const [searchCities, setSearchCities] = useState([])

    const fetchUser = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get("/api/user", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            if (data.success) {
                setIsOwner(data.role === "hotelOwner")
                setSearchCities(data.recentSearchedCities)
            } else {
                setTimeout(() => {
                    fetchUser()
                }, 5000);
            }
        } catch (error) {
            toast.error(error.message)
        }
    }


    useEffect(() => {
        if (user) {
            fetchUser()
        }
    }, [user])


    const value = { currency, navigate, user, getToken, axios, isOwner, setIsOwner, showHotelReg, setShowHotelReg, setSearchCities, searchCities }
    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>)
}
export const useAppContext = () => useContext(AppContext)