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

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error.message);
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
  console.log("🗑️  Database cleared");
};

const seedBatches = async () => {
  const batches = [];
  for (let year = 2000; year <= 2024; year++) {
    batches.push({
      year,
      name: `Batch of ${year}`,
      passoutYear: year + 12,
      totalStudents: Math.floor(Math.random() * 50) + 30,
      groupPhoto: `https://picsum.photos/800/600?random=${year}`,
      description: `The batch of ${year} was known for their excellence in academics and sports.`,
    });
  }
  await Batch.insertMany(batches);
  console.log(`✅ Created ${batches.length} batches`);
  return batches;
};

const seedUsers = async (batches) => {
  const firstNames = [
    "Aditya",
    "Anjali",
    "Arjun",
    "Divya",
    "Krishna",
    "Lakshmi",
    "Manish",
    "Neha",
    "Priya",
    "Rahul",
    "Rohan",
    "Sanjay",
    "Shalini",
    "Sneha",
    "Suresh",
    "Vikram",
    "Amit",
    "Deepak",
    "Kiran",
    "Madhav",
    "Nisha",
    "Pooja",
    "Rajesh",
    "Ramesh",
    "Ravi",
    "Sachin",
    "Sandeep",
    "Shyam",
    "Varun",
    "Vivek",
    "Ankit",
    "Bhavana",
    "Chetan",
    "Gautam",
    "Harish",
    "Kavita",
    "Meena",
    "Naveen",
    "Prakash",
    "Shilpa",
    "Sumit",
    "Swati",
    "Tarun",
    "Usha",
    "Vinay",
    "Yogesh",
    "Asha",
    "Bala",
    "Gopal",
    "Hari",
    "Jay",
    "Kamala",
    "Lata",
    "Maya",
    "Nanda",
    "Om",
  ];

  const lastNames = [
    "Kumar",
    "Sharma",
    "Singh",
    "Nair",
    "Pillai",
    "Menon",
    "Rao",
    "Reddy",
    "Krishnan",
    "Iyer",
    "Chopra",
    "Gupta",
    "Verma",
    "Jain",
    "Agarwal",
    "Patel",
    "Shah",
    "Mehta",
    "Mishra",
    "Pandey",
    "Desai",
    "Kulkarni",
    "Joshi",
    "Bhat",
    "Shetty",
    "Hegde",
    "Das",
    "Dutta",
    "Mukherjee",
    "Banerjee",
  ];

  const cities = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Hyderabad",
    "Chennai",
    "Kolkata",
    "Pune",
    "Ahmedabad",
    "Thiruvananthapuram",
    "Kochi",
    "Kozhikode",
    "Thrissur",
    "London",
    "New York",
    "Singapore",
    "Dubai",
    "Sydney",
    "Toronto",
  ];

  const professions = [
    "Software Engineer",
    "Doctor",
    "Teacher",
    "Entrepreneur",
    "Lawyer",
    "Banker",
    "Consultant",
    "Engineer",
    "Architect",
    "Designer",
    "Manager",
    "Data Scientist",
    "Product Manager",
    "Business Analyst",
    "Researcher",
  ];

  const industries = [
    "Technology",
    "Healthcare",
    "Education",
    "Finance",
    "Consulting",
    "Manufacturing",
    "Retail",
    "E-commerce",
    "Media",
    "Government",
  ];

  const users = [];

  // Create admin user
  users.push({
    firstName: "Admin",
    lastName: "JNVTAA",
    email: "admin@jnvtaa.org",
    password: "admin123",
    batch: batches[Math.floor(Math.random() * batches.length)]._id,
    role: "admin",
    isVerified: true,
    phone: "+91 9876543210",
    currentCity: "Thiruvananthapuram",
    currentCountry: "India",
    profession: "Administrator",
    company: "JNVTAA",
    bio: "Managing the JNVTAA platform and community.",
  });

  // Create regular users
  for (let i = 0; i < 60; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    users.push({
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      password: "password123",
      batch: batches[Math.floor(Math.random() * batches.length)]._id,
      phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      dateOfBirth: new Date(
        1985 + Math.floor(Math.random() * 20),
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1
      ),
      gender: ["male", "female"][Math.floor(Math.random() * 2)],
      avatar: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`,
      bio: `Passionate about ${industries[
        Math.floor(Math.random() * industries.length)
      ].toLowerCase()} and innovation. JNV Trivandrum alumnus.`,
      currentCity: cities[Math.floor(Math.random() * cities.length)],
      currentCountry: "India",
      profession: professions[Math.floor(Math.random() * professions.length)],
      company: [
        "Google",
        "Microsoft",
        "Amazon",
        "TCS",
        "Infosys",
        "Wipro",
        "Cognizant",
        "Self-employed",
      ][Math.floor(Math.random() * 8)],
      industry: industries[Math.floor(Math.random() * industries.length)],
      role: i < 5 ? "moderator" : "user",
      isVerified: i < 50,
      socialLinks: {
        linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
      },
    });
  }

  await User.insertMany(users);
  console.log(`✅ Created ${users.length} users`);
  return users;
};

const seedEvents = async (users, batches) => {
  const eventTypes = [
    "reunion",
    "annual_meet",
    "virtual",
    "social",
    "workshop",
  ];
  const venues = [
    "JNV Trivandrum Campus",
    "Hotel Taj Vivanta",
    "Online - Zoom",
    "City Center Convention Hall",
    "Alumni Club House",
  ];

  const events = [];

  for (let i = 0; i < 20; i++) {
    const isUpcoming = i < 8;
    const eventDate = new Date();
    if (isUpcoming) {
      eventDate.setDate(
        eventDate.getDate() + Math.floor(Math.random() * 180) + 10
      );
    } else {
      eventDate.setDate(eventDate.getDate() - Math.floor(Math.random() * 365));
    }

    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const isVirtual = type === "virtual";

    events.push({
      title: `${
        type === "reunion"
          ? "Grand Reunion"
          : type === "annual_meet"
          ? "Annual Alumni Meet"
          : type === "workshop"
          ? "Career Workshop"
          : "Social Gathering"
      } ${new Date().getFullYear() + (isUpcoming ? 0 : -1)}`,
      description: `Join us for an exciting ${type} event. Reconnect with old friends, network with fellow alumni, and create new memories.`,
      type,
      date: eventDate,
      location: {
        venue: isVirtual
          ? "Virtual Event"
          : venues[Math.floor(Math.random() * venues.length)],
        address: isVirtual ? "" : "Trivandrum, Kerala",
        city: "Thiruvananthapuram",
        country: "India",
        isVirtual,
        virtualLink: isVirtual ? "https://zoom.us/j/123456789" : "",
      },
      coverImage: `https://picsum.photos/1200/600?random=${i}`,
      organizer: users[Math.floor(Math.random() * 10)]._id,
      targetBatches: [batches[Math.floor(Math.random() * batches.length)]._id],
      registrationRequired: true,
      maxAttendees: isVirtual ? 500 : 150,
      status: isUpcoming ? "upcoming" : "completed",
      tags: ["networking", "reunion", "alumni"],
    });
  }

  await Event.insertMany(events);
  console.log(`✅ Created ${events.length} events`);
  return events;
};

