import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';

Amplify.configure(awsExports);


const ImageUploader = () => {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) return;

    try {
      // Step 1: Get the current authentication session
      const session = await fetchAuthSession();
      const idToken = session.idToken.jwtToken;
      console.log("ID Token:", idToken);
      // Step 2: Get pre-signed URL from API Gateway
      const response = await axios.get(
        'https://90la2ucvwg.execute-api.ap-southeast-2.amazonaws.com/dev/presigned-url',
        {
          params: {
            fileName: file.name,
            fileType: file.type,
          },
          headers: {
            Authorization: idToken,
          },
        }
      );

      const { uploadURL } = response.data;

      // Step 3: Upload file to S3 via the signed URL
      await axios.put(uploadURL, file, {
        headers: {
          'Content-Type': file.type,
        },
      });

      alert('Image uploaded successfully!');
    } catch (err) {
      console.error('Upload error:', err);
      alert('Error uploading image');
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleUpload}>Upload Image</button>
    </div>
  );
};

export default ImageUploader;
