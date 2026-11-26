import type { ReactNode } from "react";
import { MindsetCertificate } from "./MindsetCertificate";
import { ItiCertificate } from "./ItiCertificate";
import { CodeSchoolPage1, CodeSchoolPage2 } from "./CodeSchoolCertificate";

/** كل شهادة = مصفوفة صفحات. الشهادة اللي صفحتها واحدة بتتعرض من غير أزرار تنقل. */
export const certificatePreviews = {
  codeschool: [<CodeSchoolPage1 key="1" />, <CodeSchoolPage2 key="2" />],
  mindset: [<MindsetCertificate key="1" />],
  iti: [<ItiCertificate key="1" />],
} satisfies Record<string, ReactNode[]>;

export type PreviewId = keyof typeof certificatePreviews;