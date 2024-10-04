import React, { Dispatch, SetStateAction } from "react";
import ThinkingDots from "../common/loader/thinking-dots";

interface UserPromptAndResponse {
    userPrompt: string;
    response: string;
}

export default function ChatResponseBox({ setPrevResponse, prevResponse , response , isThinking} : Readonly <{ setPrevResponse : Dispatch<SetStateAction<UserPromptAndResponse[]>>, prevResponse : Array<UserPromptAndResponse> , response : UserPromptAndResponse , isThinking : IsThinking}>) {
    React.useEffect(() => {
        if (response.userPrompt && response.response) {
            setPrevResponse([...prevResponse, response]);
        }
    }, [response]);
    return (
        <div className="w-full h-[88%] rounded-t-lg border-t border-red-600 p-5 overflow-scroll">
            {prevResponse.map((item, index) => {
                return (
                    <div key={index} className="w-full h-auto flex flex-col">
                        <div className="w-full h-auto">
                            <div className="w-4/5 h-auto mr-auto text-left my-5 p-4 rounded-xl bg-slate-100 border border-green-300">
                                <p className="text-gray-500 text-lg">@{item.userPrompt}</p>
                            </div>
                            <div className="w-4/5 h-auto ml-auto text-right my-5 p-4 rounded-xl bg-slate-100 border border-gray-300">
                                <p className="text-black text-lg">{item.response}</p>
                            </div>
                        </div>
                    </div>
                );
            }
            )}
            {isThinking.isThinking && <div className="w-full flex justify-end p-3"><div className=""><ThinkingDots/><p className="ml-3">{isThinking.message ?? ""}</p></div></div>
        //     (response.userPrompt && response.response &&  
        //      (<div className="w-full h-auto flex flex-col">
        //      <div className="w-full h-auto">
        //          <div className="w-4/5 h-auto mr-auto text-left my-5 p-4 rounded-xl bg-slate-100 border border-green-300">
        //              <p className="text-gray-500 text-lg">@{response.userPrompt}</p>
        //          </div>
        //          <div className="w-4/5 h-auto ml-auto text-right my-5 p-4 rounded-xl bg-slate-100 border border-gray-300">
        //              <p className="text-black text-lg">{response.response}</p>
        //          </div>
        //      </div>
        //  </div>))
         } 
        </div>
    );
}