import React, { useState, useCallback } from 'react';
import { editImageWithPrompt } from '../services/geminiService';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const ImageEditor: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) { // 4MB limit
                setError('Image size should be less than 4MB.');
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setEditedImage(null);
            setError(null);
        }
    };

    const handleGenerate = useCallback(async () => {
        if (!imageFile || !prompt.trim()) {
            setError('Please upload an image and provide an editing prompt.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setEditedImage(null);

        try {
            const imagePart = await fileToGenerativePart(imageFile);
            const generatedImage = await editImageWithPrompt(imagePart, prompt);
            setEditedImage(`data:image/png;base64,${generatedImage}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred during image generation.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [imageFile, prompt]);
    
    return (
        <div className="w-full max-w-6xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-2">AI Image Editor</h2>
            <p className="text-gray-400 mb-6">Upload an image and use a text prompt to edit it with Gemini.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div>
                    {/* Image Upload */}
                    <div className="mb-6">
                        <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300 mb-2">
                            1. Upload Image
                        </label>
                        <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="mx-auto h-48 w-auto rounded-md" />
                                ) : (
                                    <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                                <div className="flex text-sm text-gray-500 justify-center">
                                    <label htmlFor="image-upload" className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-indigo-500 px-2 py-1">
                                        <span>{imageFile ? 'Change image' : 'Upload a file'}</span>
                                        <input id="image-upload" name="image-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
                                    </label>
                                    <p className="pl-1 hidden sm:block">{imageFile ? imageFile.name : 'or drag and drop'}</p>
                                </div>
                                <p className="text-xs text-gray-600">PNG, JPG, WEBP up to 4MB</p>
                            </div>
                        </div>
                    </div>

                    {/* Prompt Input */}
                    <div>
                        <label htmlFor="edit-prompt" className="block text-sm font-medium text-gray-300 mb-2">
                            2. Describe your edit
                        </label>
                        <textarea
                            id="edit-prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., Add a retro filter, make the sky look like a sunset, remove the person in the background"
                            className="w-full h-24 p-4 bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none text-gray-200 placeholder-gray-500"
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div className="mt-6">
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || !imageFile || !prompt.trim()}
                            className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                            >
                            {isLoading ? (
                                <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                                </>
                            ) : (
                                'Generate Edited Image'
                            )}
                        </button>
                    </div>
                </div>

                {/* Output Section */}
                <div className="bg-gray-900 rounded-lg flex items-center justify-center p-4 min-h-[300px] lg:min-h-full border border-gray-700">
                    {isLoading && (
                        <div className="text-center text-gray-400">
                            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-600 h-12 w-12 mb-4 mx-auto animate-spin" style={{borderTopColor: '#6366F1'}}></div>
                            <p>Editing in progress...</p>
                        </div>
                    )}
                    {error && (
                        <div className="text-center text-red-400 p-4 bg-red-900/20 border border-red-500 rounded-md">
                            <h4 className="font-bold mb-2">Error</h4>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}
                    {!isLoading && !error && editedImage && (
                        <img src={editedImage} alt="Edited result" className="max-h-full max-w-full object-contain rounded-md" />
                    )}
                    {!isLoading && !error && !editedImage && (
                        <div className="text-center text-gray-600">
                            <p>Your edited image will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = `
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
}
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);