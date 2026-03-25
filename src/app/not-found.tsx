import { getDictionary } from "@/i18n/get-dictionary";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import NotFoundBlock from "./components/NotFoundBlock/NotFoundBlock";
import ReduxProvider from "@/store/ReduxProvider";
import PasswordGate from "./components/PasswordGate/PasswordGate";
import "./globals.css";
import localFont from "next/font/local";
import clsx from "clsx";

const houschka = localFont({
  src: [
    {
      path: "../fonts/HouschkaRounded-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/HouschkaRounded-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-houschka",
});

const helios = localFont({
  src: [
    {
      path: "../fonts/Helios-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Helios-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-helios",
});

export default async function GlobalNotFound() {
    const lang = "ua";
    const dict = await getDictionary(lang);

    return (
        <html lang={lang} className={clsx(houschka.variable, helios.variable)} suppressHydrationWarning>
            <body>
                <ReduxProvider>
                    <PasswordGate>
                        <Header lang={lang} />
                        <main>
                            <NotFoundBlock dict={dict} />
                        </main>
                        <Footer lang={lang} />
                    </PasswordGate>
                </ReduxProvider>
            </body>
        </html>
    );
}
