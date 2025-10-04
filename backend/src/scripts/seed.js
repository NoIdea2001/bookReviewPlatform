const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("../config/db");
const User = require("../models/user.model");
const Book = require("../models/book.model");
const Review = require("../models/review.model");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const usersData = [
  {
    name: "Ava Martin",
    email: "ava@example.com",
    password: "password123",
  },
  {
    name: "Liam Chen",
    email: "liam@example.com",
    password: "password123",
  },
  {
    name: "Sofia Patel",
    email: "sofia@example.com",
    password: "password123",
  },
];

const buildBooksPayload = (userIds) => [
  {
    title: "Project Hail Mary",
    author: "Andy Weir",
    description:
      "A stranded astronaut must save humanity—and himself—in this high-stakes science fiction adventure.",
    genre: "Science Fiction",
    year: 2021,
    addedBy: userIds["ava@example.com"],
  },
  {
    title: "The Midnight Library",
    author: "Matt Haig",
    description:
      "Between life and death lies a library that lets you explore all the lives you could have lived.",
    genre: "Fantasy",
    year: 2020,
    addedBy: userIds["liam@example.com"],
  },
  {
    title: "Educated",
    author: "Tara Westover",
    description:
      "A memoir about breaking away from a survivalist family to pursue education and redefine a life.",
    genre: "Memoir",
    year: 2018,
    addedBy: userIds["sofia@example.com"],
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    description:
      "Practical strategies to form good habits, break bad ones, and become 1% better every day.",
    genre: "Self-Help",
    year: 2018,
    addedBy: userIds["ava@example.com"],
  },
];

const buildReviewsPayload = (userIds, bookIds) => [
  {
    bookId: bookIds["Project Hail Mary"],
    userId: userIds["liam@example.com"],
    rating: 5,
    reviewText:
      "An inventive, heartfelt story with gripping science and a protagonist you root for immediately.",
  },
  {
    bookId: bookIds["Project Hail Mary"],
    userId: userIds["sofia@example.com"],
    rating: 4,
    reviewText:
      "Fun, fast-paced, and surprisingly emotional. The science tidbits were delightful!",
  },
  {
    bookId: bookIds["The Midnight Library"],
    userId: userIds["ava@example.com"],
    rating: 4,
    reviewText:
      "A warm reflection on choices and regret. The central concept hooked me from the start.",
  },
  {
    bookId: bookIds["The Midnight Library"],
    userId: userIds["sofia@example.com"],
    rating: 3,
    reviewText:
      "Loved the premise, though the ending wrapped up a bit too neatly for my taste.",
  },
  {
    bookId: bookIds["Educated"],
    userId: userIds["ava@example.com"],
    rating: 5,
    reviewText:
      "Intense and inspiring. Tara's story is a powerful reminder of the impact of education.",
  },
  {
    bookId: bookIds["Atomic Habits"],
    userId: userIds["liam@example.com"],
    rating: 4,
    reviewText:
      "Clear, actionable framework for building habits. I've already implemented several tips.",
  },
];

const seed = async () => {
  try {
    await connectDB();

    console.log("Clearing existing data...");
    await Promise.all([
      Review.deleteMany({}),
      Book.deleteMany({}),
      User.deleteMany({}),
    ]);

    console.log("Creating users...");
    const createdUsers = await User.create(usersData);
    const userIds = createdUsers.reduce((acc, user) => {
      acc[user.email] = user._id;
      return acc;
    }, {});

    console.log("Creating books...");
    const booksPayload = buildBooksPayload(userIds);
    const createdBooks = await Book.insertMany(booksPayload);
    const bookIds = createdBooks.reduce((acc, book) => {
      acc[book.title] = book._id;
      return acc;
    }, {});

    console.log("Creating reviews...");
    const reviewsPayload = buildReviewsPayload(userIds, bookIds);
    await Review.insertMany(reviewsPayload);

    console.log("Database seeded successfully ✅");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seed();
