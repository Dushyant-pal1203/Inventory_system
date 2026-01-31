import Navbar from "@/components/Navbar";
import React from "react";
import LatterHead from "../components/LatterHead/letterHead";

const letter_head = () => {
  return (
    <div>
      <Navbar active="home" title="Latter Head" />
      <div className="mt-28">
        <LatterHead />
      </div>
    </div>
  );
};

export default letter_head;
