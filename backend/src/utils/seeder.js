require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User.model");
const Course = require("../models/Course.model");
const Test = require("../models/Test.model");
const Blog = require("../models/Blog.model");
const Testimonial = require("../models/Testimonial.model");
const Enrollment = require("../models/Enrollment.model");
const Payment = require("../models/Payment.model");
const Assignment = require("../models/Assignment.model");
const Ticket = require("../models/Ticket.model");
const Settings = require("../models/Settings.model");

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("DB connected for seeding...");

    // Clear existing data
    await User.deleteMany();
    await Course.deleteMany();
    await Test.deleteMany();
    await Blog.deleteMany();
    await Testimonial.deleteMany();
    await Enrollment.deleteMany();
    await Payment.deleteMany();
    await Assignment.deleteMany();
    await Ticket.deleteMany();
    await Settings.deleteMany();
    console.log("Cleared existing collections.");

    // 1. Create Admins and Teachers
    const admin = await User.create({
      name: "Sumit Chakraborty Admin",
      email: "pritammondal18012003@gmail.com",
      password: "Admin@2026",
      role: "admin",
      isVerified: true,
      isApproved: true,
      isActive: true,
    });

    const teacher1 = await User.create({
      name: "Subir Sen (HOD Physics)",
      email: "teacher@subiracademy.com",
      password: "Teacher@123",
      role: "teacher",
      isVerified: true,
      isApproved: true,
      isActive: true,
      qualification: "M.Sc. Physics (IIT Kharagpur)",
      experience: "12+ Years",
      specialization: "Physics for JEE/NEET",
      bio: "Former Allen and Physics Wallah Senior Faculty member.",
    });

    const teacher2 = await User.create({
      name: "Amit Kumar",
      email: "amit.kumar@gmail.com",
      password: "Teacher@123",
      role: "teacher",
      isVerified: true,
      isApproved: false, // Pending approval
      isActive: true,
      qualification: "Ph.D. Chemistry (DU)",
      experience: "8 Years",
      specialization: "Organic Chemistry",
      bio: "Passionate chemistry educator specializing in organic mechanisms.",
    });

    const teacher3 = await User.create({
      name: "Priya Singh",
      email: "priya.singh@gmail.com",
      password: "Teacher@123",
      role: "teacher",
      isVerified: true,
      isApproved: false, // Pending approval
      isActive: true,
      qualification: "M.Sc. Zoology",
      experience: "6 Years",
      specialization: "Biology for NEET",
      bio: "Committed to making biology intuitive through diagrams and visual memory aids.",
    });

    console.log("Seeded admins and teachers.");

    // Helper for historical dates
    const getPastDate = (monthsAgo, daysOffset = 0) => {
      const d = new Date();
      d.setMonth(d.getMonth() - monthsAgo);
      d.setDate(d.getDate() + daysOffset);
      return d;
    };

    // 2. Create Students with different creation dates (last 6 months)
    const studentsData = [
      { name: "Sumit Sen", email: "sumit@gmail.com", createdAt: getPastDate(5, -10) },
      { name: "Rohan Das", email: "student@subiracademy.com", createdAt: getPastDate(4, -5) },
      { name: "Arjun Singh", email: "arjun@gmail.com", createdAt: getPastDate(3, -2) },
      { name: "Riya Das", email: "riya@gmail.com", createdAt: getPastDate(2, -12) },
      { name: "Karan Mehta", email: "karan@gmail.com", createdAt: getPastDate(1, -20) },
      { name: "Rohit Sharma", email: "rohit@gmail.com", createdAt: getPastDate(0, -14) },
      { name: "Neha Verma", email: "neha@gmail.com", createdAt: getPastDate(0, -8) },
      { name: "Priya Sharma", email: "priyash@gmail.com", createdAt: getPastDate(0, -2) },
    ];

    const students = [];
    for (const s of studentsData) {
      const student = await User.create({
        name: s.name,
        email: s.email,
        password: "Student@123",
        role: "student",
        isVerified: true,
        isActive: true,
        createdAt: s.createdAt,
      });
      students.push(student);
    }
    console.log(`Seeded ${students.length} students across the last 6 months.`);

    try {
      await Course.collection.dropIndexes();
      console.log("Dropped course indexes to reset text index configuration.");
    } catch (err) {
      console.log("No indexes to drop.");
    }

    // 3. Create Courses
    const courses = await Course.insertMany([
      {
        title: "Complete JEE Advanced Physics Mastery",
        description: "Master Electrostatics, Mechanics, Optics and Modern Physics specifically tailored for JEE Advanced Aspirants. Includes PDFs, daily practice problems (DPP), and test series.",
        shortDescription: "Master JEE Advanced Physics with top faculty.",
        price: 4999,
        discountPrice: 2999,
        category: "jee",
        subject: "Physics",
        level: "advanced",
        instructor: teacher1._id,
        language: "Hindi & English",
        isPublished: true,
        isApproved: true,
        isFeatured: true,
        features: ["150+ Hours Live & Recorded Classes", "Weekly Mock Tests with Analytics", "Personal Mentorship", "Custom Practice Sheets (DPP)"],
        requirements: ["Basic Class 10 Physics concepts", "Working knowledge of Calculus"],
        whatYouLearn: ["Visualize complex mechanics problems", "Solve circuits in seconds using advanced shortcuts", "Excel in JEE Advanced Numerical questions"],
        lessons: [
          {
            title: "Introduction to Electrostatics & Coulomb's Law",
            description: "Understand charges, permittivity, and electrostatic force calculations.",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            duration: 45,
            isPreview: true,
          },
        ],
        totalEnrolled: 3,
      },
      {
        title: "NEET Biology Crack Course: Human Physiology",
        description: "Deep dive into digestion, respiration, circulation and excretion with high-yield diagrams, memory tricks, and direct NCERT-based questions.",
        shortDescription: "Excel in Human Physiology for NEET 2026.",
        price: 2499,
        discountPrice: 1499,
        category: "neet",
        subject: "Biology",
        level: "intermediate",
        instructor: teacher1._id,
        language: "Hindi & English",
        isPublished: true,
        isApproved: true,
        isFeatured: true,
        features: ["50+ Hours Live Classes", "1000+ NCERT Based MCQs", "Doubt Clearing Sessions", "Mind Maps & Short Notes PDF"],
        lessons: [
          {
            title: "Digestion and Absorption - High Yield",
            description: "Detailed walkthrough of digestive system enzymes and structures.",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            duration: 50,
            isPreview: true,
          },
        ],
        totalEnrolled: 2,
      },
      {
        title: "Class 12 Boards Chemistry Prep",
        description: "Full CBSE & State Boards preparation for Chemistry theory and practicals.",
        shortDescription: "Score 95%+ in Class 12 Boards Chemistry.",
        price: 1999,
        discountPrice: 999,
        category: "boards-11-12",
        subject: "Chemistry",
        level: "intermediate",
        instructor: teacher1._id,
        language: "Hindi & English",
        isPublished: true,
        isApproved: true,
        isFeatured: false,
        features: ["Boards Mock Exams", "Chapterwise PDF Notes", "Previous 10 Years Question Analysis"],
        lessons: [
          {
            title: "Solid State Basics",
            description: "Introduction to crystal lattices and unit cells.",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            duration: 40,
            isPreview: true,
          },
        ],
        totalEnrolled: 1,
      },
      {
        title: "Foundation Science Class 10",
        description: "Comprehensive Science curriculum mapping to CBSE Grade 10 concepts.",
        shortDescription: "Build strong fundamentals in Physics, Chemistry, and Biology.",
        price: 1499,
        discountPrice: 599,
        category: "foundation",
        subject: "Science",
        level: "beginner",
        instructor: teacher1._id,
        language: "Hindi & English",
        isPublished: true,
        isApproved: true,
        isFeatured: false,
        features: ["Daily Quizzes", "Live Experiments", "Visual concept explanations"],
        lessons: [
          {
            title: "Chemical Reactions and Equations",
            description: "Learn to balance chemical equations step-by-step.",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            duration: 35,
            isPreview: true,
          },
        ],
        totalEnrolled: 1,
      },
    ]);

    console.log("Seeded courses.");

    // 4. Seed Payments & Enrollments (Historical matching of enrollment categories)
    // We want payments spread out in: Dec, Jan, Feb, Mar, Apr, May
    const paymentsData = [
      { user: students[0]._id, course: courses[0]._id, amount: 2999, status: "paid", createdAt: getPastDate(5, -8) },
      { user: students[1]._id, course: courses[0]._id, amount: 2999, status: "paid", createdAt: getPastDate(4, -3) },
      { user: students[2]._id, course: courses[1]._id, amount: 1499, status: "paid", createdAt: getPastDate(3, -1) },
      { user: students[3]._id, course: courses[2]._id, amount: 999, status: "paid", createdAt: getPastDate(2, -10) },
      { user: students[4]._id, course: courses[3]._id, amount: 599, status: "paid", createdAt: getPastDate(1, -15) },
      { user: students[5]._id, course: courses[0]._id, amount: 2999, status: "paid", createdAt: getPastDate(0, -12) },
      { user: students[7]._id, course: courses[1]._id, amount: 1499, status: "paid", createdAt: getPastDate(0, -1) },
      // Refunded transaction
      { user: students[1]._id, course: courses[1]._id, amount: 1499, status: "refunded", createdAt: getPastDate(1, -5) },
      // Pending transactions
      { user: students[6]._id, course: courses[0]._id, amount: 2999, status: "pending", createdAt: getPastDate(0, -7) },
      { user: students[3]._id, course: courses[0]._id, amount: 2999, status: "pending", createdAt: getPastDate(0, -2) },
    ];

    for (let i = 0; i < paymentsData.length; i++) {
      const p = paymentsData[i];
      const payment = await Payment.create({
        user: p.user,
        course: p.course,
        amount: p.amount,
        status: p.status,
        orderId: `order_${Date.now()}_${i}`,
        paymentId: p.status === "paid" ? `pay_mock_${Date.now()}_${i}` : undefined,
        method: "mock",
        paidAt: p.status === "paid" ? p.createdAt : undefined,
        createdAt: p.createdAt,
      });

      // If status is paid, create corresponding enrollment
      if (p.status === "paid") {
        await Enrollment.create({
          user: p.user,
          course: p.course,
          payment: payment._id,
          enrolledAt: p.createdAt,
          progressPercent: Math.floor(Math.random() * 60) + 10,
          isActive: true,
          createdAt: p.createdAt,
        });
      }
    }

    console.log("Seeded payments & enrollments history.");

    // 5. Seed Assignments
    const assignment1 = await Assignment.create({
      title: "Electrostatics Assignment 1",
      description: "Solve all problems related to Coulomb's Law and electric field intensity.",
      course: courses[0]._id,
      instructor: teacher1._id,
      dueDate: getPastDate(-1, 5), // Due next month
      totalMarks: 50,
      submissions: [
        {
          student: students[1]._id,
          submittedAt: getPastDate(0, -1),
          fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          comment: "Sir, I have doubts in question 4.",
          grade: 45,
          isGraded: true,
          feedback: "Great work! Keep it up.",
        },
      ],
      isPublished: true,
    });

    await Assignment.create({
      title: "Digestion High-Yield Short Assignment",
      description: "Draw the labeled diagram of the human digestive system and write enzyme functions.",
      course: courses[1]._id,
      instructor: teacher1._id,
      dueDate: getPastDate(0, 10),
      totalMarks: 30,
      submissions: [],
      isPublished: true,
    });

    console.log("Seeded class assignments.");

    // 6. Create Tests
    await Test.create({
      title: "Electrostatics Part 1 - Coulomb's Law Quiz",
      description: "Quick evaluation test on Coulomb's Law and electric field fundamentals.",
      duration: 15,
      course: courses[0]._id,
      instructor: teacher1._id,
      testType: "chapter",
      category: "jee",
      isPublished: true,
      hasNegativeMarking: true,
      questions: [
        {
          text: "What is the force between two charges of 1C separated by a distance of 1m in vacuum?",
          options: [
            { label: "A", text: "9 x 10^9 N" },
            { label: "B", text: "1 N" },
            { label: "C", text: "8.85 x 10^-12 N" },
            { label: "D", text: "9 x 10^-9 N" },
          ],
          correctOption: "A",
          explanation: "According to Coulomb's Law, F = k * q1 * q2 / r^2. Since q1=q2=1C and r=1m, F = k = 9 * 10^9 N.",
          marks: 4,
          negativeMark: 1,
        },
      ],
    });

    console.log("Seeded Chapter Tests.");

    // 7. Seed Blogs
    await Blog.create({
      title: "How to Master Organic Chemistry for JEE",
      content: "<p>Organic chemistry is one of the highest-scoring sections in JEE. To master it, start by visualizing the reaction mechanisms instead of blindly memorizing them. Focus on General Organic Chemistry (GOC) and Reaction Mechanisms thoroughly.</p>",
      excerpt: "Top preparation strategies to score 100% in JEE Organic Chemistry.",
      category: "jee",
      author: admin._id,
      tags: ["Chemistry", "JEE Prep", "Study Tips"],
      isPublished: true,
      views: 142,
    });

    await Blog.create({
      title: "Time Management Secrets for NEET Aspirants",
      content: "<p>Managing time between physics numericals, chemistry equations, and extensive biology theory is key. Practice 100 MCQs daily under timed conditions to improve your velocity and accuracy.</p>",
      excerpt: "Learn how top-rankers schedule their preparation hours.",
      category: "neet",
      author: admin._id,
      tags: ["Biology", "NEET Prep", "Time Management"],
      isPublished: true,
      views: 285,
    });

    // 8. Seed Testimonials
    await Testimonial.create({
      name: "Aman Gupta",
      course: "JEE Advanced Physics Mastery",
      rating: 5,
      review: "Sumit Chakraborty Academy completely changed my perspective on Physics. The video explanation is crystal clear, and the DPPs are extremely high quality!",
      achievement: "JEE Main AIR 421",
      isApproved: true,
      isFeatured: true,
    });

    // 9. Seed Support Tickets
    await Ticket.create([
      {
        ticketId: "TK-1256",
        subject: "Payment failed but amount debited",
        message: "I tried purchasing the JEE Advanced Course. The amount of ₹2,999 got debited from my bank but the screen showed payment failed and I am not enrolled. Please resolve.",
        user: students[2]._id, // Arjun Singh
        status: "Open",
        priority: "High",
      },
      {
        ticketId: "TK-1255",
        subject: "Course content not loading",
        message: "The solid state video is loading forever. Other videos work fine. Please help.",
        user: students[3]._id, // Riya Das
        status: "In Progress",
        priority: "Medium",
      },
      {
        ticketId: "TK-1254",
        subject: "Unable to submit assignment",
        message: "When I upload my electrostatics homework PDF, it says network timeout. Is the file size limit too small?",
        user: students[4]._id, // Karan Mehta
        status: "Open",
        priority: "Medium",
      },
      {
        ticketId: "TK-1253",
        subject: "Refund request for course",
        message: "I accidentally purchased the class 10 science foundation instead of chemistry prep. Can I get a refund so I can buy the boards chemistry course?",
        user: students[6]._id, // Neha Verma
        status: "Resolved",
        priority: "Low",
      },
    ]);

    // 10. Seed Default Settings
    await Settings.create({
      academyName: "Sumit Chakraborty Academy",
      supportEmail: "support@sumitchakrabortyacademy.com",
      supportPhone: "+91 98300 98300",
      smtpHost: "smtp.gmail.com",
      smtpPort: 587,
      smtpUser: "pritammondal18012003@gmail.com",
      smtpPass: "vvco xanv krlc awuj",
      enableRegister: true,
      maintenanceMode: false,
    });

    console.log("✅ Database successfully seeded with rich historical data!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedData();
