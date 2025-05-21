import { Header } from "./components/Home/Header/Header"
import { Section1 } from "./components/Home/Section1/Section1"
import { Footer } from "./components/Home/Footer/Footer"

export default function Home() {
  return (
    <>
      <Header />
      <div className="px-[100px] my-[30px]">
        <Section1/>
      </div>
      <Footer/>
    </>
  );
}