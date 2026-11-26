import { Ink, Paper } from "./Paper";

const MAROON = "#7a1f2b";

const rows = [
  ["Html & CSS", 15],
  ["Javascript", 20],
  ["ES6", 15],
  ["TypeScript", 10],
  ["MongoDB", 10],
  ["React", 20],
] as const;

export function ItiCertificate() {
  const total = rows.reduce((sum, [, h]) => sum + h, 0);

  return (
    <Paper label="Information Technology Institute - MEARN Stack Development - Training certificate">
      <div className="absolute inset-0 flex flex-col px-[9cqw] pb-[13cqw] pt-[6cqw]">
        <div className="flex items-center gap-[1.6cqw]">
          <span className="text-[8cqw] font-black leading-none tracking-tighter" style={{ color: MAROON }}>iti</span>
          <span className="text-[1.6cqw] font-semibold leading-tight text-[#2a2f45]">Information<br />Technology<br />Institute</span>
        </div>

        <h4 className="mt-[6cqw] text-center text-[2.6cqw] font-bold tracking-[.12em]">TO WHOM IT MAY CONCERN</h4>

        <p className="mt-[4.5cqw] text-[2.2cqw] leading-[1.85]">
          This is to certify that <b>(Mamdouh Mostafa Helmy Mohamed)</b> has attended and passed the Summer training entitled:
        </p>
        <p className="mt-[2.2cqw] text-center text-[2.7cqw] font-bold">MEARN Stack Development ( 90 hrs )</p>
        <p className="mt-[2.2cqw] text-[2.1cqw]">from: 1 July 2024 to 1 August 2024</p>

        <div className="mt-[2.6cqw] border-[0.25cqw] border-black text-[1.75cqw]">
          <div className="grid grid-cols-[1fr_11cqw_14cqw] border-b-[0.25cqw] border-black font-bold">
            <p className="px-[1.5cqw] py-[1cqw]">Course Title</p>
            <p className="border-s-[0.25cqw] border-black px-[1cqw] py-[1cqw] text-center leading-tight">Lect.<br />Hours</p>
            <p className="border-s-[0.25cqw] border-black px-[1cqw] py-[1cqw] text-center">Evaluation</p>
          </div>
          <div className="grid grid-cols-[1fr_11cqw_14cqw]">
            <ul className="space-y-[0.5cqw] px-[1.5cqw] py-[1.3cqw]">{rows.map(([title]) => <li key={title}>{title}</li>)}</ul>
            <ul className="space-y-[0.5cqw] border-s-[0.25cqw] border-black py-[1.3cqw] text-center">{rows.map(([title, h]) => <li key={title}>{h}</li>)}</ul>
            <p className="grid place-items-center border-s-[0.25cqw] border-black font-semibold">100%</p>
          </div>
          <div className="grid grid-cols-[1fr_11cqw_14cqw] border-t-[0.25cqw] border-black font-bold">
            <p className="py-[0.9cqw] text-center">Total</p>
            <p className="border-s-[0.25cqw] border-black py-[0.9cqw] text-center">{total}</p>
            <span className="border-s-[0.25cqw] border-black" />
          </div>
        </div>

        <p className="mt-[3.5cqw] text-[2cqw] leading-[1.85]">
          This certificate was issued upon his/her request without any responsibility on the institute side.
        </p>

        <div className="relative mt-auto h-[26cqw]">
          <p className="absolute left-0 top-0 text-[2cqw] font-bold">Dr. Heba Saleh</p>
          <Ink src="/images/certs/iti_sig.png" className="bottom-[5cqw] left-0 w-[24cqw]" />
          <p className="absolute bottom-0 left-0 text-[2cqw] font-bold">Chairman, Information Technology Institute</p>
          <Ink src="/images/certs/iti_stamp.png" className="right-0 top-0 w-[20cqw]" />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-[2cqw] px-[9cqw] py-[2.4cqw] text-white" style={{ backgroundColor: MAROON }}>
        <p className="text-[1.6cqw] font-semibold">People Develop Countries. We Develop People</p>
        <p className="text-end text-[1.4cqw] leading-[1.5]">info@iti.gov.eg<br />www.iti.gov.eg</p>
      </div>
    </Paper>
  );
}