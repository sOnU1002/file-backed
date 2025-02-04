import React from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

const AdvancedPasswordInput = ({
  seePassword,
  setSeePassword,
  filePassword,
  setFilePassword,
  idValue,
  placeValue,
}) => {
  return (
    <div className="flex flex-col items-start w-full">
      <label
        htmlFor={idValue}
        className="block mb-2 text-lg font-medium text-gray-900 dark:text-gray-100"
      >
        Set File Password
      </label>
      <div className="relative w-full">
        <input
          required
          type={seePassword ? "text" : "password"}
          placeholder={placeValue}
          value={filePassword}
          onChange={(e) => setFilePassword(e.target.value)}
          id={idValue}
          className="block w-full p-3 pr-12 text-gray-900 border border-gray-300 rounded-xl bg-white shadow-md sm:text-md 
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-700 
          dark:placeholder-gray-500 dark:text-white dark:focus:ring-blue-400 dark:focus:border-blue-400 
          transition-all duration-200 ease-in-out"
        />
        <button
          type="button"
          className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-blue-600 
          dark:text-gray-300 dark:hover:text-blue-400 transition-all duration-200"
          onClick={() => setSeePassword(!seePassword)}
        >
          {seePassword ? <FaRegEyeSlash className="text-xl" /> : <FaRegEye className="text-xl" />}
        </button>
      </div>
    </div>
  );
};

export default AdvancedPasswordInput;
