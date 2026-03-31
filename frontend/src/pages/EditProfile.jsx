// import React,{ useState } from 'react';
import React, { useState } from 'react';
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../App';
import { setUserData } from '../redux/userSlice';
import { ClipLoader } from 'react-spinners';
import { toast } from "react-toastify";
// import EditProfileForm from '../components/EditProfileForm';

function EditProfile() {
    const navigate = useNavigate();
    const {userData} = useSelector((state) => state.user);
    const [name, setName] = React.useState(userData?.name || "");
    const [description, setDescription] = React.useState(userData?.description || "")
    const [photoUrl, setPhotoUrl] = React.useState(null)
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()




    const handleEditProfile = async() => {
        setLoading(true)
    try{
        const formData = new FormData()
        formData.append("name", name)
        formData.append("description", description)
        if(photoUrl){
        formData.append("photoUrl", photoUrl)
        }

        const result = await axios.post(serverUrl+"/api/user/profile", formData, {withCredentials:true})
        dispatch(setUserData(result.data.user))
        setLoading(false)
        navigate("/")
        toast.success("Profile updated successfully")
    }catch(error){
        setLoading(false)
        console.log(error)
        toast.error(error.response.data.message || "Something went wrong")

    }
}
    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10'>
            <div className='bg-white rounded-2xl shadow-lg p-8 max-w-xl w-full relative'>
                <FaArrowLeft className='absolute top-[8%] left-[5%] w-[22px] h-[22px] cursor-pointer' onClick={()=>navigate("/profile")}/>
                    <h2 className='text-2xl font-bold text-center text-gray-800 mb-6'>Edit Profile</h2>
                    <form action="" className='space-y-5' onSubmit={(e)=>e.preventDefault()}>
                        <div className='flex flex-col items-center text-center'>
                            {userData?.photoUrl ?
                            <img src={userData.photoUrl} className='w-24 h-24 rounded-full object-cover border-4 border-[black]' alt="User Photo" /> : 
                            <div className='w-24 h-24 rounded-full text-white bg-black text-[30px] flex items-center justify-center border-2 border-white'>
                            {userData?.name?.slice(0, 1)?.toUpperCase() || "?"}
                            </div>}
                        </div>
                        <div>
                            <label htmlFor='image' className='text-sm font-medium text-gray-700'>Select Avatar</label>
                            <input type="file" id='image' 
                            name='photoUrl'
                            placeholder='PhotoUrl'
                            accept='image/*'
                            onChange={(e)=>setPhotoUrl(e.target.files[0])}
                            className='w-full px-4 py-2 border rounded-md text-sm cursor-pointer'/>
                        </div>
                        <div>
                            <label htmlFor='name' className='text-sm font-medium text-gray-700'>Name</label>
                            <input type="text" id='name' 
                            name='name'
                            placeholder={userData?.name}
                            onChange={(e)=>setName(e.target.value)} value={name}
                            className='w-full px-4 py-2 border rounded-md text-sm'/>
                        </div>
                        <div>
                            <label  className='text-sm font-medium text-gray-700'>Email</label>
                            <input type="email" readOnly 
                            name='email'
                            placeholder={userData?.email}
                            className='w-full px-4 py-2 border rounded-md text-sm '/>
                        </div>
                        <div>
                            <label  className='text-sm font-medium text-gray-700'>Description</label>
                            <textarea 
                            name='description'
                            placeholder="Tell us about yourself"
                            rows={3}
                            onChange={(e)=>setDescription(e.target.value)} value={description}
                            className='w-full mt-1 px-4 py-2 border border-gray-300 rounded-md resize-none focus:ring-[black] text-sm '/>
                        </div>
                        <button className='w-full bg-[black] active:bg-[#454545] text-white py-2 rounded-md font-medium transition cursor-pointer' disabled={loading} onClick={handleEditProfile}>{loading? <ClipLoader size={30} color='white'/>:'Save Changes'}</button>
                    </form>
            </div>
        </div>
    )
}

export default EditProfile;