const seedNews = async (users) => {
  const categories = [
    "achievement",
    "event",
    "announcement",
    "alumni_story",
    "school_update",
  ];

  const newsTitles = [
    "JNV Trivandrum Alumni Makes it to Forbes 30 Under 30",
    "Annual Alumni Meet 2024 - A Grand Success",
    "New Scholarship Program Launched for Current Students",
    "Alumni Spotlight: Journey from JNV to Silicon Valley",
    "School Infrastructure Development Update",
    "Alumni Cricket Tournament Announced",
    "Distinguished Alumnus Award Winners 2024",
    "Virtual Career Guidance Session by Senior Alumni",
    "JNV Trivandrum Celebrates 40 Years of Excellence",
    "Alumni Donation Fund Reaches 50 Lakhs Milestone",
    "From JNV to IIT: An Inspiring Journey",
    "School Library Renovation Completed",
    "Alumni Mentorship Program Launch",
    "Sports Day Memories: Then and Now",
    "Alumni in Civil Services - Success Stories",
    "New Computer Lab Inaugurated with Alumni Support",
    "Alumni Reunion Photo Gallery 2023",
    "Student Exchange Program Announcement",
    "Alumni Business Directory Now Live",
    "Golden Jubilee Celebrations Planning Committee Formed",
  ];

  const news = [];

  for (let i = 0; i < newsTitles.length; i++) {
    news.push({
      title: newsTitles[i],
      slug: newsTitles[i].toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

Detailed content about ${newsTitles[i]}. This is a significant development for our alumni community. We are proud to share this achievement with all our members.

The event/achievement highlights the spirit of JNV Trivandrum and showcases the excellence of our alumni network. We encourage all members to participate and contribute to such initiatives.

For more information, please contact the alumni office or visit our website regularly for updates.`,
      excerpt: `${newsTitles[i]} - Read the full story about this exciting development in the JNV Trivandrum alumni community.`,
      coverImage: `https://picsum.photos/1000/600?random=${i + 100}`,
      author: users[Math.floor(Math.random() * 10)]._id,
      category: categories[Math.floor(Math.random() * categories.length)],
      tags: ["alumni", "jnv", "trivandrum"],
      isPublished: true,
      publishedAt: new Date(
        Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
      ),
      views: Math.floor(Math.random() * 500) + 50,
    });
  }

  await News.insertMany(news);
  console.log(`✅ Created ${news.length} news articles`);
  return news;
};

