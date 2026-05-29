import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../modules/users/users.model.js";
import Batch from "../modules/batches/batches.model.js";
import Event from "../modules/events/events.model.js";
import News from "../modules/news/news.model.js";
import Gallery from "../modules/gallery/gallery.model.js";
import {
  DonationCampaign,
  Donation,
} from "../modules/donations/donations.model.js";
import Job from "../modules/jobs/jobs.model.js";
import SiteContent from "../modules/site-content/site-content.model.js";
import { ROLES } from "../config/roles.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

const clearDatabase = async () => {
  await User.deleteMany({});
  await Batch.deleteMany({});
  await Event.deleteMany({});
  await News.deleteMany({});
  await Gallery.deleteMany({});
  await DonationCampaign.deleteMany({});
  await Donation.deleteMany({});
  await Job.deleteMany({});
  await SiteContent.deleteMany({});
  console.log("Database cleared");
};

const seedSuperAdmin = async () => {
  const email =
    process.env.SUPER_ADMIN_EMAIL?.toLowerCase() || "superadmin@jnvtaa.org";
  const password = process.env.SUPER_ADMIN_PASSWORD || "superadmin123";

  const superAdmin = await User.create({
    firstName: "Platform",
    lastName: "Admin",
    email,
    password,
    role: ROLES.SUPER_ADMIN,
    isVerified: true,
    isActive: true,
  });

  console.log(`Created super admin: ${superAdmin.email}`);
  return { superAdmin, password };
};

const seedDatabase = async () => {
  try {
    await connectDB();
    await clearDatabase();

    const { superAdmin, password } = await seedSuperAdmin();

    console.log("\nDatabase seeded successfully!");
    console.log("\nPlatform super admin credentials (not an alumni member):");
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Password: ${password}`);
    console.log(
      "\nNote: Create batches and other master data from the admin panel before member registration."
    );

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
