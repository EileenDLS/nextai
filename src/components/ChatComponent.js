import React, { useState } from "react";
import axios from "axios";
import { Input } from "antd"; 

const { Search } = Input; // destructure

const DOMAIN = "http://localhost:5001"; // backend port

// the CSS for searchContainer
const searchContainer = {
  display: "flex",
  justifyContent: "center",
};

const ChatComponent = (props) => {
  const { handleResp, isLoading, setIsLoading } = props;
  // Define a state variable to keep track of the search value
  const [searchValue, setSearchValue] = useState("");

  const onSearch = async (question) => {
    // Clear the search input
    setSearchValue(""); //用户一点击search，输入内容那个格子就清空了
    setIsLoading(true);

    try {
      const response = await axios.get(`${DOMAIN}/chat`, {
        params: {
          question,
        },
      });
      handleResp(question, response.data);
    } catch (error) {
      console.error(`Error: ${error}`);
      handleResp(question, error);
    } finally {
      setIsLoading(false); // success or fail, the spanner都会停止转动
    }
  };

  const handleChange = (e) => {
    // Update searchValue state when the user types in the input box
    setSearchValue(e.target.value); //根据用户的输入实时变化显示，但是会有问题，比如输入字符又多又快的话，这个输入格子就会不停多次的re-render
  };

  return (
    <div style={searchContainer}>  
      <Search
        placeholder="send a message"
        enterButton="Send"
        size="large"
        onSearch={onSearch}
        loading={isLoading}
        value={searchValue} // Control the value
        onChange={handleChange} // Update the value when changed
      />
    </div>
  );
};

export default ChatComponent;
