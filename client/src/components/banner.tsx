const Banner = () => {
  return (
    <div className="w-full bg-[#0c3c78] text-white">
      {/* TOP HEADING */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between px-4 py-2 sm:py-4 text-center bg-primary">
        {/* Logo - hidden on mobile, visible on sm and up */}
        <div
          onClick={() => {
            window.location.href = "/";
          }}
          className="hidden sm:block cursor-pointer"
        >
          <img
            src="images/logo.png"
            alt="Logo"
            className="w-[80px] md:w-[110px] h-fit"
          />
        </div>

        {/* Mobile logo - centered above text */}
        <img
          src="images/logo.png"
          alt="Logo"
          className="block sm:hidden w-[70px] h-fit mb-2"
        />

        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold px-2">
          ELECTROHOMEOPATHY AND ALTERNATIVE <br className="hidden sm:block" />
          INSTITUTE HOLISTIC HEALTH
        </h1>

        {/* Doctor image - hidden on mobile, visible on sm and up */}
        <img
          src="images/doctor.png"
          alt="Doctor"
          className="hidden sm:block w-[80px] md:w-[110px] h-fit"
        />
      </div>

      {/* MIDDLE BANNER SECTION */}
      <div
        className="flex justify-center sm:justify-end bg-cover bg-center py-1 sm:py-2 px-4"
        style={{
          backgroundImage: `url('/images/background.jpeg')`,
        }}
      >
        {/* Title box */}
        <div className="bg-primary bg-opacity-70 px-2 py-2 sm:py-4 rounded-lg text-center text-black w-full sm:w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%]">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
            MALKANI HOSPITAL OF ELECTROHOMEOPATHY{" "}
            <br className="hidden sm:block" />& RESEARCH CENTRE
          </h2>

          <p className="mt-2 text-sm text-white sm:text-md font-semibold">
            54. Street No. 2, Vill. Sadatpur Delhi 110094
          </p>
        </div>
      </div>

      {/* BOTTOM HELPLINE SECTION */}
      <div className="relative bg-primary p-2 sm:p-3 text-center">
        <span className="font-bold text-white text-sm sm:text-lg">
          Helpline & Appointment :{" "}
        </span>
        <span className="text-white font-semibold text-sm sm:text-base">
          9868236474, 8860100079
        </span>
      </div>
    </div>
  );
};

export default Banner;
