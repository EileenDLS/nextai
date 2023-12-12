import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"; 
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";

import { PDFLoader } from "langchain/document_loaders/fs/pdf"; // upload file type is pdf

// NOTE: change this default filePath to any of your default file name
const chat = async (filePath = "./uploads/Wumpus.pdf", query) => {
  // step 1:
  const loader = new PDFLoader(filePath);

  const data = await loader.load();

  // step 2:
  const textSplitter = new RecursiveCharacterTextSplitter({
    // too much: accurancy low; too less: efficency low
    chunkSize: 500,
    // 切片之间的重合度，决定了token之间的连续性，这里的个数是指重复的token的个数
    chunkOverlap: 0,
  });
  // splitting
  const splitDocs = await textSplitter.splitDocuments(data);

  // step 3
  // transfer text to vector 
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.REACT_APP_OPENAI_API_KEY,
  });
  // store to vectorStore
  const vectorStore = await MemoryVectorStore.fromDocuments(
    splitDocs,
    embeddings
  );
  // step 4: retrieval

  // const relevantDocs = await vectorStore.similaritySearch(
  // "What is task decomposition?"
  // );

  // step 5: qa w/ customize the prompt
  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    openAIApiKey: process.env.REACT_APP_OPENAI_API_KEY,
  });

  // interact with OpanAI (natrual language interaction)
  const template = `Use the following pieces of context to answer the question at the end.
    If you don't know the answer, just say that you cannot answer this question, don't try to make up an answer.
    Use three sentences maximum and keep the answer as concise as possible.
    
    {context}
    Question: {question}
    Helpful Answer:`;

  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
    prompt: PromptTemplate.fromTemplate(template),
    // returnSourceDocuments: true,
  });

  const response = await chain.call({
    query,
  });

  return response;
};

export default chat;
