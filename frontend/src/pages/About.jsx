import { FaGraduationCap, FaHandshake, FaHeart, FaUsers } from "react-icons/fa";
import Timeline from "@/components/Timeline";

export default function About() {
  const values = [
    {
      icon: <FaGraduationCap className="text-4xl" />,
      title: "Excellence",
      description:
        "Upholding the tradition of academic and personal excellence that JNV instilled in us.",
      color: "bg-blue-500",
    },
    {
      icon: <FaHandshake className="text-4xl" />,
      title: "Networking",
      description:
        "Building meaningful connections among alumni across generations and geographies.",
      color: "bg-green-500",
    },
    {
      icon: <FaHeart className="text-4xl" />,
      title: "Giving Back",
      description:
        "Supporting current students and contributing to the growth of our alma mater.",
      color: "bg-red-500",
    },
    {
      icon: <FaUsers className="text-4xl" />,
      title: "Community",
      description:
        "Fostering a sense of belonging and camaraderie among all JNV Trivandrum alumni.",
      color: "bg-purple-500",
    },
  ];

  const leadership = [
    { name: "Dr. Rajesh Kumar", batch: "1995", role: "President" },
    { name: "Priya Menon", batch: "2000", role: "Vice President" },
    { name: "Arun Nair", batch: "2005", role: "Secretary" },
    { name: "Anjali Sharma", batch: "2008", role: "Treasurer" },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container-custom text-center">
          <h1 className="text-5xl font-bold mb-4">About JNVTAA</h1>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto">
            Connecting hearts, building futures - The Jawahar Navodaya Vidyalaya
            Thiruvananthapuram Alumni Association
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="card p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Our Mission
              </h2>
              <p className="text-gray-600 leading-relaxed">
                To create a vibrant and engaged community of JNV Trivandrum
                alumni that supports each other's personal and professional
                growth, contributes to the development of current students, and
                preserves the rich legacy of our institution for future
                generations.
              </p>
            </div>
            <div className="card p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Our Vision
              </h2>
              <p className="text-gray-600 leading-relaxed">
                To be the most connected and impactful alumni network, where
                every member feels valued and empowered to contribute to the
                collective success of our community and our alma mater.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-gray-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="text-center p-8 bg-white rounded-xl hover:shadow-lg transition-shadow"
              >
                <div
                  className={`${value.color} w-20 h-20 rounded-full flex items-center justify-center text-white mx-auto mb-4`}
                >
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
              Our Story
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
              <p className="animate-fade-in">
                Jawahar Navodaya Vidyalaya Thiruvananthapuram has been a beacon
                of educational excellence since its inception. Our alumni have
                gone on to achieve remarkable success in diverse fields across
                the globe.
              </p>

              <p className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
                The JNVTAA was founded to bring together this incredible
                community of achievers and create a platform for meaningful
                engagement, networking, and giving back to our beloved
                institution.
              </p>

              <p className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
                Today, JNVTAA represents hundreds of alumni from various
                batches, spanning multiple decades. We organize regular
                reunions, professional networking events, mentorship programs,
                and fundraising initiatives to support current students.
              </p>

              <p className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
                Our association is built on the foundation of the values we
                learned at JNV - excellence, integrity, social responsibility,
                and the spirit of community service. We continue to embody these
                values in all our endeavors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container-custom">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-lg text-gray-600">
              Key milestones in our remarkable history
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <Timeline />
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Leadership Team
            </h2>
            <p className="text-lg text-gray-600">
              Meet the people leading JNVTAA
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {leadership.map((leader, index) => (
              <div key={index} className="card text-center p-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                  {leader.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {leader.name}
                </h3>
                <p className="text-primary-600 font-semibold mb-1">
                  {leader.role}
                </p>
                <p className="text-sm text-gray-500">Batch of {leader.batch}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Contribute */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">
              How You Can Contribute
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="card p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Mentorship
                </h3>
                <p className="text-gray-600">
                  Guide current students and junior alumni in their career paths
                  and personal development.
                </p>
              </div>

              <div className="card p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Donations
                </h3>
                <p className="text-gray-600">
                  Support infrastructure development, scholarships, and various
                  school improvement projects.
                </p>
              </div>

              <div className="card p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Participate
                </h3>
                <p className="text-gray-600">
                  Attend events, share your experiences, and stay connected with
                  the alumni community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
