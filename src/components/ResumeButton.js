import React from 'react';

import '../styles/ResumeButton.css'

import ResumePDF from "../docs/EthanRatnofskyResume.pdf";

export default function ResumeButton() {
    return (
        <div className="resume-button" >
            <a href={ResumePDF} target="_blank" rel="noreferrer" >Resume</a>
        </div>
    )
}