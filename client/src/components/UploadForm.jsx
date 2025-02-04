import React from "react";
import { useState } from "react";
import {
  AdvancedPasswordInput,
  FilePreview,
  ProgressBar,
  CopyToClipboardBtn,
} from "../components";
import axios from "axios";
import { toast } from "react-toastify";
import { z } from "zod";

const receiversEmailSchema = z.string().email();
const passwordSchema = z.string().min(20, "Password field must be valid length and value")

const UploadForm = ({ progress }) => {
  const [file, setFile] = useState();
  const [errorMsg, setErrorMsg] = useState();
  const [receiverEmail, setReceiverEmail] = useState("");
  const [filePassword, setFilePassword] = useState("");
  const [seePassword, setSeePassword] = useState(false);

  const allowedExtensions = [
    "pdf",
    "docx",
    "doc",
    "xls",
    "xlsx",
    "csv",
    "txt",
    "rtf",
    "html",
    "zip",
    "mp3",
    "m4a",
    "wma",
    "mpg",
    "flv",
    "avi",
    "jpg",
    "jpeg",
    "png",
    "gif",
    "ppt",
    "pptx",
    "wav",
    "mp4",
    "m4v",
    "wmv",
    "avi",
    "epub",
  ];

  const onFileSelect = (file) => {
    if (file && file.size > 10000000) {
      toast.warn("File size is more than 10MB");
      setErrorMsg("Max file upload size is 10MB");
      return;
    }

    const fileExtension = file.name.split(".").pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      toast.warn("File type not allowed");
      setErrorMsg(
        `File type not allowed. Allowed types: ${allowedExtensions.join(", ")}`
      );
      return;
    }

    setErrorMsg(null);
    setFile(file);
  };

  async function generateKey(password, salt, keyLength = 256) {
    const algo = {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: new TextEncoder().encode(salt),
      iterations: 1000,
    };
    const baseKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
    const aesKey = await crypto.subtle.deriveKey(
      algo,
      baseKey,
      { name: "AES-GCM", length: keyLength },
      true,
      ["encrypt", "decrypt"]
    );

    return aesKey;
  }

  const encryptFile = async (file, password) => {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await generateKey(password, salt);

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedContent = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      await file.arrayBuffer()
    );

    return new Blob([salt, iv, new Uint8Array(encryptedContent)]);
  };

  const upload = async (e) => {
    e.preventDefault();

    if (receiverEmail.length === 0) {
      toast.warn("Please enter value for email");
      return;
    }

    if (!receiversEmailSchema.safeParse(receiverEmail).success) {
      toast.warn("Please enter valid email");
      return;
    }

    if (!passwordSchema.safeParse(filePassword).success) {
      toast.warn("File password must be minimum 20 characters and must be string");
      return;
    }

    if (!hasUpperCase(filePassword)) {
      toast.warn("File password should have at least 1 uppercase character");
      return;
    }

    try {
      const hashedPassword = await hashPassword(filePassword);


      const encryptedFile = await encryptFile(file, filePassword);


      let formData = new FormData();
      formData.append("encryptedFile", encryptedFile);
      formData.append("originalName", file.name);
      formData.append("receiverEmail", receiverEmail);
      formData.append("password", hashedPassword);


      await axios.post("http://localhost:4000", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("File successfully uploaded");
    } catch (error) {
      console.log(error);
      toast.error("Error uploading file");
    }
  };

  const hasUpperCase = (str) => {
    return str !== str.toLowerCase();
  };

  const hashPassword = async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  return (
    <div className="text-center">
  {/* Dropzone Section */}
  <div className="flex items-center justify-center w-full">
    <label
      htmlFor="dropzone-file"
      className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-blue-500 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:hover:border-gray-400 dark:hover:bg-gray-700 transition-all rounded-xl shadow-md cursor-pointer"
    >
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        <svg
          className="w-14 h-14 mb-3 text-blue-500 dark:text-gray-300"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 20 16"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
          />
        </svg>
        <p className="mb-2 text-lg md:text-xl text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Click to upload</span> or{" "}
          <span className="text-blue-500 font-semibold">drag & drop</span>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          (Max Size: <span className="font-semibold">10MB</span>)
        </p>
      </div>
      <input
        id="dropzone-file"
        type="file"
        className="hidden"
        onChange={(event) => onFileSelect(event.target.files[0])}
      />
    </label>
  </div>

  {/* File Preview */}
  {file && <FilePreview file={file} removeFile={() => setFile(null)} />}

  {/* Email Input */}
  <div className="my-6 w-full max-w-md mx-auto">
    <label
      htmlFor="receiver-email-input"
      className="block text-lg font-medium text-gray-900 dark:text-gray-200"
    >
      Enter Receiver's Email Address
    </label>
    <input
      required
      type="email"
      placeholder="Enter Receiver's Email"
      value={receiverEmail}
      onChange={(e) => setReceiverEmail(e.target.value)}
      id="receiver-email-input"
      className="block w-full mt-2 p-3 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all"
    />
  </div>

  {/* Password Input */}
  <AdvancedPasswordInput
    seePassword={seePassword}
    setSeePassword={setSeePassword}
    filePassword={filePassword}
    setFilePassword={setFilePassword}
    idValue="file-password-encrypt"
    placeValue="Set File Password"
  />

  {/* Error Message */}
  {errorMsg && (
    <div className="w-full bg-red-500 text-white py-2 px-4 mt-4 rounded-md flex items-center gap-2">
      <svg
        className="h-6 w-6 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span className="font-bold">Error! {errorMsg}</span>
    </div>
  )}

  {/* Security Note */}
  <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
    🔒 <strong>Important:</strong> Copy and send the password to the receiver.
    Due to security reasons, we do not send file passwords.
  </p>

  {/* Buttons & Upload Progress */}
  <div className="flex flex-col w-full items-center mt-6">
    <CopyToClipboardBtn filePassword={filePassword} />

    {progress === 0 ? (
      <ProgressBar progress={progress} />
    ) : (
      <button
        disabled={!file}
        className="mt-5 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all disabled:bg-gray-400"
        onClick={(e) => upload(e)}
      >
        Send Now
      </button>
    )}
  </div>
</div>

  );
};

export default UploadForm;
