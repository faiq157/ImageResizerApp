import axios from 'axios';
const API_BASE_URL = 'https://90la2ucvwg.execute-api.ap-southeast-2.amazonaws.com/dev';
console.log("API_BASE_URL:", API_BASE_URL);

export const getPresignedUrl = async (file) => {
  try {
    // const session = await Auth.currentSession();
    // console.log("Current session:", session);

    const response = await axios.get(`${API_BASE_URL}/generate-presigned-url`, {
      params: {
        fileName: file.name,
        fileType: file.type,
      },
      
    });

    return response.data.uploadURL;
  } catch (error) {
    console.error("Error fetching pre-signed URL:", error);
    throw error;
  }
};

export const uploadToS3 = async (url, file) => {
  try {
    await axios.put(url, file, {
      headers: {
        'Content-Type': file.type,
      },
    });
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
};
