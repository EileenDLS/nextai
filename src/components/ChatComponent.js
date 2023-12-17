import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Input } from "antd";
import { AudioOutlined } from "@ant-design/icons";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import Speech from "speak-tts";

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
  const [isChatModeOn, setIsChatModeOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speech, setSpeech] = useState(); // store voice question in here, 与search那个分开，也可以合并让对话内容显示在search里面，然后点击ask发送

  // 对recording进行初始，transcript就是record进去的语音转成的文本
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  // 对speech进行初始，即agent如何response question
  useEffect(() => {
    const speech = new Speech();
    speech
      .init({
        volume: 1,
        lang: "en-US",
        rate: 1,
        pitch: 1,
        voice: "Google US English",
        splitSentences: true,
      })
      .then((data) => {
        // The "data" object contains the list of available voices and the voice synthesis params
        console.log("Speech is ready, voices are available", data);
        setSpeech(speech);
      })
      .catch((e) => {
        console.error("An error occured while initializing : ", e);
      });
  }, []);

  useEffect(() => {
    if (!listening && !!transcript) {
      //不再监听时，且transcript有值（双重否定为肯定，因为transcript是一个string, 加!!可以让其变为boolean值，其实直接用它也可以，但不推荐）
      (async () => await onSearch(transcript))(); //IIFE: 不存储transcript,立马使用它
      setIsRecording(false); //不监听了，所以recording停止
    }
  }, [listening, transcript]);

  const talk = (what2say) => {
    speech
      .speak({
        text: what2say,
        queue: false, // current speech will be interrupted,
        listeners: {
          onstart: () => {
            console.log("Start utterance");
          },
          onend: () => {
            console.log("End utterance");
          },
          onresume: () => {
            console.log("Resume utterance");
          },
          onboundary: (event) => {
            console.log(
              event.name +
                " boundary reached after " +
                event.elapsedTime +
                " milliseconds."
            );
          },
        },
      })
      .then(() => {
        // if everyting went well, start listening again
        console.log("Success !");
        userStartConvo();  // agent给完答案后，会继续听user讲话
      })
      .catch((e) => {
        console.error("An error occurred :", e);
      });
  };

  const userStartConvo = () => {
    SpeechRecognition.startListening();
    setIsRecording(true); // 开始继续record
    resetEverything(); 
  };

  const resetEverything = () => {  //清空transcript
    resetTranscript();
  };

  const chatModeClickHandler = () => {
    setIsChatModeOn(!isChatModeOn);
    setIsRecording(false);
    SpeechRecognition.stopListening();
  };

  const recordingClickHandler = () => {
    if (isRecording) {
      setIsRecording(false); //如果正在record，点击record button停止record
      SpeechRecognition.stopListening();
    } else {
      setIsRecording(true); //如果没有record，点击record button开始record
      SpeechRecognition.startListening();
    }
  };

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
      if (isChatModeOn) { //如果chatMode是on（开启）模式
        talk(response.data); // 要说出答案（off的话，就不用读）
      }
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

  // function toggle() {
  //   setIsChatModeOn((isOpen) => !isOpen);
  //   setIsRecording((isRecording) => !isRecording);
  // }

  // if (!browserSupportsSpeechRecognition) {
  //   return <span>Browser doesn't support speech recognition.</span>;
  // }

  return (
    <div style={searchContainer}>
      {/* chatmode是off时，才显示search栏 */}
      {!isChatModeOn && (
        <Search
          placeholder="send a message"
          enterButton="Send"
          size="large"
          onSearch={onSearch}
          loading={isLoading}
          value={searchValue} // Control the value
          onChange={handleChange} // Update the value when changed
        />
      )}

      <Button
        type="primary"
        size="large"
        danger={isChatModeOn}
        onClick={chatModeClickHandler}
        style={{ marginLeft: "5px" }}
      >
        Chat Mode: {isChatModeOn ? "On" : "Off"}
      </Button>

      {isChatModeOn && (
        <Button
          type="primary"
          icon={<AudioOutlined />}
          size="large"
          danger={isRecording}
          onClick={recordingClickHandler}
          style={{ marginLeft: "5px" }}
        >
          {isRecording ? "I'm listening..." : "Click to chat"}
        </Button>
      )}
      
    </div>
  );
};

export default ChatComponent;
