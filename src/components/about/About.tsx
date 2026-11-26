"use client";
import { AboutHeader } from "./AboutHeader";
import { Collage } from "./Collage";
import { Story } from "./Story";
import { Principles } from "./Principles";
import { Stats } from "./Stats";
import { Process } from "./Process";
import { Tools } from "./Tools";
import { ContactCta } from "./ContactCta";

export function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-6">
      <AboutHeader />
      <div className="mt-14 grid items-start gap-12 md:mt-20 md:grid-cols-12 md:gap-16">
        <Collage />
        <Story />
      </div>
      <Principles />
      <Stats />
      <Process />
      <Tools />
      <ContactCta />
    </section>
  );
}