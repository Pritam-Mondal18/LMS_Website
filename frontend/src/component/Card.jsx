import React from "react";
import { FaStar } from "react-icons/fa6";
import { serverUrl } from "../App";

function Card({thumbnail,title,category,price,id}){
    return (
        <div className="max-w-sm w-full bg-whitevrounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-300">
            {/* <img src={`${serverUrl}/${thumbnail}`} alt="" className="w-full h-48 object-cover"/> */}
            <img alt="Thumnail" src={thumbnail?.startsWith("http") ? thumbnail : `${serverUrl}/${thumbnail}`} className="w-full h-48 object-cover"/>
            
            <div className="p-5 space-y-2">
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                <span className="px-2 py-0.5 bg-gray-100 rounded-full text-gray-700 capitalize">{category}</span>
                <div className="flex justify-between text-sm text-gray-600 mt-3 px-[10px]">
                    <span className="font-semibold text-gray-800">{price}</span>
                    <span className="flex items-center gap-1"><FaStar className="text-yellow-500"/>5</span>
                </div>
            </div>
        </div>
    )
}

export default Card