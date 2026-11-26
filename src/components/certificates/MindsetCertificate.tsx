import { Ink, Paper } from "./Paper";

const topics = [
  "Javascript revision - React Js basics",
  "Setup The Development Environment",
  "JSX-State & Props - Lists and Keys - Life Cycle Methods",
  "Build Your Project & Deploy it - Styling - Form Handling",
  "Data Handling - React Hooks - State Management",
  "Routing - Authentication & Authorization",
];

const NAME = "Mamdouh Mustafa Helmy Muhammad";
const BAR = "bg-gradient-to-r from-[#3b4a9c] to-[#7b90dd]";

export function MindsetCertificate() {
  return (
    <Paper label="Mindset Training - ReactJs Track - Certificate of Completion">
      <span className={`absolute right-[6cqw] top-[6cqw] h-[1.6cqw] w-[36cqw] rounded-full ${BAR}`} />
      <span className={`absolute bottom-[5cqw] left-0 h-[2cqw] w-[32cqw] rounded-r-full ${BAR}`} />

      <div className="absolute inset-0 flex flex-col px-[10cqw] pb-[7cqw] pt-[7cqw]">
        <div className="leading-none">
          <p className="text-[4.6cqw] font-semibold tracking-tight text-[#2a2f45]">Mindset</p>
          <p className="mt-[0.7cqw] text-[1cqw] font-semibold uppercase tracking-[.4em] text-[#4a5bb5]">Build your mind</p>
        </div>

        <h4 className="mt-[7cqw] text-center text-[5.4cqw] font-bold italic leading-none text-[#1d2146]">Certificate of Completion</h4>
        <p className="mt-[3cqw] text-center text-[2.2cqw]">This is to certify that</p>
        <p className="mt-[1.6cqw] text-center text-[3cqw] font-bold text-[#1d2146]">{NAME}</p>
        <p className="mx-auto mt-[1.6cqw] max-w-[70cqw] text-center text-[1.95cqw] leading-[1.5]">
          has successfully completed the <b>ReactJs Track</b> training program at <b>Mindset Training</b>.
        </p>
        <p className="mx-auto mt-[2.6cqw] max-w-[74cqw] text-center text-[1.8cqw] leading-[1.6]">
          The training was conducted over a period of <b>90H</b> from <b>2024/8/16</b> to <b>2024/9/16</b>, covering the following topics:
        </p>

        <div className="mt-[3cqw] overflow-hidden rounded-[1.4cqw] border-[0.25cqw] border-[#1d2146]">
          <div className={`h-[2.4cqw] ${BAR}`} />
          {topics.map((row) => (
            <p key={row} className="border-t border-[#1d2146]/60 py-[1.1cqw] text-center text-[1.8cqw] font-medium">{row}</p>
          ))}
          <div className="grid grid-cols-2 border-t-[0.25cqw] border-[#1d2146]">
            <p className="border-e-[0.25cqw] border-[#1d2146] py-[1.2cqw] ps-[4cqw] text-[2.3cqw] font-semibold">Total Hours :</p>
            <p className="py-[1.2cqw] text-center text-[2.2cqw] font-semibold">90 Hours</p>
          </div>
        </div>

        <p className="mx-auto mt-[3.5cqw] max-w-[72cqw] text-center text-[1.65cqw] leading-[1.6]">
          This certificate is awarded in recognition of the dedication and effort shown by <b>{NAME}</b> in completing the program.
        </p>

        <div className="relative mt-auto h-[18cqw]">
          <p className="absolute bottom-[7cqw] left-0 text-[2.1cqw] font-semibold text-[#1d2146]">Chief Executive Officer</p>
          <Ink src="/images/certs/mindset_sig.png" className="bottom-[10.5cqw] left-0 w-[19cqw]" />
          <Ink src="/images/certs/mindset_stamp.png" className="bottom-[5cqw] right-0 w-[16cqw]" />
        </div>
      </div>
    </Paper>
  );
}