const seedGallery = async (users, batches, events) => {
  const categories = ["event", "batch", "campus", "achievement", "reunion"];
  const gallery = [];

  for (let i = 0; i < 100; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];

    gallery.push({
      title: `${category.charAt(0).toUpperCase() + category.slice(1)} Memory ${
        i + 1
      }`,
      description: `Beautiful memories from our JNV Trivandrum days. This captures the essence of our time together.`,
      type: i % 10 === 0 ? "video" : "image",
      url: `https://picsum.photos/800/600?random=${i + 200}`,
      thumbnail: `https://picsum.photos/400/300?random=${i + 200}`,
      uploadedBy: users[Math.floor(Math.random() * users.length)]._id,
      category,
      batch:
        category === "batch"
          ? batches[Math.floor(Math.random() * batches.length)]._id
          : undefined,
      event:
        category === "event"
          ? events[Math.floor(Math.random() * events.length)]._id
          : undefined,
      tags: ["memories", "jnv", "nostalgia"],
      isApproved: i < 90,
      isPublished: true,
    });
  }

  await Gallery.insertMany(gallery);
  console.log(`✅ Created ${gallery.length} gallery items`);
  return gallery;
};

const seedDonations = async (users) => {
  const campaigns = [
    {
      title: "New Computer Lab for Students",
      description:
        "Help us build a state-of-the-art computer lab with 50 new computers for current students.",
      goal: 2500000,
      raised: 1800000,
      category: "infrastructure",
      coverImage: "https://picsum.photos/800/600?random=501",
      status: "active",
    },
    {
      title: "Student Scholarship Fund 2024",
      description:
        "Support meritorious students from economically weaker sections with scholarships.",
      goal: 1000000,
      raised: 750000,
      category: "scholarship",
      coverImage: "https://picsum.photos/800/600?random=502",
      status: "active",
    },
    {
      title: "Annual Sports Meet Sponsorship",
      description:
        "Sponsor the annual sports meet and help nurture young talent in sports.",
      goal: 500000,
      raised: 500000,
      category: "event",
      coverImage: "https://picsum.photos/800/600?random=503",
      status: "completed",
    },
    {
      title: "Library Expansion Project",
      description:
        "Expand our library with new books, digital resources, and reading spaces.",
      goal: 1500000,
      raised: 950000,
      category: "infrastructure",
      coverImage: "https://picsum.photos/800/600?random=504",
      status: "active",
    },
    {
      title: "Emergency Relief Fund",
      description:
        "Support students and families affected by natural disasters or emergencies.",
      goal: 2000000,
      raised: 450000,
      category: "emergency",
      coverImage: "https://picsum.photos/800/600?random=505",
      status: "active",
    },
  ];

  const createdCampaigns = [];
  for (const campaign of campaigns) {
    const created = await DonationCampaign.create({
      ...campaign,
      createdBy: users[0]._id,
    });
    createdCampaigns.push(created);
  }

  console.log(`✅ Created ${createdCampaigns.length} donation campaigns`);
  return createdCampaigns;
};

