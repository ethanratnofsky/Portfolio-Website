import React from 'react';

import '../styles/Message.css';

const Message = ({ message, submessage }) => {
    return (
        <div className='message-container'>
            <h1 className='message'>{message}</h1>
            <p className='submessage'>{submessage}</p>
        </div>
    );
};

export default Message;
