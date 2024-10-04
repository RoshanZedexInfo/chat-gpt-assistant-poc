import React from "react";

export default function ChatForm( {handleTextAreaChange, handleSubmit , isDisabled = false}: Readonly<{
    handleTextAreaChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    isDisabled: boolean;
    }>){
    return (
        <div className="w-full h-[10%]">
            <div className="w-full h-full px-5 py-2">
                <form onSubmit={handleSubmit}  className="w-full h-full flex justify-center">
                    <input type="textarea" onChange={handleTextAreaChange} placeholder="Type your message here" className="w-3/5 h-full border border-gray-500 rounded-lg p-2 border-r-0 rounded-r-none"/>
                    <button type="submit" disabled={isDisabled} className="w-[10%] h-full bg-emerald-300 border border-gray-500 border-l-0 rounded-lg rounded-l-none p-2 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300 focus:bg-violet-400 focus:text-white">Send</button>
                </form>
            </div>
        </div>
    );
}