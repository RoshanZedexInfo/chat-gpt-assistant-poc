import { aiConfig } from "@/ai.config";
import OpenAI from "openai";
import { Thread } from "openai/resources/beta/index.js";
import { MessageContent } from "openai/resources/beta/threads/messages.js";
import { Run, RunCreateParamsBase } from "openai/resources/beta/threads/runs/runs.js";
import { RunSubmitToolOutputsParamsNonStreaming } from "openai/src/resources/beta/threads/index.js";

const OpenAi = () => {

    //create a client
    const client = new OpenAI({
        apiKey: aiConfig.apiKey,
        dangerouslyAllowBrowser : true
    });

    //create a thread
    const createThread = async () => {
        return await client.beta.threads.create();
    };

    //add message to thread
    const addMessageToThread = async (thread:OpenAI.Beta.Threads.Thread, message:string) => {
        return await client.beta.threads.messages.create(thread.id, {
            role: "user",
            content: message,
        });
    }

    //create thread with message
    const createThreadWithMessage = async (message:string) => {
        const thread = await createThread();
        await addMessageToThread(thread, message);
        return thread;
    };

    //run the thread
    const runThread = async (thread:Thread,params: RunCreateParamsBase,
        options?: object) : Promise<Run> => {
        return await client.beta.threads.runs.create(thread.id, params, options) as Run;
    };

    //polling thread run status
    const pollThreadRun = async (thread : Thread, runId : string , time : number = 1000) : Promise<Run> => {
        const threadId = thread.id;
        const run = await client.beta.threads.runs.retrieve(threadId, runId);
        if (run && run?.status === "queued" || run?.status === "in_progress") {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(pollThreadRun(thread, runId, time));
                }, time);
            });
        }
        return run;
    };

    const pollThreadRunWithId = async (threadId : string, runId : string , time : number = 1000) : Promise<Run> => {
        const run = await client.beta.threads.runs.retrieve(threadId, runId);
        if (run && run?.status === "queued" || run?.status === "in_progress") {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(pollThreadRunWithId(threadId, runId, time));
                }, time);
            });
        }
        return run;
    };

    //handle submit tool outputs
    const submitToolOutputs = async (threadId : string , runId : string , body:RunSubmitToolOutputsParamsNonStreaming) => {
        return client.beta.threads.runs.submitToolOutputs(threadId, runId, body);
    };

    //get_weather function calling createThread and runThread
    const getWeather = async (location : string , assistant_id : string) => {
        const thread = await createThreadWithMessage("Get weather for " + location);
        if (!assistant_id) {
            throw new Error("Assistant ID not found");
        }
        const assistantRun = await runThread(thread, { assistant_id });
        const pollingResponse = await pollThreadRun(thread, assistantRun.id, 1000);
        return pollingResponse;
    };

    //process userPrompt and response
    const processUserPrompt = async (userPrompt : string ,  assistant_id : string) : Promise<Run> => {
        const thread = await createThreadWithMessage(userPrompt);
        const assistantRun = await runThread(thread, { assistant_id });
        const pollingResponse = await pollThreadRun(thread, assistantRun.id, 1000);
        return pollingResponse;
    };

    //run steps
    const runSteps = async (threadId : string) => {
        return await client.beta.threads.runs.list(threadId);
    };

    // load thread messages
    const loadThreadMessages = async (threadId : string ) : Promise<Array<ThreadLoadMessage>> => {
        const messages = await client.beta.threads.messages.list(threadId!);
        const sortedMessage : Array<ThreadLoadMessage>  = [];
        messages.data.map((message) => (
            sortedMessage.push({
        id: message.id,
        username: message.role === "user" ? 'user' : "assistant",
        body: message.content
            .map((content: MessageContent) => {
                if ('text' in content) {
                    return content.text.value;
                }
                return '';
            })
            .join(" , "),
        createdAt: message.created_at,
        })));
        return sortedMessage;
    };

    return {
        client,
        createThread,
        addMessageToThread,
        runThread,
        pollThreadRun,
        pollThreadRunWithId,
        runSteps,
        loadThreadMessages,
        getWeather,
        processUserPrompt,
        submitToolOutputs
    }
}

export default OpenAi;
