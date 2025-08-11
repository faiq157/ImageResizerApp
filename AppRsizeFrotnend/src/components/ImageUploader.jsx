import React, { useState } from "react";
import axios from "axios";

export default function ImageUploader() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [resizedUrl, setResizedUrl] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResizedUrl("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    try {
      setUploading(true);
      setMessage("");

      const fileName = encodeURIComponent(file.name);
      const fileType = encodeURIComponent(file.type);
      const presignedRes = await axios.get(
        `https://90la2ucvwg.execute-api.ap-southeast-2.amazonaws.com/dev/presigned-url?fileName=${fileName}&fileType=${fileType}`
      );

      const { uploadURL } = presignedRes.data;

      await axios.put(uploadURL, file, {
        headers: { "Content-Type": file.type },
      });

      setMessage(" File uploaded successfully!");
      const resizedPath = `uploads/resized/${file.name}`;
      const resizedUrlGuess = `https://image-resizer-uploads.s3.ap-southeast-2.amazonaws.com/${resizedPath}`;
      setResizedUrl(resizedUrlGuess);

    } catch (err) {
      console.error(err);
      setMessage(" Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white dark:bg-gray-900 shadow-lg rounded-2xl border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-center text-gray-800 dark:text-gray-200">
        Image Uploader
      </h2>

      <div className="flex flex-col items-center gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100 cursor-pointer"
        />

        {file && (
          <div className="w-40 h-40 overflow-hidden rounded-xl border shadow">
            <img
              src={URL.createObjectURL(file)}
              alt="Preview"
              className="object-cover w-full h-full"
            />
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg shadow-md disabled:opacity-50 transition-all"
        >
          {uploading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
              Uploading...
            </span>
          ) : (
            "Upload"
          )}
        </button>

        {message && (
          <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-300">
            {message}
          </p>
        )}

        {resizedUrl && (
          <div className="mt-4 text-center">
            <p className="text-sm font-medium text-green-600">
              Resized Image:
            </p>
            <img
              src={resizedUrl}
              alt="Resized"
              className="mt-2 w-48 h-48 object-cover rounded-xl border shadow"
            />
          </div>
        )}
      </div>
    </div>
  );
}
