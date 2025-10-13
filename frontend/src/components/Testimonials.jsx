export default function Testimonials() {
  const testimonials = [
    {
      name: "Vikram Nair",
      batch: "2012",
      role: "Software Engineer at Google",
      avatar: "https://ui-avatars.com/api/?name=Vikram+Nair&background=0ea5e9&color=fff",
      quote:
        "JNVTAA has been instrumental in connecting me with alumni across the globe. The networking opportunities have been invaluable for my career.",
    },
    {
      name: "Shalini Krishna",
      batch: "2015",
      role: "Doctor at Apollo Hospitals",
      avatar: "https://ui-avatars.com/api/?name=Shalini+Krishna&background=8b5cf6&color=fff",
      quote:
        "Being part of JNVTAA keeps me connected to my roots. It's wonderful to see how our alumni are making a difference worldwide.",
    },
    {
      name: "Rahul Menon",
      batch: "2009",
      role: "Entrepreneur",
      avatar: "https://ui-avatars.com/api/?name=Rahul+Menon&background=10b981&color=fff",
      quote:
        "The mentorship program helped me when I was starting my business. Now I'm giving back by mentoring junior alumni. Full circle!",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What Alumni Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hear from our vibrant community members
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative animate-slide-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="card p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                {/* Quote Icon */}
                <div className="text-6xl text-primary-200 font-serif mb-4">"</div>

                {/* Quote */}
                <p className="text-gray-700 mb-6 italic leading-relaxed">
                  {testimonial.quote}
                </p>

                {/* Author */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full"
                  />
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <p className="text-xs text-primary-600">
                      Batch of {testimonial.batch}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

