import "../styles/Message.css";

function Message({ message, submessage }) {
    return (
        <div className="message-container" >
            <h1 className="message" >{message}</h1>
            <p className="submessage" >{submessage}</p>
        </div>
    );
};

export default Message;
