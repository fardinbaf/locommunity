import React from 'react';

export default function Marquee({ text }) {
    return text ? <div className="marquee"><p>{text}</p></div> : null;
}
