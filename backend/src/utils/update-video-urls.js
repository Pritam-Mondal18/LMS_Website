require("dotenv").config();
const mongoose = require("mongoose");
const Course = require("../models/Course.model");

const run = async () => {
  if (!process.env.MONGODB_URL) {
    console.error("MONGODB_URL is not set in env");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("Connected to database successfully.");

  const courses = await Course.find();
  console.log(`Found ${courses.length} courses in database.`);
  
  let modifiedCount = 0;
  for (const course of courses) {
    let modified = false;
    for (const lesson of course.lessons) {
      if (lesson.videoUrl === "https://www.w3schools.com/html/mov_bbb.mp4" || !lesson.videoUrl) {
        console.log(`Updating lesson "${lesson.title}" in course "${course.title}"...`);
        lesson.videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
        modified = true;
      }
    }
    if (modified) {
      await course.save();
      modifiedCount++;
    }
  }
  console.log(`Update complete. Updated ${modifiedCount} courses.`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
