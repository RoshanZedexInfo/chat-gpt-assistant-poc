"use client";

import React from "react";
import ChatForm from "../forms/chatForm";
import ChatResponseBox from "./chat-response-box";
import OpenAi from "../ai-tools/openAi";
import { aiConfig } from "@/ai.config";
import { RequiredActionFunctionToolCall, RunSubmitToolOutputsParams } from "openai/resources/beta/threads/index.js";
import { Run } from "openai/src/resources/beta/threads/index.js";

export default function ChatContainer(){
    const [userPrompt, setUserPrompt] = React.useState<string>("");
    const [prevResponse, setPrevResponse] = React.useState<Array<UserPromptAndResponse>>([]);
    const [rawResponse, setRawResponse] = React.useState<Run>();
    const [response, setResponse] = React.useState<UserPromptAndResponse>({userPrompt: "", response: ""});
    const [isDisabled, setIsDisabled] = React.useState<boolean>(false);
    const [isThinking, setIsThinking] = React.useState<IsThinking>({isThinking: false, message: ""});

    React.useEffect(() => {
        if (rawResponse && Object.keys(rawResponse).length > 0) {
            handleThreadInit();
            //wait 2 seconds before checking the status
            setTimeout(async () => {
                const statusResponse = await handleThreadStatus();
                const userResponse: UserPromptAndResponse = {
                    userPrompt: userPrompt,
                    response: statusResponse,
                };
                setResponse(userResponse);
                handleThreadEnd();
            }, 2000);
        }
    }, [rawResponse]);

    const openAi = OpenAi();

    const handleTextAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserPrompt(e.target.value);
    }

    const handleThreadInit = async () => {
        if (userPrompt === "" || isDisabled || isThinking.isThinking) {
            return;
        }
        setIsDisabled(true);
        setIsThinking({isThinking: true, message: "Thinking..."});
    }

    const handleThreadEnd = async () => {
        if (!isDisabled || !isThinking.isThinking) {
            return;
        }
        setIsDisabled(false);
        setIsThinking({isThinking: false, message: ""});
    }

    const handleSubmitToolOutputs = async (toolCalls : RequiredActionFunctionToolCall[]) => {
        const toolOutputs : Array<RunSubmitToolOutputsParams.ToolOutput> = [];
        console.log(toolCalls);
        for (let toolCall of toolCalls) {
            if (toolCall && toolCall?.type === 'function') {
                const functionName = toolCall?.function.name;
                const functionArguments = JSON.parse(toolCall?.function.arguments);
                
                if (functionName === 'get_weather') {
                    // Perform the weather fetching function
                    const weatherData = {
                        location: functionArguments.location,
                        temperature: 24,
                        humidity: 80,
                        wind_speed: 10
                    }
                    toolOutputs.push({
                        tool_call_id: toolCall?.id,
                        output: JSON.stringify(weatherData)
                    });
                }

                if (functionName === 'get_candidate_details'){
                    // Perform the candidate details fetching function
                    const assessments = [{
                        assessment_name: 'Python Assessment',
                        score: 90
                    },
                    {
                        assessment_name: 'JavaScript Assessment',
                        score: 80
                    }]

                    const fields = ["skills Python and JavaScript" , "experience 2 years" , "education Bachelors in Computer Science"];

                    const candidateDetails = {
                        candidate_name: functionArguments.name,
                        assessments: assessments,
                        include_skills: true,
                        fields: fields
                    }
                    toolOutputs.push({
                        tool_call_id: toolCall?.id,
                        output: JSON.stringify(candidateDetails)
                    });
                }
            }
        }
        return await openAi.submitToolOutputs(rawResponse?.thread_id as string, rawResponse?.id as string, {tool_outputs: toolOutputs});
    };

    const handleThreadQueued = async () => {
        return await openAi.pollThreadRunWithId(rawResponse?.thread_id as string, rawResponse?.id as string, 1000);
    }

    async function handleThreadStatus(){
        const lastError = 'Something went wrong';
        let message = "";
        let newRawResponse = rawResponse;
        setIsThinking({isThinking: true, message: rawResponse?.status});

        // Use switch case to handle different statuses
        switch (rawResponse?.status) {
            case "failed":
                // Handle failed status
                const error = rawResponse?.last_error;
                console.log(error);
                message = error && error?.message ? error.message : lastError;
                break;

            case "completed":
                // Handle completed status
                const messages = await openAi.loadThreadMessages(rawResponse?.thread_id as string);
                //loop through the messages and get the last message
                const userResponse: UserPromptAndResponse = {
                    userPrompt: userPrompt,
                    response: response.response,
                };
                messages.forEach((msg: ThreadLoadMessage) => {
                    if(msg?.username == "assistant"){
                        userResponse.response = msg?.body;
                    }
                    if(msg?.username == "user"){
                        userResponse.userPrompt = msg?.body;
                    }
                });
                message = userResponse.response;
                newRawResponse = {} as Run;
                break;

            case "requires_action":
                // Handle requires_action status
                const action = rawResponse?.required_action;
                if (action && action.type === "submit_tool_outputs") {
                    // Call the function to handle tool outputs
                    const handleRequiredAction = await handleSubmitToolOutputs(action.submit_tool_outputs.tool_calls);
                    newRawResponse = handleRequiredAction;
                }
                break;

            case "queued":
            case "in_progress":
                // Handle queued and in_progress statuses
                message = "Your request is in the queue. Please wait...";
                const queueResponse = await handleThreadQueued();
                newRawResponse = queueResponse;
                break;

            case "cancelled":
            case "cancelling":
            case "expired":
                // Handle failure, cancellation, or expiration
                message = `Message From OpenAI: ${(rawResponse?.last_error && rawResponse?.last_error?.message) || "Failed to create assessment, please try again"}`;
                newRawResponse = {} as Run;
                break;

            default:
                message = lastError;
                newRawResponse = {} as Run;
                break;
        }
        setRawResponse(newRawResponse);
        return message;
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await handleThreadInit();
        const assistant_id = aiConfig.assistantId || "";
        // const weatherResponse = await openAi.getWeather(userPrompt, assistant_id);
        const weatherResponse = await openAi.processUserPrompt(userPrompt, assistant_id);
        setRawResponse(weatherResponse);
    }

    return (
        <div className="w-4/5 h-[85vh] p-5 text-black m-auto">
            <div className="w-full h-full bg-white rounded-lg">
                <ChatResponseBox setPrevResponse={setPrevResponse} prevResponse={prevResponse} response={response} isThinking={isThinking}/>
                <ChatForm handleTextAreaChange={handleTextAreaChange} handleSubmit={handleSubmit} isDisabled={isDisabled}/>
            </div>
        </div>
    );
}