const seedJobs = async (users) => {
  const jobTitles = [
    "Senior Software Engineer",
    "Product Manager",
    "Data Scientist",
    "Business Analyst",
    "UI/UX Designer",
    "DevOps Engineer",
    "Marketing Manager",
    "Sales Executive",
    "HR Manager",
    "Financial Analyst",
  ];

  const companies = [
    "Google India",
    "Microsoft",
    "Amazon",
    "TCS",
    "Infosys",
    "Wipro",
    "Accenture",
    "Deloitte",
    "KPMG",
    "Startup XYZ",
  ];

  const industries = [
    "Technology",
    "Consulting",
    "Finance",
    "E-commerce",
    "Healthcare",
  ];

  const jobs = [];

  for (let i = 0; i < 15; i++) {
    jobs.push({
      title: jobTitles[Math.floor(Math.random() * jobTitles.length)],
      company: companies[Math.floor(Math.random() * companies.length)],
      description: `We are looking for a talented professional to join our team. This is an exciting opportunity to work on cutting-edge projects and grow your career.

Responsibilities:
- Lead and manage projects
- Collaborate with cross-functional teams
- Drive innovation and excellence
- Mentor junior team members

What we offer:
- Competitive compensation
- Great work culture
- Learning opportunities
- Career growth`,
      requirements:
        "Bachelor's degree in relevant field. 3+ years of experience. Strong communication skills.",
      location: {
        city: ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai"][
          Math.floor(Math.random() * 5)
        ],
        country: "India",
        isRemote: i % 3 === 0,
      },
      employmentType: ["full-time", "contract", "internship"][
        Math.floor(Math.random() * 3)
      ],
      experienceLevel: ["entry", "mid", "senior"][
        Math.floor(Math.random() * 3)
      ],
      industry: industries[Math.floor(Math.random() * industries.length)],
      skills: ["JavaScript", "Python", "React", "Node.js", "AWS", "SQL"].slice(
        0,
        Math.floor(Math.random() * 4) + 2
      ),
      salary: {
        min: 600000 + Math.floor(Math.random() * 500000),
        max: 1200000 + Math.floor(Math.random() * 1000000),
        currency: "INR",
        isNegotiable: true,
      },
      postedBy: users[Math.floor(Math.random() * 10)]._id,
      applicationEmail: "careers@example.com",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: "active",
      isPublished: true,
      views: Math.floor(Math.random() * 200) + 20,
    });
  }

  await Job.insertMany(jobs);
  console.log(`✅ Created ${jobs.length} job listings`);
  return jobs;
};

const seedDatabase = async () => {
  try {
    await connectDB();
    await clearDatabase();

    const batches = await seedBatches();
    const users = await seedUsers(batches);
    const events = await seedEvents(users, batches);
    const news = await seedNews(users);
    const gallery = await seedGallery(users, batches, events);
    const campaigns = await seedDonations(users);
    const jobs = await seedJobs(users);

    console.log("\n✨ Database seeded successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - ${batches.length} batches`);
    console.log(`   - ${users.length} users`);
    console.log(`   - ${events.length} events`);
    console.log(`   - ${news.length} news articles`);
    console.log(`   - ${gallery.length} gallery items`);
    console.log(`   - ${campaigns.length} donation campaigns`);
    console.log(`   - ${jobs.length} job listings`);
    console.log("\n👤 Admin credentials:");
    console.log("   Email: admin@jnvtaa.org");
    console.log("   Password: admin123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
