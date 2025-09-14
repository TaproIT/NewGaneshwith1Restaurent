import type { RootState } from "@/app/store";
import Step01 from "@/component/onboarding/Step01";
import Step02 from "@/component/onboarding/Step02";
import { useSelector } from "react-redux";

const Onboarding = () => {
    const step = useSelector((state: RootState) => state.onboarding.step);
  return (
    <div className="w-full h-[calc(100vh-140px)]">
        {step === 1 && <Step01 />}
        {step === 2 && <Step02 />}
    </div>
  )
};

export default Onboarding;
