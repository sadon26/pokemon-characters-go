import { RippleLoader } from "~/assets";

const PageLoader = () => (
  <div className="flex justify-center items-center pt-50">
    <div className="w-24 h-24">
      <img src={RippleLoader} alt="Ripple loader" className="w-full h-full" />
    </div>
  </div>
);

export default PageLoader;
