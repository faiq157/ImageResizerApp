import React from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator, withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
import ImageUploader from './components/ImageUploader';
import './App.css';

Amplify.configure(awsExports);

function App() {
  return (

    <div className="min-h-screen w-[100vw] bg-gradient-to-br  flex items-center justify-center p-4">
      <Authenticator>
        {({ signOut, user }) => (
          <main className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-3xl w-full p-8 flex flex-col gap-6">
            <header className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Welcome to the Image Resizer App
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-1">
                This app allows you to resize images easily.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Feel free to upload and resize your images.
              </p>
            </header>

            <section>
              <ImageUploader />
            </section>

            <footer className="flex justify-between items-center mt-4 text-gray-700 dark:text-gray-400">
              <p>
                Current User:{" "}
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {user ? user.username : "Not signed in"}
                </span>
              </p>
              <button
                onClick={signOut}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Sign Out"
              >
                Sign Out
              </button>
            </footer>
          </main>
        )}
      </Authenticator>
    </div>
  );
}

export default withAuthenticator(App);
