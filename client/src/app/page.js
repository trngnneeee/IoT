import { Section1 } from "./components/Home/Section1/Section1"
import { Section2 } from "./components/Home/Section2/Section2"

export default function Home() {
  return (
    <>
      <div className="p-[20px] sm:p-[60px] lg:p-[100px]">
        <Section1/>
        <Section2/>
      </div>
    </>
  );
}