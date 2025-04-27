import React, { useEffect, useState } from 'react';
import { fetchTweets } from '../../Services/Tweet.service';
import Reply from './Reply';
import Loading from '../Loading/Loading.jsx';

const Discuss = () => {
    const [tweets, setTweets] = useState(null);
    const [replyToTweetId, setReplyToTweetId] = useState(null);
    const [hasNewReply, setHasNewReply] = useState(false);
    
    useEffect(() => {
        const helper = async () => {
            const response = await fetchTweets();
            setTweets(response);
        };
        helper();
    }, [replyToTweetId, hasNewReply]);  

    if (tweets === null) return (<Loading />);

    return (
        <div className="cyber-discuss-container">
            <div className="cyber-discuss-content">
                <h1 className="cyber-main-title">
                    <svg className="cyber-title-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                    Neural Network Exchange Hub
                    <span className="cyber-blink">_</span>
                </h1>
                
                {/* Create new post */}
                <div className="cyber-panel">
                    <div className="cyber-panel-header">
                        <h2 className="cyber-panel-title">
                            <svg className="mr-2 h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                            </svg>
                            Initialize New Data Stream
                        </h2>
                    </div>
                    <div className="cyber-panel-body">
                        <Reply onReplySuccess={() => setHasNewReply(!hasNewReply)} />
                    </div>
                    
                    {/* Decorative elements */}
                    <div className="cyber-corner cyber-corner-tl"></div>
                    <div className="cyber-corner cyber-corner-tr"></div>
                    <div className="cyber-corner cyber-corner-bl"></div>
                    <div className="cyber-corner cyber-corner-br"></div>
                    <div className="cyber-scan-line"></div>
                </div>

                {/* Posts list */}
                <div className="cyber-discussions-section">
                    <h2 className="cyber-section-title">
                        <svg className="mr-2 h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        Active Data Streams
                    </h2>
                    
                    {tweets && tweets.length > 0 ? (
                        <div className="cyber-discussions-list">
                            {tweets.map((tweet, index) => (
                                <div key={index} className="cyber-discussion-item">
                                    {/* Post header */}
                                    <div className="cyber-discussion-header">
                                        <div className="cyber-user-info">
                                            <div className="cyber-avatar-container">
                                                {tweet?.owner?.avatar ? (
                                                    <img 
                                                        src={tweet.owner.avatar} 
                                                        alt={`${tweet.owner?.username || 'User'}'s avatar`} 
                                                        className="cyber-avatar-img"
                                                    />
                                                ) : (
                                                    <div className="cyber-avatar-placeholder">
                                                        {(tweet.owner?.username || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="cyber-user-details">
                                                <p className="cyber-username">
                                                    {tweet.owner?.username || 'Anonymous Entity'}
                                                </p>
                                                <p className="cyber-timestamp">
                                                    {new Date(tweet.createdAt).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Post content */}
                                    <div className="cyber-discussion-content">
                                        <p className="cyber-message-text">{tweet.content}</p>
                                        
                                        {tweet.image && (
                                            <div className="cyber-image-container">
                                                <img 
                                                    src={tweet.image} 
                                                    alt="Attached data visualization" 
                                                    className="cyber-attached-image"
                                                />
                                                
                                                {/* Decorative corners for image */}
                                                <div className="cyber-corner cyber-corner-tl"></div>
                                                <div className="cyber-corner cyber-corner-tr"></div>
                                                <div className="cyber-corner cyber-corner-bl"></div>
                                                <div className="cyber-corner cyber-corner-br"></div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Replies */}
                                    {tweet.replys && tweet.replys.length > 0 && (
                                        <div className="cyber-replies-section">
                                            <h3 className="cyber-replies-title">
                                                <svg className="h-4 w-4 mr-1.5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                                                </svg>
                                                Neural Responses <span className="cyber-reply-count">{tweet.replys.length}</span>
                                            </h3>
                                            <div className="cyber-replies-list">
                                                {tweet.replys.map((reply, replyIndex) => (
                                                    <div key={replyIndex} className="cyber-reply-item">
                                                        <div className="cyber-reply-avatar">
                                                            {reply?.owner?.avatar ? (
                                                                <img 
                                                                    src={reply.owner.avatar} 
                                                                    alt={`${reply.owner?.username || 'User'}'s avatar`}
                                                                    className="cyber-avatar-img-sm" 
                                                                />
                                                            ) : (
                                                                <div className="cyber-avatar-placeholder-sm">
                                                                    {(reply.owner?.username || 'U').charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="cyber-reply-content">
                                                            <div className="cyber-reply-header">
                                                                <p className="cyber-reply-username">
                                                                    {reply.owner?.username || 'Anonymous Entity'}
                                                                </p>
                                                                <p className="cyber-reply-timestamp">
                                                                    {new Date(reply.createdAt).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                            <p className="cyber-reply-text">{reply.content}</p>
                                                            
                                                            {/* Decorative elements */}
                                                            <div className="cyber-corner cyber-corner-tl"></div>
                                                            <div className="cyber-corner cyber-corner-tr"></div>
                                                            <div className="cyber-corner cyber-corner-bl"></div>
                                                            <div className="cyber-corner cyber-corner-br"></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Reply form */}
                                    <div className="cyber-discussion-footer">
                                        {replyToTweetId === tweet._id ? (
                                            <div className="cyber-reply-form">
                                                <h3 className="cyber-reply-form-title">
                                                    <svg className="h-4 w-4 mr-1.5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                    </svg>
                                                    Compose Neural Response
                                                </h3>
                                                <Reply 
                                                    replyOf={replyToTweetId} 
                                                    onReplySuccess={() => {
                                                        setHasNewReply(!hasNewReply);
                                                        setReplyToTweetId(null);
                                                    }} 
                                                />
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => setReplyToTweetId(tweet._id)}
                                                className="cyber-reply-button"
                                            >
                                                <svg className="h-4 w-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                                </svg>
                                                Establish Neural Link
                                            </button>
                                        )}
                                    </div>
                                    
                                    {/* Decorative elements */}
                                    <div className="cyber-corner cyber-corner-tl"></div>
                                    <div className="cyber-corner cyber-corner-tr"></div>
                                    <div className="cyber-corner cyber-corner-bl"></div>
                                    <div className="cyber-corner cyber-corner-br"></div>
                                    <div className="cyber-scan-line"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="cyber-empty-state">
                            <div className="cyber-empty-icon">
                                <svg className="h-12 w-12 text-cyan-400 opacity-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <div className="cyber-pulse-circle"></div>
                            </div>
                            <h3 className="cyber-empty-title">Neural Network Awaiting Input</h3>
                            <p className="cyber-empty-message">Initiate the first data transmission sequence</p>
                            
                            {/* Decorative elements */}
                            <div className="cyber-corner cyber-corner-tl"></div>
                            <div className="cyber-corner cyber-corner-tr"></div>
                            <div className="cyber-corner cyber-corner-bl"></div>
                            <div className="cyber-corner cyber-corner-br"></div>
                            <div className="cyber-scan-line"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* CSS for cyberpunk styling */}
            <style jsx>{`
                .cyber-discuss-container {
                    min-height: 100vh;
                    background-color: rgba(15, 23, 42, 0.95);
                    padding: 2rem 1rem;
                    position: relative;
                    overflow: hidden;
                }
                
                .cyber-discuss-container::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-image: 
                        linear-gradient(to right, rgba(6, 182, 212, 0.05) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(6, 182, 212, 0.05) 1px, transparent 1px);
                    background-size: 50px 50px;
                    pointer-events: none;
                    z-index: 0;
                }
                
                .cyber-discuss-content {
                    max-width: 4xl;
                    margin: 0 auto;
                    position: relative;
                    z-index: 1;
                }
                
                .cyber-main-title {
                    display: flex;
                    align-items: center;
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: rgb(6, 182, 212);
                    margin-bottom: 1.5rem;
                    font-family: 'JetBrains Mono', monospace;
                    letter-spacing: 0.05em;
                    text-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
                }
                
                .cyber-title-icon {
                    height: 1.75rem;
                    width: 1.75rem;
                    margin-right: 0.75rem;
                    color: rgb(6, 182, 212);
                }
                
                .cyber-blink {
                    animation: blink 1s step-end infinite;
                }
                
                .cyber-panel {
                    position: relative;
                    background: rgba(17, 24, 39, 0.7);
                    border: 1px solid rgba(6, 182, 212, 0.3);
                    border-radius: 0.5rem;
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                    backdrop-filter: blur(10px);
                    box-shadow: 
                        0 4px 6px -1px rgba(0, 0, 0, 0.1),
                        0 2px 4px -1px rgba(0, 0, 0, 0.06),
                        0 0 0 1px rgba(6, 182, 212, 0.1) inset,
                        0 0 20px rgba(6, 182, 212, 0.1);
                    overflow: hidden;
                }
                
                .cyber-panel-header {
                    margin-bottom: 1rem;
                    padding-bottom: 0.75rem;
                    border-bottom: 1px solid rgba(6, 182, 212, 0.2);
                }
                
                .cyber-panel-title {
                    display: flex;
                    align-items: center;
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: rgb(6, 182, 212);
                    font-family: 'JetBrains Mono', monospace;
                    letter-spacing: 0.05em;
                }
                
                .cyber-panel-body {
                    padding: 0.5rem 0;
                }
                
                .cyber-discussions-section {
                    margin-top: 2rem;
                }
                
                .cyber-section-title {
                    display: flex;
                    align-items: center;
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: rgb(6, 182, 212);
                    margin-bottom: 1rem;
                    font-family: 'JetBrains Mono', monospace;
                    letter-spacing: 0.05em;
                }
                
                .cyber-discussions-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                
                .cyber-discussion-item {
                    position: relative;
                    background: rgba(17, 24, 39, 0.7);
                    border: 1px solid rgba(6, 182, 212, 0.3);
                    border-radius: 0.5rem;
                    overflow: hidden;
                    backdrop-filter: blur(10px);
                    box-shadow: 
                        0 4px 6px -1px rgba(0, 0, 0, 0.1),
                        0 2px 4px -1px rgba(0, 0, 0, 0.06),
                        0 0 0 1px rgba(6, 182, 212, 0.1) inset,
                        0 0 20px rgba(6, 182, 212, 0.1);
                }
                
                .cyber-discussion-header {
                    padding: 1rem;
                    border-bottom: 1px solid rgba(6, 182, 212, 0.2);
                }
                
                .cyber-user-info {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.75rem;
                }
                
                .cyber-avatar-container {
                    flex-shrink: 0;
                    width: 2.5rem;
                    height: 2.5rem;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 1px solid rgba(6, 182, 212, 0.3);
                    background: rgba(15, 23, 42, 0.5);
                    position: relative;
                }
                
                .cyber-avatar-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .cyber-avatar-placeholder {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(6, 182, 212, 0.1));
                    color: rgb(6, 182, 212);
                    font-weight: 600;
                    font-size: 1rem;
                }
                
                .cyber-user-details {
                    min-width: 0;
                    flex: 1;
                }
                
                .cyber-username {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: rgb(226, 232, 240);
                    font-family: 'JetBrains Mono', monospace;
                }
                
                .cyber-timestamp {
                    font-size: 0.75rem;
                    color: rgba(6, 182, 212, 0.7);
                    font-family: 'JetBrains Mono', monospace;
                }
                
                .cyber-discussion-content {
                    padding: 1rem;
                }
                
                .cyber-message-text {
                    color: rgb(226, 232, 240);
                    white-space: pre-line;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 0.875rem;
                    line-height: 1.5;
                }
                
                .cyber-image-container {
                    position: relative;
                    margin-top: 0.75rem;
                    border-radius: 0.375rem;
                    overflow: hidden;
                    border: 1px solid rgba(6, 182, 212, 0.3);
                    padding: 0.25rem;
                    background: rgba(15, 23, 42, 0.5);
                }
                
                .cyber-attached-image {
                    width: 100%;
                    height: auto;
                    object-fit: contain;
                    max-height: 24rem;
                    border-radius: 0.25rem;
                }
                
                .cyber-replies-section {
                    background: rgba(15, 23, 42, 0.5);
                    border-top: 1px solid rgba(6, 182, 212, 0.2);
                    padding: 1rem;
                }
                
                .cyber-replies-title {
                    display: flex;
                    align-items: center;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: rgb(6, 182, 212);
                    margin-bottom: 1rem;
                    font-family: 'JetBrains Mono', monospace;
                    letter-spacing: 0.05em;
                }
                
                .cyber-reply-count {
                    margin-left: 0.5rem;
                    padding: 0.125rem 0.375rem;
                    background: rgba(6, 182, 212, 0.2);
                    border: 1px solid rgba(6, 182, 212, 0.3);
                    border-radius: 0.25rem;
                    font-size: 0.75rem;
                    color: rgb(6, 182, 212);
                }
                
                .cyber-replies-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                
                .cyber-reply-item {
                    display: flex;
                    gap: 0.75rem;
                }
                
                .cyber-reply-avatar {
                    flex-shrink: 0;
                    width: 2rem;
                    height: 2rem;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 1px solid rgba(6, 182, 212, 0.3);
                }
                
                .cyber-avatar-img-sm {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .cyber-avatar-placeholder-sm {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(6, 182, 212, 0.1));
                    color: rgb(6, 182, 212);
                    font-weight: 600;
                    font-size: 0.75rem;
                }
                
                .cyber-reply-content {
                    position: relative;
                    flex: 1;
                    min-width: 0;
                    background: rgba(17, 24, 39, 0.7);
                    border: 1px solid rgba(6, 182, 212, 0.2);
                    border-radius: 0.375rem;
                    padding: 0.75rem;
                    overflow: hidden;
                }
                
                .cyber-reply-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.25rem;
                }
                
                .cyber-reply-username {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: rgb(226, 232, 240);
                    font-family: 'JetBrains Mono', monospace;
                }
                
                .cyber-reply-timestamp {
                    font-size: 0.7rem;
                    color: rgba(6, 182, 212, 0.7);
                    font-family: 'JetBrains Mono', monospace;
                }
                
                .cyber-reply-text {
                    font-size: 0.8125rem;
                    color: rgb(226, 232, 240);
                    font-family: 'JetBrains Mono', monospace;
                }
                
                .cyber-discussion-footer {
                    border-top: 1px solid rgba(6, 182, 212, 0.2);
                    padding: 1rem;
                }
                
                .cyber-reply-form {
                    width: 100%;
                }
                
                .cyber-reply-form-title {
                    display: flex;
                    align-items: center;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: rgb(6, 182, 212);
                    margin-bottom: 0.75rem;
                    font-family: 'JetBrains Mono', monospace;
                    letter-spacing: 0.05em;
                }
                
                .cyber-reply-button {
                    display: inline-flex;
                    align-items: center;
                    padding: 0.5rem 0.75rem;
                    background: rgba(15, 23, 42, 0.8);
                    border: 1px solid rgba(6, 182, 212, 0.3);
                    border-radius: 0.375rem;
                    color: rgb(6, 182, 212);
                    font-size: 0.8125rem;
                    font-weight: 500;
                    font-family: 'JetBrains Mono', monospace;
                    transition: all 0.2s;
                }
                
                .cyber-reply-button:hover {
                    background: rgba(15, 23, 42, 1);
                    border-color: rgba(6, 182, 212, 0.5);
                    box-shadow: 0 0 8px rgba(6, 182, 212, 0.4);
                }
                
                .cyber-empty-state {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem 1rem;
                    background: rgba(17, 24, 39, 0.7);
                    border: 1px solid rgba(6, 182, 212, 0.3);
                    border-radius: 0.5rem;
                    backdrop-filter: blur(10px);
                    box-shadow: 
                        0 4px 6px -1px rgba(0, 0, 0, 0.1),
                        0 2px 4px -1px rgba(0, 0, 0, 0.06),
                        0 0 0 1px rgba(6, 182, 212, 0.1) inset,
                        0 0 20px rgba(6, 182, 212, 0.1);
                    overflow: hidden;
                }
                
                .cyber-empty-icon {
                    position: relative;
                    margin-bottom: 1rem;
                }
                
                .cyber-pulse-circle {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 5rem;
                    height: 5rem;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, transparent 70%);
                    animation: pulse 2s infinite;
                }
                
                .cyber-empty-title {
                    font-size: 1rem;
                    font-weight: 600;
                    color: rgb(6, 182, 212);
                    margin-bottom: 0.5rem;
                    font-family: 'JetBrains Mono', monospace;
                    letter-spacing: 0.05em;
                }
                
                .cyber-empty-message {
                    font-size: 0.875rem;
                    color: rgba(226, 232, 240, 0.7);
                    font-family: 'JetBrains Mono', monospace;
                }
                
                /* Cyber corners */
                .cyber-corner {
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    z-index: 1;
                }
                
                .cyber-corner-tl {
                    top: 0;
                    left: 0;
                    border-top: 2px solid rgb(6, 182, 212);
                    border-left: 2px solid rgb(6, 182, 212);
                }
                
                .cyber-corner-tr {
                    top: 0;
                    right: 0;
                    border-top: 2px solid rgb(6, 182, 212);
                    border-right: 2px solid rgb(6, 182, 212);
                }
                
                .cyber-corner-bl {
                    bottom: 0;
                    left: 0;
                    border-bottom: 2px solid rgb(6, 182, 212);
                    border-left: 2px solid rgb(6, 182, 212);
                }
                
                .cyber-corner-br {
                    bottom: 0;
                    right: 0;
                    border-bottom: 2px solid rgb(6, 182, 212);
                    border-right: 2px solid rgb(6, 182, 212);
                }
                
                .cyber-scan-line {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.8), transparent);
                    animation: scan-line 3s linear infinite;
                    opacity: 0.5;
                }
                
                @keyframes scan-line {
                    0% { top: 0; }
                    100% { top: 100%; }
                }
                
                @keyframes pulse {
                    0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
                    50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
                }
                
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default Discuss;