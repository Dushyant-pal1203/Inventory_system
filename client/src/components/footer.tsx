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
          href="tel:+919839239874"
          className="text-sm text-white hover:underline"
        >
          +91-9839239874
        </a>
        |
        <a
          href="tel:+919839239874"
          className="text-sm text-white hover:underline"
        >
          +91-8800100378
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
