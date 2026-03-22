import jwt from "jsonwebtoken";

const genToken = async (userId) => {
  try {
    const token = await jwt.sign({ userId }, process.env.jwt_SECRET, {
      expiresIn: "7d",
    });
    console.log(token);
  } catch (error) {
    console.log("Error while generating token", error);
  }
};

export default genToken;
