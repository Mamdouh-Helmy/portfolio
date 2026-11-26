import type { ReactNode } from "react";
import { Ink, Paper } from "./Paper";

const body = "text-[1.95cqw] leading-[1.5] text-justify";

function Letterhead() {
  return (
    <div className="leading-none text-[#2b2b2b]">
      <p className="text-[5.4cqw] font-light tracking-[.12em]">CODE</p>
      <p className="mt-[0.5cqw] ps-[0.4cqw] text-[1.3cqw] font-semibold tracking-[.2em]">SCHOOL</p>
    </div>
  );
}

function Item({ title, children }: { title: string; children: ReactNode }) {
  return (
    <li className={`${body} ps-[1cqw]`}>
      <b>{title}:</b> {children}
    </li>
  );
}

export function CodeSchoolPage1() {
  return (
    <Paper label="Code School - Experience certificate, page 1">
      <div className="absolute inset-0 flex flex-col px-[10cqw] pb-[6cqw] pt-[7cqw]">
        <Letterhead />
        <p className={`mt-[5cqw] ${body}`}><b>Date:</b> August 26, 2026 <b>Reference Number:</b> CS-HR-2026-001</p>
        <p className={`mt-[2cqw] ${body}`}><b>To Whom It May Concern,</b></p>
        <p className={`mt-[1.6cqw] ${body}`}>
          This letter is to certify that <b>Eng. Mamdoh Mostafa</b> was employed at <b>Code School</b> in the capacity of <b>Senior Full-Stack Developer</b> from <b>October 12, 2025</b> to <b>November 1, 2026.</b>
        </p>
        <p className={`mt-[1.6cqw] ${body}`}>
          During his tenure, Eng. Mamdoh was the primary architect and lead developer who built the entire Code School software ecosystem from the ground up. He successfully engineered the platform from a conceptual phase into a massive, fully customized ecosystem that combines an Advanced Learning Management System (LMS), a Mini-ERP, and a Community Portfolio Platform, powering all our operational, academic, and financial workflows through multiple dedicated dashboards.
        </p>
        <p className={`mt-[1.6cqw] ${body}`}><b>Key Technical Achievements &amp; Responsibilities:</b></p>
        <ul className="mt-[1cqw] list-disc space-y-[0.4cqw] ps-[3.5cqw] marker:text-[1.5cqw]">
          <Item title="End-to-End Architecture & Multi-Dashboard Operations">
            Designed and developed the entire platform from scratch (Frontend, Backend, and Database Architecture). He built a comprehensive operations management system featuring multiple specialized dashboards tailored for Admins, Learning Supervisors, Operations, Instructors, and Parents.
          </Item>
          <Item title="Advanced LMS & Automated Certification">
            Engineered a highly sophisticated LMS to track and manage the progress of students, parents, and instructors. He implemented a strict, logic-based automated certification system that issues credentials to eligible students with zero human intervention.
          </Item>
          <Item title="Human-Like Contextual Communication Engine">
            Developed a state-of-the-art, strict follow-up system via WhatsApp. He programmed the messaging middleware to generate highly professional, human-like messages using advanced grammatical connectors, context-awareness, and strict differentiation based on gender and user roles (Parent, Student, or Instructor).
          </Item>
          <Item title="Automated Meeting & Logistics Management">
            Built a strict and dynamic meeting link generation and booking engine designed to precisely meet the distinct logistical needs of parents, students, and engineers, ensuring seamless online and offline session delivery.
          </Item>
        </ul>
      </div>
    </Paper>
  );
}

export function CodeSchoolPage2() {
  return (
    <Paper label="Code School - Experience certificate, page 2">
      <div className="absolute inset-0 flex flex-col px-[10cqw] pb-[6cqw] pt-[7cqw]">
        <Letterhead />
        <ul className="mt-[4cqw] list-disc space-y-[0.4cqw] ps-[3.5cqw] marker:text-[1.5cqw]">
          <Item title="Professional Portfolio & Hiring Ecosystem">
            Architected a standalone, professional portfolio generator for students, instructors, and external guests (serving as a community service platform). He integrated this with a powerful internal "Inbox" messaging system allowing external recruiters to contact or hire users directly, fully linked with real-time WhatsApp alerts.
          </Item>
          <Item title="Financial, Payroll & Security Engineering">
            Developed a dynamic, minute-based payroll engine and a 14-day escrow module to securely manage automated refund policies. He also designed a highly secure infrastructure enforcing strict Role-Based Access Control (RBAC) to isolate financial, operational, and academic data.
          </Item>
        </ul>

        <p className={`mt-[3cqw] ${body}`}>
          Eng. Mamdoh possesses a brilliant engineering mindset with a proven ability to architect full-scale, stable, and highly complex software solutions entirely from scratch. His ability to translate intricate business, academic, and community needs into flawless technical execution makes him an invaluable asset to any engineering team.
        </p>
        <p className={`mt-[2.4cqw] ${body}`}>
          This certificate is issued upon his request without any financial or legal liability toward others. We wish him the utmost success in his future professional endeavors and highly recommend him for any senior technical or architectural role.
        </p>

        <div className="relative mt-[3cqw] h-[26cqw]">
          <p className={`absolute left-0 top-0 ${body}`}><b>Sincerely,</b></p>
          <p className={`absolute left-0 top-[9cqw] ${body}`}><b>Signature:</b> .........................</p>
          <Ink src="/images/certs/cs_sig.png" className="left-[8cqw] top-[1.5cqw] w-[24cqw]" />
          <Ink src="/images/certs/cs_stamp.png" className="left-[40cqw] top-0 w-[17cqw]" />
          <p className={`absolute bottom-0 left-0 ${body}`}>
            <b>Abdallah Abdel Naser</b> Founder &amp; Director <b>Code School</b> <b>Contact:</b> CEO@codschool.online / 01027727756
          </p>
        </div>
      </div>
    </Paper>
  );
}