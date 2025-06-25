import axios from "axios";
import { useContext, useEffect, useState, createContext } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth, } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BACKENF_URL;
axios.defaults.withCredentials = true;


const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const currency = import.meta.env.VITE_CURRENCY || "$";
    const navigate = useNavigate();
    const { user } = useUser();
    const { getToken } = useAuth();

    const [isOwner, setIsOwner] = useState(false);
    const [showHotelReg, setShowHotelReg] = useState();
    const [searchedCities, setSearchedCities] = useState([]);
    const [rooms, setRooms] = useState([]);


    const fetchRoom = async () => {
        try {
            const { data } = await axios.get("/api/rooms", {
                headers: { Authorization: `Bearer ${await getToken()}` },
            });
            if (data.success) {
                setRooms(data.rooms)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const fetchUser = async () => {
        try {
            const { data } = await axios.get("/api/user", {
                headers: { Authorization: `Bearer ${await getToken()}` },
            });
            if (data.success) {
                setIsOwner(data.role === "hotelOwner");
                setSearchedCities(data.recentSearchedCities);
            } else {
                setTimeout(fetchUser, 5000);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if (user) {
            fetchUser();
        }
    }, [user]);

    useEffect(() => {

        fetchRoom();

    }, []);

    const value = {
        currency,
        navigate,
        user,
        getToken,
        isOwner,
        setIsOwner,
        axios,
        showHotelReg,
        setShowHotelReg,
        searchedCities,
        setSearchedCities,
        rooms,
        setRooms
    }
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

const useAppContext = () => useContext(AppContext);
export { useAppContext };