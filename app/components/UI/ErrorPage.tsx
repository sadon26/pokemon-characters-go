import { PikachuError } from "~/assets";

const ErrorPage = () => {
  return (
    <div className="flex flex-col items-center mt-40">
      <div className="w-60">
        <img src={PikachuError} alt="pikachu-error" className="w-full" />
      </div>
      <p>Error loading data...</p>
    </div>
  );
};

export default ErrorPage;
