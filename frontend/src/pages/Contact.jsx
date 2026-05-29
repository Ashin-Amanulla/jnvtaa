import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { SketchCard } from "@/components/SketchCard";
import { SectionHeading } from "@/components/SectionHeading";
import { contactAPI } from "@/api";
import {
  formatVisitBlock,
  formatEmailBlock,
  formatPhoneBlock,
  getSocialNavLinks,
} from "@/config/site";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      await contactAPI.submit(formData);
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err.message || "Unable to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <MapPin size={28} strokeWidth={2} />,
      title: "Visit",
      content: formatVisitBlock(),
    },
    {
      icon: <Mail size={28} strokeWidth={2} />,
      title: "Email",
      content: formatEmailBlock(),
    },
    {
      icon: <Phone size={28} strokeWidth={2} />,
      title: "Call",
      content: formatPhoneBlock(),
    },
  ];

  const socialLinks = getSocialNavLinks();

  return (
    <div className="min-h-screen">
      <section className="relative border-b border-border py-16 md:py-24">
        <div className="container-custom">
          <p className="mb-3 inline-block rotate-1 rounded-xl border-2 border-border bg-white px-3 py-1 font-sans text-lg shadow-card">
            Get in touch
          </p>
          <h1 className="font-display text-5xl font-bold text-foreground md:text-6xl lg:text-7xl">
            Contact JNVTAA
          </h1>
          <div className="mt-4 h-1 max-w-sm border-b-2 border-brand" />
          <p className="mt-8 max-w-2xl font-sans text-xl text-muted-foreground md:text-2xl">
            Questions about membership, events, donations, or mentorship — we
            welcome every inquiry from fellow Navodayans and well-wishers.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container-custom">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="space-y-10 lg:col-span-4">
              <SectionHeading
                eyebrow="Reach us"
                title="Contact details"
                description="Our volunteer team responds to messages from alumni, students, and partners."
              />
              <div className="space-y-8">
                {contactInfo.map((info) => (
                  <SketchCard
                    key={info.title}
                    tilt
                    className="p-6"
                    decoration="tape"
                  >
                    <div className="mb-3 text-foreground">{info.icon}</div>
                    <h3 className="font-display text-xl font-bold text-foreground">
                      {info.title}
                    </h3>
                    <p className="mt-2 whitespace-pre-line font-sans text-lg text-muted-foreground">
                      {info.content}
                    </p>
                  </SketchCard>
                ))}
              </div>

              <SketchCard postit tilt className="p-6">
                <h3 className="font-display text-xl font-bold">Social</h3>
                <p className="mt-2 font-sans text-muted-foreground">
                  Follow JNVTAA on social media for updates and alumni stories.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {socialLinks.map(({ icon: Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-border bg-white text-foreground shadow-card transition-transform duration-100 focus-ring"
                    >
                      <Icon size={22} strokeWidth={2} />
                    </a>
                  ))}
                </div>
              </SketchCard>
            </div>

            <div className="lg:col-span-8">
              <SketchCard decoration="tack" tilt className="p-8 md:p-10">
                <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
                  Send a message
                </h2>
                <p className="mt-3 font-sans text-lg text-muted-foreground">
                  Send us a message and we will respond as soon as we can.
                </p>

                {error && (
                  <div className="mt-8 rounded-xl border-[3px] border-house-red bg-white p-6 shadow-card" role="alert">
                    <p className="font-sans text-lg text-house-red">{error}</p>
                  </div>
                )}

                {submitted && (
                  <div
                    className="mt-8 rounded-xl border-[3px] border-brand bg-white p-6 shadow-card"
                    role="status"
                  >
                    <p className="font-display text-xl font-bold text-brand">
                      Message received
                    </p>
                    <p className="mt-2 font-sans text-lg text-muted-foreground">
                      Thank you for reaching out. We will get back to you shortly.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-10 space-y-8">
                  <div className="grid gap-8 md:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="label">
                        Your name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="input"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="label">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="input"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="label">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="input"
                      placeholder="What’s this about? "
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="label">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      className="textarea"
                      placeholder="Tell us how we can help"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary inline-flex w-full items-center justify-center gap-3 md:w-auto focus-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      "Sending…"
                    ) : (
                      <>
                        Send message
                        <Send size={22} strokeWidth={2} />
                      </>
                    )}
                  </button>
                </form>
              </SketchCard>

              <p className="mt-8 text-center font-sans text-muted-foreground md:text-left">
                Prefer the old ways?{""}
                <Link
                  to="/directory"
                  className="text-brand font-medium hover:text-accent"
                >
                  Find a coordinator in the directory
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
