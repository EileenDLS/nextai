import React from "react";
import { Spin } from "antd";

// CSS for components
const containerStyle = {
  display: "flex",
  justifyContent: "space-between",
  flexDirection: "column",
  marginBottom: "20px",
};

const userContainer = {
  textAlign: "right",
};

const agentContainer = {
  textAlign: "left",
};

const userStyle = {
  maxWidth: "50%",
  textAlign: "left",
  backgroundColor: "#1677FF",
  color: "white",
  display: "inline-block",
  borderRadius: "10px",
  padding: "10px",
  marginBottom: "10px",
};

const agentStyle = {
  maxWidth: "50%",
  textAlign: "left",
  backgroundColor: "#F9F9FE",
  color: "black",
  display: "inline-block",
  borderRadius: "10px",
  padding: "10px",
  marginBottom: "10px",
};

const RenderQA = (props) => {
  // 从chatgpt返回的用户和chatgpt的对话内容  
  const { conversation, isLoading } = props;

  return (
    <>
      {/* this is called optional chaining, if conversation is null, not execute .map() */}
      {conversation?.map((each, index) => {
        return (
          <div key={index} style={containerStyle}>
            {/*user question */}
            <div style={userContainer}>
              <div style={userStyle}>{each.question}</div>
            </div>
            {/* agent answer  */}
            <div style={agentContainer}>
              <div style={agentStyle}>{each.answer}</div>
            </div>
          </div>
        );
      })}
      {isLoading && <Spin size="large" style={{ margin: "10px" }} />}
    </>
  );
};

export default RenderQA;