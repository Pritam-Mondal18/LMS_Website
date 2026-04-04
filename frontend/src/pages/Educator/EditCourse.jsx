import React, { useRef, useState } from 'react';
import {FaArrowLeftLong} from 'react-icons/fa6';
import {useNavigate} from 'react-router-dom';
import empty from '../../assets/empty.jpg';

function EditCourse() {
    const navigate = useNavigate();
    const thumb = useRef()
    const [isPublished, setIsPublished] = useState(false);
    return(
        <div className='max-w-5xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-md'>
            {/* top bar */}
            <div className='flex items-center justify-center gap-[20px] md:justify-between flex-col md:flex-row mb-6 relative'>
                <FaArrowLeftLong className='top-[-20%] md:top-[20%] absolute left-[0] md:left-[2%] w-[22px] h-[22px] cursor-pointer' onClick={()=>navigate('/courses')}/>
                    <h2 className='text-2xl font-semibold md:pl-[60px]'>Add Detail Information regarding the Course</h2>
                    <button className='bg-black text-white px-4 py-2 rounded-md'>Go to Lecture page</button>
                </div>
            {/* form details */}
            <div className='bg-gray-50 p-6 rounded-md'> 
                <h2 className='text-lg font-medium mb-4'>Basic Course Information</h2>
                <div className='space-x-2 space-y-2'>
                    {!isPublished?<button className='bg-green-100 text-green-600 px-4 py-2 rounded-md border-1 cursor-pointer' onClick={() => setIsPublished(prev => !prev)}>Click to Publish</button>:<button className='bg-pink-100 text-pink-600 px-4 py-2 rounded-md border-1 cursor-pointer' onClick={() => setIsPublished(prev => !prev)}>Click to UnPublish</button>}
                    <button className='bg-red-100 text-red-600 px-4 py-2 rounded-md border-1 cursor-pointer'>Remove Course</button>
                </div>
                <form className='space-y-6'>
                    <div>
                        <label htmlFor="title" className='block text-sm font-medium text-gray-700 mb-1'>Title</label>
                        <input id='title' type="text" placeholder='Course Title' className='w-full border px-4 py-2 rounded-md' />
                    </div>

                     <div>
                        <label htmlFor="subtitle" className='block text-sm font-medium text-gray-700 mb-1'>SubTitle</label>
                        <input id='subtitle' type="text" placeholder='Course SubTitle' className='w-full border px-4 py-2 rounded-md' />
                    </div>

                     <div>
                        <label htmlFor="description" className='block text-sm font-medium text-gray-700 mb-1'>Description</label>
                        <textarea id='description' placeholder='Course Description' className='w-full border px-4 py-2 rounded-md h-24 resize-none' />
                    </div>

                    <div className='flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0'>
                        {/* for category  */}
                        <div className='flex-1'>
                            <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-1'>course Category</label>
                            <select name="" id="" className='w-full border px-4 py-2 rounded-md bg-white'>
                                <option value="">Select Category</option>
                                <option value="Math">Math</option>
                                <option value="Physics">Physics</option>
                                <option value="Chemistry">Chemistry</option>
                                <option value="Biology">Biology</option>
                                <option value="Commerce">Commerce</option>
                                <option value="Arts">Arts</option>
                                <option value="Others">Others</option>
                            </select>
                            </div>
                        {/* for level */}
                        <div className='flex-1'>
                            <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-1'>course Level</label>
                            <select name="" id="" className='w-full border px-4 py-2 rounded-md bg-white'>
                                <option value="">Select Level</option>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                            </div>
                        {/* for price */}
                        <div className='flex-1'>
                            <label htmlFor="price" className='block text-sm font-medium text-gray-700 mb-1'>course Price(INR)</label>
                            <input type="number" id="price" className='w-full border px-4 py-2 rounded-md' placeholder='₹'/>
                        </div>
                        <div>
                            <label htmlFor="thumbnail" className='block text-sm font-medium text-gray-700 mb-1'>Course Thumbnail</label>
                            <input type="file" id="thumbnail" hidden ref={thumb} accept='image/*'/>
                        </div>
                        <div className='relative w-[300px] h-[170px]'>
                            <img src={empty} alt='' className='w-[100%] h-[100%] border-black rounded-[5px]' onClick={()=>thumb.current.onClick}/>
                        </div>
                    </div>

                    <button>efb</button>


                </form>
            </div>
            </div>
    )
}

export default EditCourse;