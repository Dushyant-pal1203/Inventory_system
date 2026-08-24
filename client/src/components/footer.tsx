import React from "react";

const Footer = () => {
  return (
    <div className="bg-primary text-primary-foreground px-6 py-2 rounded-b-xl text-center">
      <p className="text-xs">
        <a
          href="mailto:malkani.clinic@gmail.com"
          className="text-sm text-white hover:underline"
        >
          malkani.clinic@gmail.com
        </a>
        |
        <a
          href="tel:+919868236474"
          className="text-sm text-white hover:underline"
        >
          +91-9868236474
        </a>
        |
        <a
          href="tel:+918860100079"
          className="text-sm text-white hover:underline"
        >
          +91-8860100079
        </a>
        |
        <a
          href="https://electrohomoeopathy.co.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-white hover:underline"
        >
          www.electrohomeopathy.in
        </a>
      </p>
    </div>
  );
};

export default Footer;
