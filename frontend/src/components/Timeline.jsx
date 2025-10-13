export default function Timeline() {
  const milestones = [
    {
      year: "1985",
      title: "JNV Trivandrum Established",
      description: "The journey began with a vision to provide quality education to talented students from rural areas.",
    },
    {
      year: "1997",
      title: "First Batch Passes Out",
      description: "Our inaugural batch graduated, marking the beginning of our alumni legacy.",
    },
    {
      year: "2010",
      title: "JNVTAA Founded",
      description: "Alumni came together to form an official association for networking and giving back.",
    },
    {
      year: "2015",
      title: "First Grand Reunion",
      description: "Over 200 alumni gathered for the first major reunion event, celebrating 30 years of excellence.",
    },
    {
      year: "2020",
      title: "Global Alumni Network",
      description: "Alumni presence established in 15+ countries with regional chapters.",
    },
    {
      year: "2024",
      title: "JNVTAA Website Launch",
      description: "Modern digital platform launched to connect alumni worldwide.",
    },
  ];

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-primary-200 via-primary-400 to-primary-200 hidden md:block"></div>

      {/* Milestones */}
      <div className="space-y-12">
        {milestones.map((milestone, index) => (
          <div
            key={index}
            className={`flex items-center gap-8 ${
              index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
            } animate-slide-up`}
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            {/* Content */}
            <div
              className={`flex-1 ${
                index % 2 === 0 ? "md:text-right" : "md:text-left"
              }`}
            >
              <div className="card p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="text-primary-600 font-bold text-2xl mb-2">
                  {milestone.year}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {milestone.title}
                </h3>
                <p className="text-gray-600">{milestone.description}</p>
              </div>
            </div>

            {/* Circle */}
            <div className="relative flex-shrink-0 hidden md:block">
              <div className="w-6 h-6 bg-primary-600 rounded-full border-4 border-white shadow-lg z-10 relative animate-pulse"></div>
            </div>

            {/* Spacer for alternating layout */}
            <div className="flex-1 hidden md:block"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

