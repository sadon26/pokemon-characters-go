import { PokemonLogo } from "~/assets";

const IntroWrapper = () => {
  return (
    <div
      id="intro-screen"
      className="fixed inset-0 flex items-center justify-center bg-black intro-fade"
    >
      <div className="w-48 h-48 pokeball-intro">
        <img
          src={PokemonLogo}
          alt="Pokeball Intro"
          className="w-full h-full drop-shadow-2xl"
        />
      </div>
    </div>
  );
};

export default IntroWrapper;
