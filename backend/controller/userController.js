// import User from "../models/userModel.js";
import uploadOnCloudinary from "../config/cloudinary.js";
import User from "../model/userModel.js";
// import { toast } from "react-toastify";

export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ user });
    }catch (error) {
        return res.status(500).json({ message: `Error fetching user data: ${error}` });
    }
}

// export const updateProfile = async (req, res) => {
//     try{
//         const userId = req.userId
//         const { description,name } = req.body
//         let photoUrl 
//         if(req.file){
//             // photoUrl = await uploadOnCloudinary(req.file.path)
//             const uploaded = await uploadOnCloudinary(req.file.path)
//             photoUrl = uploaded.secure_url
//         }
//         const user = await User.findByIdAndUpdate(userId, { name, description, photoUrl }, { new: true })
//         if(!user){
//             return res.status(404).json({ message: "User not found" })
//         }
//         await user.save()
//         return res.status(200).json({ message: "Profile updated successfully", user });
//     }catch(error){
//         return res.status(500).json({ message: `Error updating profile: ${error}` });  
//     }
// }

export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { description, name } = req.body;

    let updateData = { name, description };

    if (req.file) {
      const uploaded = await uploadOnCloudinary(req.file.path);

      // ✅ SAFE CHECK (VERY IMPORTANT)
      if (!uploaded || !uploaded.secure_url) {
        return res.status(500).json({
          message: "Image upload failed"
        });
      }

      updateData.photoUrl = uploaded.secure_url;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user
    });

  } catch (error) {
    return res.status(500).json({
      message: `Error updating profile: ${error.message}`
    });
  }
};