import {
  GraduationCap,
  Handshake,
  Heart,
  Users,
} from "lucide-react";
import Timeline from "@/components/Timeline";
import { SectionHeading } from "@/components/SectionHeading";
import { SketchCard } from "@/components/SketchCard";
import { SketchIconCircle } from "@/components/SketchIconCircle";
import { SquiggleConnector } from "@/components/HeroSketchDecor";

export default function About() {
  const values = [
    {
      icon: <GraduationCap size={26} strokeWidth={2} />,
      title: "Excellence",
      description:
        "We uphold the academic rigor and personal growth that define the Navodaya experience.",
    },
    {
      icon: <Handshake size={26} strokeWidth={2} />,
      title: "Networking",
      description:
        "We connect alumni across batches, professions, and geographies in a spirit of mutual support.",
    },
    {
      icon: <Heart size={26} strokeWidth={2} />,
      title: "Giving back",
      description:
        "We channel alumni strength into scholarships, infrastructure, and mentorship for current students.",
    },
    {
      icon: <Users size={26} strokeWidth={2} />,
      title: "Community",
      description:
        "We welcome every batch and every Navodayan — a home for those shaped by JNV Thiruvananthapuram.",
    },
  ];

  const leadership = [
    { name: "Goutham Krishna", batch: "2019", role: "President" },
    { name: "Apsima", batch: "2018", role: "Vice President" },
    { name: "Ashin Amanulla", batch: "2012", role: "Secretary" },
    { name: "Sanjay JS", batch: "2013", role: "Joint Secretary" },
    { name: "Abhinandh", batch: "2022", role: "Treasurer" },
    { name: "Abu", batch: "2023", role: "Joint Treasurer" },
  ];

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border py-16 md:py-24">
        <div className="container-custom relative z-10">
          <p className="mb-4 inline-block rounded-xl border-2 border-border bg-house-yellow-soft px-3 py-1 font-sans text-lg shadow-card">
            About JNVTAA
          </p>
          <h1 className="font-display text-5xl font-bold leading-none text-foreground md:text-6xl lg:text-7xl">
            About JNVTAA — our alumni association
          </h1>
          <div className="mt-6 h-1 max-w-md border-b-2 border-brand" />
          <p className="mt-8 max-w-3xl font-sans text-xl text-muted-foreground md:text-2xl">
            Jawahar Navodaya Vidyalaya Thiruvananthapuram Alumni Association:
            we connect generations of Navodayans, honor the NVS mandate, and
            support the school that brought rural talent together through JNVST
            and the migration program.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-custom">
          <div className="grid gap-8 md:grid-cols-2">
            <SketchCard decoration="tape" tilt postit={false} className="p-8 md:p-10">
              <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
                Mission
              </h2>
              <p className="mt-4 font-sans text-lg leading-relaxed text-muted-foreground md:text-xl">
                We build a vibrant alumni community that helps Navodayans grow,
                supports current students, and strengthens JNV
                Thiruvananthapuram for decades to come.
              </p>
            </SketchCard>
            <SketchCard decoration="tack" tilt className="p-8 md:p-10">
              <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
                Vision
              </h2>
              <p className="mt-4 font-sans text-lg leading-relaxed text-muted-foreground md:text-xl">
                To be the most connected and generous alumni network in the
                Navodaya family — where every member can contribute and every
                story matters.
              </p>
            </SketchCard>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-foreground py-20 text-background">
        <div className="container-custom">
          <div className="mb-12 md:mb-16">
            <p className="mb-3 inline-block rounded-xl border-2 border-background/50 bg-background/10 px-3 py-1 font-sans text-lg text-background/90">
              Our principles
            </p>
            <h2 className="text-4xl font-bold leading-none text-background md:text-5xl lg:text-6xl">
              Core values
            </h2>
            <div
              className="mt-4 h-1 max-w-[10rem] border-b-4 border-background"
              aria-hidden
            />
            <p className="mt-6 max-w-2xl font-sans text-lg text-background/85 md:text-xl">
              Four values that guide everything we do as Navodayans and as an
              association.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <div
                key={value.title}
                className="rounded-2xl border-[3px] border-background/40 bg-background/10 p-6 text-center shadow-[4px_4px_0_0_#fdfbf7] transition-transform duration-100"
              >
                <SketchIconCircle className="mx-auto mb-4 bg-background text-foreground">
                  {value.icon}
                </SketchIconCircle>
                <h3 className="font-display text-xl font-bold text-background">{value.title}</h3>
                <p className="mt-3 font-sans text-base text-background/80">
                  {value.description}
                </p>
                <span
                  className="mt-4 hidden font-sans text-sm text-background/50 md:block"
                  aria-hidden
                >
                  {index + 1} / {values.length}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-custom max-w-3xl">
          <SectionHeading
            eyebrow="Our heritage"
            title="Our story"
            description="From JNVST-selected students to leaders across fields — the Navodayan journey continues."
          />
          <div className="space-y-6 rounded-2xl border border-border bg-white p-8 shadow-card md:p-10">
            {[
              "JNV Thiruvananthapuram has been a beacon of excellence since its founding under the Navodaya Vidyalaya Samiti mandate. Our alumni now lead across medicine, technology, public service, the arts, and many other fields.",
              "JNVTAA exists so those paths cross with purpose — through mentorship, reunions, fundraising, and the shared pride of being Navodayans shaped by rural talent and the migration program.",
              "Hundreds of alumni across batches contribute time, resources, and expertise. We keep our doors open for the next generation of JNVST scholars.",
            ].map((p) => (
              <p key={p} className="font-sans text-lg leading-relaxed text-muted-foreground first-letter:float-left first-letter:mr-2 first-line:tracking-tight first-letter:font-display first-letter:text-5xl first-letter:font-bold first-letter:text-accent md:text-xl">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border py-20">
        <div className="container-custom">
          <div className="mb-10 hidden justify-center text-border md:flex">
            <SquiggleConnector className="w-48" />
          </div>
          <SectionHeading
            eyebrow="Association milestones"
            title="Our journey"
            description="Key moments in the history of JNVTAA and our alumni community."
          />
          <Timeline />
        </div>
      </section>

      <section className="py-20">
        <div className="container-custom">
          <SectionHeading
            eyebrow="Volunteer leadership"
            title="Leadership"
            description="Elected alumni who guide JNVTAA programs, governance, and outreach."
          />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {leadership.map((leader) => (
              <SketchCard key={leader.name} decoration="tack" tilt className="p-6 text-center">
                <div
                  className="mx-auto mb-4 flex h-20 w-20 items-center justify-center border border-border bg-house-yellow-soft font-display text-2xl font-bold text-foreground shadow-card"
                  style={{
                    borderRadius: "9999px",
                  }}
                >
                  {leader.name
                    .split("")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <h3 className="font-display text-xl font-bold">{leader.name}</h3>
                <p className="mt-1 font-sans text-lg text-brand">{leader.role}</p>
                <p className="mt-2 font-sans text-base text-muted-foreground">
                  Batch {leader.batch}
                </p>
              </SketchCard>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t-[3px] border-border bg-muted py-20">
        <div className="container-custom max-w-5xl">
          <SectionHeading
            eyebrow="Get involved"
            title="How you can contribute"
            description="Mentor, donate, or participate — every contribution strengthens our Navodayan community."
          />
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Mentorship",
                body: "Guide students and juniors with career and life guidance drawn from your JNV years.",
              },
              {
                title: "Donations",
                body: "Support scholarships, laboratories, libraries, and campus improvements that benefit every batch.",
              },
              {
                title: "Participate",
                body: "Attend events, host regional meetups, and share opportunities with fellow Navodayans.",
              },
            ].map((item, i) => (
              <SketchCard key={item.title} postit={i === 1} tilt className="p-8">
                <h3 className="font-display text-2xl font-bold">{item.title}</h3>
                <p className="mt-3 font-sans text-lg text-muted-foreground">
                  {item.body}
                </p>
              </SketchCard>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
