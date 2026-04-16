import React from "react";
import { FaStar } from "react-icons/fa6";
import { serverUrl } from "../App";

function Card({thumbnail,title,category,price,id}){
    return (
        <div className="w-full max-w-sm mx-auto bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-gray-200">
            {/* <img src={`${serverUrl}/${thumbnail}`} alt="" className="w-full h-48 object-cover"/> */}
            <img alt="Thumnail" src={thumbnail?.startsWith("http") ? thumbnail : `${serverUrl}/${thumbnail}`} className="w-full h-36 sm:h-40 md:h-44 object-cover"/>
            
            <div className="p-4 space-y-2">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h2>
                <span className="px-2 py-0.5 bg-gray-100 rounded-full text-gray-700 capitalize">{category}</span>
                <div className="flex justify-between text-sm text-gray-600 mt-3 px-2">
                    <span className="font-semibold text-gray-800">{price}</span>
                    <span className="flex items-center gap-1"><FaStar className="text-yellow-500"/>5</span>
                </div>
            </div>
        </div>
    )
}

export default Card