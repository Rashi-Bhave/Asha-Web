import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn } from '../../Services/Auth.service';
import { toast } from 'react-hot-toast';
import { createTweetService } from '../../Services/Tweet.service';

function Reply({ replyOf = '', onReplySuccess }) {
    const [content, setContent] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            // Create preview URL
            const fileUrl = URL.createObjectURL(selectedFile);
            setPreview(fileUrl);
        }
    };

    const removeFile = () => {
        setFile(null);
        if (preview) {
            URL.revokeObjectURL(preview);
            setPreview(null);
        }
    };

    const handleTweetCreate = async () => {
        if (!isLoggedIn()) {
            toast.error('Neural authentication required');
            navigate('/login');
            return;
        }
        
        if (!content.trim()) {
            toast.error('Data stream cannot be empty');
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            const response = await createTweetService(content, replyOf, file);
            if (response) {
                toast.success(replyOf ? 'Neural link established' : 'Data stream initialized');
                setContent('');
                setFile(null);
                setPreview(null);
                if (onReplySuccess) onReplySuccess();
            }
        } catch (error) {
            toast.error('Transmission failed - retry sequence');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="cyber-reply-container">
            <div className="cyber-reply-textarea-wrapper">
                <textarea
                    placeholder={replyOf ? "Compose neural response sequence..." : "Initialize new data transmission..."}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="cyber-reply-textarea"
                />
                <div className="cyber-reply-char-counter">
                    <span className={content.length > 500 ? 'cyber-counter-warning' : ''}>{content.length}</span> units
                </div>
                
                {/* Decorative elements */}
                <div className="cyber-corner cyber-corner-tl"></div>
                <div className="cyber-corner cyber-corner-tr"></div>
                <div className="cyber-corner cyber-corner-bl"></div>
                <div className="cyber-corner cyber-corner-br"></div>
            </div>
            
            {/* Image preview */}
            {preview && (
                <div className="cyber-image-preview-container">
                    <div className="cyber-image-preview-wrapper">
                        <img 
                            src={preview} 
                            alt="Visual data preview" 
                            className="cyber-image-preview"
                        />
                        <button 
                            onClick={removeFile}
                            className="cyber-image-remove-button"
                            aria-label="Remove image"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                        
                        {/* Decorative elements */}
                        <div className="cyber-corner cyber-corner-tl"></div>
                        <div className="cyber-corner cyber-corner-tr"></div>
                        <div className="cyber-corner cyber-corner-bl"></div>
                        <div className="cyber-corner cyber-corner-br"></div>
                        <div className="cyber-scan-line"></div>
                    </div>
                </div>
            )}

            <div className="cyber-reply-controls">
                <label className="cyber-upload-button">
                    <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Attach Visual Data</span>
                    <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileChange}
                    />
                </label>
                
                <button
                    onClick={handleTweetCreate}
                    disabled={isSubmitting || !content.trim()}
                    className={`cyber-submit-button ${
                        isSubmitting || !content.trim() ? 'cyber-button-disabled' : ''
                    }`}
                >
                    {isSubmitting ? (
                        <>
                            <div className="cyber-loading-spinner"></div>
                            <span>{replyOf ? 'Establishing Link...' : 'Transmitting...'}</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            <span>{replyOf ? 'Establish Neural Link' : 'Initialize Transmission'}</span>
                        </>
                    )}
                </button>
            </div>

            {/* CSS for cyberpunk styling */}
            <style jsx>{`
                .cyber-reply-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    width: 100%;
                    font-family: 'JetBrains Mono', monospace;
                }
                
                .cyber-reply-textarea-wrapper {
                    position: relative;
                    width: 100%;
                }
                
                .cyber-reply-textarea {
                    width: 100%;
                    min-height: 120px;
                    padding: 1rem;
                    background: rgba(15, 23, 42, 0.6);
                    border: 1px solid rgba(6, 182, 212, 0.3);
                    border-radius: 0.375rem;
                    color: rgb(226, 232, 240);
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 0.875rem;
                    resize: vertical;
                    transition: all 0.2s;
                }
                
                .cyber-reply-textarea:focus {
                    outline: none;
                    border-color: rgba(6, 182, 212, 0.5);
                    box-shadow: 0 0 10px rgba(6, 182, 212, 0.2);
                    background: rgba(15, 23, 42, 0.8);
                }
                
                .cyber-reply-textarea::placeholder {
                    color: rgba(6, 182, 212, 0.5);
                }
                
                .cyber-reply-char-counter {
                    position: absolute;
                    right: 0.75rem;
                    bottom: 0.75rem;
                    font-size: 0.75rem;
                    color: rgba(6, 182, 212, 0.7);
                }
                
                .cyber-counter-warning {
                    color: rgb(248, 113, 113);
                }
                
                .cyber-image-preview-container {
                    display: inline-block;
                }
                
                .cyber-image-preview-wrapper {
                    position: relative;
                    border: 1px solid rgba(6, 182, 212, 0.3);
                    border-radius: 0.375rem;
                    overflow: hidden;
                    padding: 0.25rem;
                    background: rgba(15, 23, 42, 0.6);
                }
                
                .cyber-image-preview {
                    max-height: 10rem;
                    max-width: 100%;
                    object-fit: contain;
                    border-radius: 0.25rem;
                }
                
                .cyber-image-remove-button {
                    position: absolute;
                    top: 0.5rem;
                    right: 0.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 1.5rem;
                    height: 1.5rem;
                    background: rgba(15, 23, 42, 0.8);
                    border: 1px solid rgba(220, 38, 38, 0.5);
                    border-radius: 9999px;
                    color: rgb(248, 113, 113);
                    transition: all 0.2s;
                }
                
                .cyber-image-remove-button:hover {
                    background: rgba(127, 29, 29, 0.8);
                    color: white;
                    box-shadow: 0 0 8px rgba(220, 38, 38, 0.5);
                }
                
                .cyber-reply-controls {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 0.5rem;
                }
                
                .cyber-upload-button {
                    display: flex;
                    align-items: center;
                    padding: 0.5rem 0.75rem;
                    background: rgba(15, 23, 42, 0.6);
                    border: 1px solid rgba(6, 182, 212, 0.3);
                    border-radius: 0.375rem;
                    color: rgb(6, 182, 212);
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .cyber-upload-button:hover {
                    background: rgba(15, 23, 42, 0.8);
                    border-color: rgba(6, 182, 212, 0.5);
                    box-shadow: 0 0 8px rgba(6, 182, 212, 0.3);
                }
                
                .cyber-submit-button {
                    display: flex;
                    align-items: center;
                    padding: 0.5rem 1rem;
                    background: linear-gradient(135deg, rgba(6, 182, 212, 0.8), rgba(6, 182, 212, 0.6));
                    border: none;
                    border-radius: 0.375rem;
                    color: rgb(15, 23, 42);
                    font-size: 0.875rem;
                    font-weight: 600;
                    font-family: 'JetBrains Mono', monospace;
                    transition: all 0.2s;
                    position: relative;
                    overflow: hidden;
                }
                
                .cyber-submit-button::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                    transition: all 0.6s;
                }
                
                .cyber-submit-button:hover:not(.cyber-button-disabled) {
                    box-shadow: 0 0 15px rgba(6, 182, 212, 0.5);
                    transform: translateY(-1px);
                }
                
                .cyber-submit-button:hover:not(.cyber-button-disabled)::before {
                    left: 100%;
                }
                
                .cyber-button-disabled {
                    background: rgba(15, 23, 42, 0.4);
                    color: rgba(226, 232, 240, 0.5);
                    cursor: not-allowed;
                }
                
                .cyber-loading-spinner {
                    width: 1rem;
                    height: 1rem;
                    margin-right: 0.5rem;
                    border: 2px solid rgba(15, 23, 42, 0.3);
                    border-top-color: rgb(15, 23, 42);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                /* Cyber corners */
                .cyber-corner {
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    z-index: 1;
                }
                
                .cyber-corner-tl {
                    top: 0;
                    left: 0;
                    border-top: 1px solid rgb(6, 182, 212);
                    border-left: 1px solid rgb(6, 182, 212);
                }
                
                .cyber-corner-tr {
                    top: 0;
                    right: 0;
                    border-top: 1px solid rgb(6, 182, 212);
                    border-right: 1px solid rgb(6, 182, 212);
                }
                
                .cyber-corner-bl {
                    bottom: 0;
                    left: 0;
                    border-bottom: 1px solid rgb(6, 182, 212);
                    border-left: 1px solid rgb(6, 182, 212);
                }
                
                .cyber-corner-br {
                    bottom: 0;
                    right: 0;
                    border-bottom: 1px solid rgb(6, 182, 212);
                    border-right: 1px solid rgb(6, 182, 212);
                }
                
                .cyber-scan-line {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.8), transparent);
                    animation: scan-line 2s linear infinite;
                    opacity: 0.5;
                }
                
                @keyframes scan-line {
                    0% { top: 0; }
                    100% { top: 100%; }
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default Reply;