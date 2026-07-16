import * as React from "react";

const Pin = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="26"
        height="24"
        fill="none"
        viewBox="0 0 26 24"
    >
        <g filter="url(#filter0_d_9_193)">
            <path fill="#b5b5b5" d="m4 18 9.5-14.5 7 8z"></path>
        </g>
        <g filter="url(#filter1_d_9_193)">
            <circle cx="16" cy="7.5" r="7.5" fill="#cccccc"></circle>
        </g>
        <defs>
            <filter
                id="filter0_d_9_193"
                width="24.5"
                height="22.5"
                x="0"
                y="1.5"
                colorInterpolationFilters="sRGB"
                filterUnits="userSpaceOnUse"
            >
                <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
                <feColorMatrix
                    in="SourceAlpha"
                    result="hardAlpha"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                ></feColorMatrix>
                <feOffset dy="2"></feOffset>
                <feGaussianBlur stdDeviation="2"></feGaussianBlur>
                <feComposite in2="hardAlpha" operator="out"></feComposite>
                <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0"></feColorMatrix>
                <feBlend
                    in2="BackgroundImageFix"
                    result="effect1_dropShadow_9_193"
                ></feBlend>
                <feBlend
                    in="SourceGraphic"
                    in2="effect1_dropShadow_9_193"
                    result="shape"
                ></feBlend>
            </filter>
            <filter
                id="filter1_d_9_193"
                width="19"
                height="19"
                x="6.5"
                y="0"
                colorInterpolationFilters="sRGB"
                filterUnits="userSpaceOnUse"
            >
                <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
                <feColorMatrix
                    in="SourceAlpha"
                    result="hardAlpha"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                ></feColorMatrix>
                <feOffset dy="2"></feOffset>
                <feGaussianBlur stdDeviation="1"></feGaussianBlur>
                <feComposite in2="hardAlpha" operator="out"></feComposite>
                <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"></feColorMatrix>
                <feBlend
                    in2="BackgroundImageFix"
                    result="effect1_dropShadow_9_193"
                ></feBlend>
                <feBlend
                    in="SourceGraphic"
                    in2="effect1_dropShadow_9_193"
                    result="shape"
                ></feBlend>
            </filter>
        </defs>
    </svg>
);

export default Pin;
