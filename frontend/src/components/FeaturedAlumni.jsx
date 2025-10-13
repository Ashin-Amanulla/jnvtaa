export default function FeaturedAlumni() {
  const featuredAlumni = [
    {
      name: "Dr. Priya Menon",
      batch: "2005",
      achievement: "Leading Neurosurgeon at AIIMS, Featured in Forbes Healthcare",
      image: "https://ui-avatars.com/api/?name=Priya+Menon&size=200&background=4f46e5&color=fff",
      quote:
        "JNV Trivandrum taught me the values of perseverance and excellence that shaped my medical career.",
    },
    {
      name: "Arun Kumar",
      batch: "2008",
      achievement: "Founder & CEO of TechStart India, 50+ Million ARR",
      image: "https://ui-avatars.com/api/?name=Arun+Kumar&size=200&background=059669&color=fff",
      quote:
        "The leadership skills I developed at JNV became the foundation of my entrepreneurial journey.",
    },
    {
      name: "Anjali Sharma",
      batch: "2010",
      achievement: "IAS Officer, District Magistrate, Winner of PM Excellence Award",
      image: "https://ui-avatars.com/api/?name=Anjali+Sharma&size=200&background=dc2626&color=fff",
      quote:
        "JNV instilled in me the spirit of public service that drives my work every day.",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container-custom">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Featured Alumni
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Celebrating the remarkable achievements of our alumni
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredAlumni.map((alumni, index) => (
            <div
              key={index}
              className="card hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-slide-up overflow-hidden group"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="relative h-64 overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600">
                <img
                  src={alumni.image}
                  alt={alumni.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {alumni.name}
                  </h3>
                  <p className="text-white/90 text-sm">Batch of {alumni.batch}</p>
                </div>
              </div>

              <div className="p-6">
                <p className="text-sm font-semibold text-primary-600 mb-3">
                  {alumni.achievement}
                </p>
                <blockquote className="text-gray-600 italic border-l-4 border-primary-200 pl-4">
                  "{alumni.quote}"
                </blockquote>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

