import React from "react";
import { ImCheckboxChecked } from "react-icons/im";

const SinglePricingElement = ({ planName, price, features }) => {
  return (
    <div className="w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
      <h5 className="mb-4 text-2xl font-bold text-blue-500 dark:text-gray-400">
        {planName} plan
      </h5>
      
      <ul role="list" className="space-y-5 my-7">
        

        
        
      </ul>
      <button
        type="button"
        className="text-white bg-blue-500 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-200 dark:focus:ring-blue-900 font-medium rounded-lg text-sm px-5 py-2.5 inline-flex justify-center w-full text-center"
      >
        Choose plan
      </button>
    </div>
  );
};

export default SinglePricingElement;
