import React from "react";
import { useState } from "react";

//import logo
import logo from "../../img/logo.png";
import backgroundImage from "../../img/background.png";

function LandingPage() {
  const [buttonText, setButtonText] = useState("Generate Link");
  const [link, setLink] = useState("");

  //calls backend link generating api and sets the link state
  const generateLink = () => {
    fetch("http://localhost:5000/generateLink")
      .then((res) => res.json())
      .then((data) => {
        setLink(data.link);
        console.log(data.link);
        setButtonText("Copy Link");
      });
  };

  //copies the link to the clipboard
  const copyLink = () => {
    // Copy link to clipboard
    navigator.clipboard
      .writeText(link)
      //if successful, change button text
      .then(() => {
        setButtonText("Link Copied!");
      })
      .catch((err) => {
        console.error("Failed to copy link: ", err);
      });
  };

  return (
    <div className="relative h-screen bg-cover bg-center">
      <img
        src={backgroundImage}
        alt="background"
        className="absolute insert-0 w-full h-full object-cover"
      />
      {/* Overlay to darken the background */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Centered content */}
      <div className="relative flex flex-col items-center justify-center h-full text-white">
        {/* Title */}
        <img src={logo} alt="MindMosaic Logo" className="w-48 h-auto mb-6" />

        {/* Card container */}
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center text-gray-800">
          <h2 className="text-xl font-semibold mb-4">
            Welcome to our canvas space!
          </h2>
          <p className="mb-4">
            Create a secure, private space and allow your patients to express
            their emotions through art. To start, create a link and share it
            with your patient before your art therapy session.
          </p>
          {/* Form */}
          <form className="flex items-center border border-gray-300 rounded-lg w-full shadow-sm focus-within:ring-2 focus-within:ring-purple-500">
            <input
              type="text"
              value={link}
              readOnly
              placeholder="Enter your link"
              className="w-full px-4 py-2 rounded-l-lg focus:outline-none"
            />
            <button
              type="button"
              onClick={link ? copyLink : generateLink}
              className="text-white font-semibold py-2 px-6 rounded-r-lg"
              style={{ backgroundColor: "#702095" }}
            >
              {buttonText}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
