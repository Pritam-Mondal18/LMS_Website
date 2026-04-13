
// import axios from 'axios'
// import React, { useEffect } from 'react'
// import { serverUrl } from '../App'
// import { useDispatch } from 'react-redux'
// import { setUserData } from '../redux/userSlice'

// const useGetCurrentUser = () => {
//     const dispatch = useDispatch()
//   useEffect(() => {
//     const fetchUser = async () => {
//         try{
//             const result = await axios.get(serverUrl + "/api/user/getcurrentuser", {withCredentials: true})
//             dispatch(setUserData(result.data.user))
//         }catch (error) {
//             // console.log(error)
//             // dispatch(setUserData(null))
//             if (error.response?.status === 401) {
//             // user not logged in → normal case
//                 dispatch(setUserData(null))
//             } else {
//                 // real error → log it
//                 console.error("Error fetching user:", error)
//             }
//         }
//     }
//     fetchUser()
//   },[])
// }

// export default useGetCurrentUser

import axios from 'axios'
import { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'

const useGetCurrentUser = () => {
    const dispatch = useDispatch()

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const result = await axios.get(
                    serverUrl + "/api/user/getcurrentuser",
                    { withCredentials: true }
                )
                dispatch(setUserData(result.data.user))
            } catch (error) {

                if (error.response?.status === 401) {
                    dispatch(setUserData(null))  // not logged in
                } else {
                    console.error("Error fetching user:", error)
                    dispatch(setUserData(null))
                }

            }
        }

        fetchUser()
    }, [])
}

export default useGetCurrentUser