import { Header } from "./components/Home/Header/Header"
import { Section1 } from "./components/Home/Section1/Section1"
import { Section2 } from "./components/Home/Section2/Section2"
import { Footer } from "./components/Home/Footer/Footer"

export default function Home() {
  return (
    <>
      <Header />
      <div className="p-[20px] sm:p-[60px] lg:p-[100px]">
        <Section1/>
        <Section2/>
      </div>
      <Footer/>
    </>
  );
}