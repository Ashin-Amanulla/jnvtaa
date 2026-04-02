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
      icon: <GraduationCap size={26} strokeWidth={2.5} />,
      title: "Excellence",
      description:
        "Academic rigor and personal growth—the JNV combo we still carry in our pockets.",
    },
    {
      icon: <Handshake size={26} strokeWidth={2.5} />,
      title: "Networking",
      description:
        "Introductions that feel like study-circle reunions, not stiff mixers.",
    },
    {
      icon: <Heart size={26} strokeWidth={2.5} />,
      title: "Giving back",
      description:
        "Scholarships, infrastructure, and midnight pep talks for students walking our old corridors.",
    },
    {
      icon: <Users size={26} strokeWidth={2.5} />,
      title: "Community",
      description:
        "A home for every batch—messy, multilingual, and always a little too loud.",
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
      <section className="relative overflow-hidden border-b-[3px] border-dashed border-border py-16 md:py-24">
        <div className="container-custom relative z-10">
          <p className="mb-4 inline-block rotate-[-1deg] rounded-wobblySm border-2 border-border bg-postit px-3 py-1 font-sans text-lg shadow-sketchSm">
            About JNVTAA
          </p>
          <h1 className="font-display text-5xl font-bold leading-none text-foreground md:text-6xl lg:text-7xl">
            We’re the alumni desk—sticky notes, coffee rings, big plans
          </h1>
          <div className="mt-6 h-1 max-w-md border-b-4 border-dashed border-foreground" />
          <p className="mt-8 max-w-3xl font-sans text-xl text-muted-foreground md:text-2xl">
            Jawahar Navodaya Vidyalaya Thiruvananthapuram Alumni Association:
            connecting hearts, building futures, and never letting a batch
            reunion stay boring.
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
                Build a vibrant community that helps alumni grow, students
                thrive, and our school stay unforgettable—for the next decades
                of Navodayans.
              </p>
            </SketchCard>
            <SketchCard decoration="tack" tilt className="p-8 md:p-10">
              <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
                Vision
              </h2>
              <p className="mt-4 font-sans text-lg leading-relaxed text-muted-foreground md:text-xl">
                Be the most connected, generous, and slightly chaotic alumni
                network—where every member can pitch in and every story matters.
              </p>
            </SketchCard>
          </div>
        </div>
      </section>

      <section className="border-t-[3px] border-dashed border-border bg-foreground py-20 text-background">
        <div className="container-custom">
          <div className="mb-12 md:mb-16">
            <p className="mb-3 inline-block rounded-wobblySm border-2 border-dashed border-background/50 bg-background/10 px-3 py-1 font-sans text-lg text-background/90">
              Non-negotiables
            </p>
            <h2 className="text-4xl font-bold leading-none md:text-5xl lg:text-6xl">
              Core values
            </h2>
            <div
              className="mt-4 h-1 max-w-[10rem] border-b-4 border-dashed border-background"
              aria-hidden
            />
            <p className="mt-6 max-w-2xl font-sans text-lg text-background/85 md:text-xl">
              Four corners of our doodle—everything else is margin notes.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <div
                key={value.title}
                className="rounded-wobblyMd border-[3px] border-background/40 bg-background/10 p-6 text-center shadow-[4px_4px_0_0_#fdfbf7] transition-transform duration-100 hover:-rotate-1"
              >
                <SketchIconCircle className="mx-auto mb-4 bg-background text-foreground">
                  {value.icon}
                </SketchIconCircle>
                <h3 className="font-display text-xl font-bold">{value.title}</h3>
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
            eyebrow="Long story, short chapters"
            title="Our story"
            description="From chalk dust to cloud docs—same campus soul."
          />
          <div className="space-y-6 rounded-wobblyMd border-[3px] border-border bg-white p-8 shadow-sketch md:p-10">
            {[
              "JNV Trivandrum has been a beacon of excellence since day one. Alumni now lead across medicine, tech, policy, arts, and a hundred roads in between.",
              "JNVTAA exists so those paths cross on purpose—mentorships, reunions, fundraising, and the quiet joy of finding your bench partner online.",
              "Hundreds of alumni across batches contribute time, funds, and stories. We keep the gates open for the next Navodayan wave.",
            ].map((p) => (
              <p key={p} className="font-sans text-lg leading-relaxed text-muted-foreground first-letter:float-left first-letter:mr-2 first-line:tracking-tight first-letter:font-display first-letter:text-5xl first-letter:font-bold first-letter:text-accent md:text-xl">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t-[3px] border-dashed border-border py-20">
        <div className="container-custom">
          <div className="mb-10 hidden justify-center text-border md:flex">
            <SquiggleConnector className="w-48" />
          </div>
          <SectionHeading
            eyebrow="Timeline in pencil"
            title="Our journey"
            description="Milestones that deserve a highlighter (or at least a red pen)."
          />
          <Timeline />
        </div>
      </section>

      <section className="py-20">
        <div className="container-custom">
          <SectionHeading
            eyebrow="Elected doodlers"
            title="Leadership"
            description="Volunteers steering the association with batch pride and spreadsheets."
          />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {leadership.map((leader) => (
              <SketchCard key={leader.name} decoration="tack" tilt className="p-6 text-center">
                <div
                  className="mx-auto mb-4 flex h-20 w-20 items-center justify-center border-[3px] border-border bg-postit font-display text-2xl font-bold text-foreground shadow-sketchSm"
                  style={{
                    borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px",
                  }}
                >
                  {leader.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <h3 className="font-display text-xl font-bold">{leader.name}</h3>
                <p className="mt-1 font-sans text-lg text-pen">{leader.role}</p>
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
            eyebrow="Pick your marker"
            title="How you can contribute"
            description="Mentor, donate, show up—any stroke helps complete the picture."
          />
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Mentorship",
                body: "Guide students and juniors with career and life maps drawn from your JNV years.",
              },
              {
                title: "Donations",
                body: "Fuel scholarships, labs, libraries, and campus fixes that outlive any single batch.",
              },
              {
                title: "Participate",
                body: "Attend events, host micro-meetups, share opportunities—energy beats perfection.",
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
