import { Rakkas, Aref_Ruqaa, El_Messiri, Fraunces, Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";

export const rakkas = Rakkas({ subsets: ["arabic", "latin"], weight: "400", variable: "--font-rakkas", display: "swap" });
export const arefRuqaa = Aref_Ruqaa({ subsets: ["arabic", "latin"], weight: ["400", "700"], variable: "--font-aref", display: "swap" });
export const elMessiri = El_Messiri({ subsets: ["arabic", "latin"], weight: ["400", "500", "600"], variable: "--font-messiri", display: "swap" });
export const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
export const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" });
export const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const fontVariables = [rakkas, arefRuqaa, elMessiri, fraunces, bricolage, jetbrains].map((f) => f.variable).join(" ");
