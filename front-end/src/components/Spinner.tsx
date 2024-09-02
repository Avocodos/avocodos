import React from "react";

const Spinner: React.FC = () => {
  return (
    <div className="relative">
      {/* <div className="absolute inset-0 left-1/2 top-1/2 size-24 translate-x-[-50%] translate-y-[-50%] rounded-full bg-primary opacity-20 blur-[90px] dark:opacity-35" /> */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        version="1.1"
        id="Layer_1"
        x="0px"
        y="0px"
        xmlSpace="preserve"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={2}
        viewBox="115 299.5 850 480.1"
        className="mx-auto max-w-[300px] rounded-full py-8"
      >
        <style type="text/css">
          {`
            .st0 {
              display: none;
            }
            .st2 {
              display: none;
            }
            .st3 {
              display: inline;
            }
            .st4 {
              display: inline;
            }
            `}
        </style>
        <rect x="0" y="-0.8" className="st0" width="1080" height="1080" />
        <g className="[&>path]:[stroke-dasharray:40]">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            className="st1 animate-[move_30s_linear_infinite]"
            d="M312.5,422.4l45.3,82.7L206.1,779.2H115L312.5,422.4z M646.3,779.2h-91.1L380.6,463.8l-45.5-82.3l45.5-82.3   l0-0.1l45.6,82.3L646.3,779.2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            className="st1 animate-[move_30s_linear_infinite]"
            d="M676.5,573.3L631.2,656L433.7,299.2h91.1L676.5,573.3z M965,299.2L744.9,696.9l-45.6,82.3l0,0l-45.5-82.3   l45.6-82.3l174.5-315.4H965z"
          />
        </g>
        <g className="st2 [&>path]:[stroke-dasharray:40]">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            className="st3 animate-[move_30s_linear_infinite]"
            d="M163.1,512.4l10.4,19l-34.8,62.9h-20.9L163.1,512.4z M239.6,594.2h-20.9l-40-72.3L168.3,503l10.4-18.9l0,0   l10.5,18.9L239.6,594.2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            className="st3 animate-[move_30s_linear_infinite]"
            d="M246.6,547l-10.4,19l-45.3-81.8h20.9L246.6,547z M312.7,484.2l-50.5,91.2l-10.5,18.9l0,0l-10.4-18.9l10.4-18.9   l40-72.3H312.7z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            className="st4 animate-[move_30s_linear_infinite]"
            d="M354.2,484.4c30.3,0,54.9,24.6,54.9,54.9c0,30.3-24.6,54.9-54.9,54.9s-54.9-24.6-54.9-54.9   C299.3,509,323.9,484.4,354.2,484.4z M315.1,539.3c0,21.5,17.5,39.1,39.1,39.1s39.1-17.5,39.1-39.1c0-21.5-17.5-39.1-39.1-39.1   S315.1,517.8,315.1,539.3z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            className="st4 animate-[move_30s_linear_infinite]"
            d="M504.9,556.2h17c-7.2,22.1-27.9,38-52.3,38c-27.6,0-50.5-20.4-54.4-47c-0.4-2.6-0.6-5.3-0.6-8.1   c0-2.6,0.2-5.2,0.5-7.8c3.8-26.7,26.7-47.3,54.5-47.3c25.1,0,46.2,16.8,52.9,39.7h-16.8c-6-14-19.9-23.9-36.1-23.9   c-19,0-34.8,13.5-38.4,31.5c-0.5,2.5-0.8,5.1-0.8,7.8c0,2.8,0.3,5.5,0.8,8.1c3.7,17.8,19.5,31.1,38.4,31.1   C485.1,578.4,498.6,569.3,504.9,556.2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            className="st4 animate-[move_30s_linear_infinite]"
            d="M583.2,484.4c30.3,0,54.9,24.6,54.9,54.9c0,30.3-24.6,54.9-54.9,54.9c-30.3,0-54.9-24.6-54.9-54.9   C528.3,509,552.9,484.4,583.2,484.4z M544.1,539.3c0,21.5,17.5,39.1,39.1,39.1s39.1-17.5,39.1-39.1c0-21.5-17.5-39.1-39.1-39.1   S544.1,517.8,544.1,539.3z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            className="st4 animate-[move_30s_linear_infinite]"
            d="M745.9,539.6c0,2.7-0.2,5.4-0.6,8.1c-3.6,24.4-23.2,43.6-47.7,46.5h-50.4v-79.9H663v64.1h33.6   c16.3-2.4,29.4-14.8,32.7-30.7c0.5-2.6,0.8-5.3,0.8-8.1c0-2.7-0.3-5.2-0.8-7.8c-1.9-9.5-7.3-17.8-14.8-23.5   c-6.1-4.7-13.7-7.6-21.9-7.9h-45.4v-15.9h44.4l0,0c27.5,0.3,50.1,20.8,53.8,47.3C745.7,534.4,745.9,537,745.9,539.6z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            className="st4 animate-[move_30s_linear_infinite]"
            d="M806.7,484.4c30.3,0,54.9,24.6,54.9,54.9c0,30.3-24.6,54.9-54.9,54.9s-54.9-24.6-54.9-54.9   C751.8,509,776.4,484.4,806.7,484.4z M767.6,539.3c0,21.5,17.5,39.1,39.1,39.1s39.1-17.5,39.1-39.1c0-21.5-17.5-39.1-39.1-39.1   S767.6,517.8,767.6,539.3z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            className="st4 animate-[move_30s_linear_infinite]"
            d="M958.1,547.3c2.6,4.6,4.1,9.9,4.1,15.6c0,5.7-1.5,11-4.1,15.6c-5.4,9.4-15.6,15.8-27.3,15.8h-34.2   c-11.7,0-21.9-6.4-27.3-15.8c-2.5-4.4-4-9.4-4.1-14.8H881c0.5,8.2,7.3,14.8,15.6,14.8h34.2c8.6,0,15.6-7,15.6-15.6   c0-8.6-7-15.6-15.6-15.6h-34.2c-8.8,0-16.8-3.6-22.5-9.5c-1.8-1.9-3.4-4-4.8-6.3c-2.6-4.6-4.1-9.9-4.1-15.6c0-5.7,1.5-11,4.1-15.6   c5.4-9.4,15.6-15.8,27.3-15.8h33.3c0.3,0,0.5,0,0.8,0s0.5,0,0.8,0c11.3,0.3,21.2,6.6,26.5,15.8c0,0,0,0,0,0c2.5,4.4,4,9.4,4.1,14.7   h-15.8c-0.4-8-7-14.4-15-14.7h-34.7c-8.6,0-15.6,7-15.6,15.6c0,8.1,6.2,14.7,14,15.5c0.5,0,1.1,0,1.6,0c0.9,0,1.8,0,2.7,0.1h31.4   C942.5,531.5,952.7,537.8,958.1,547.3z"
          />
        </g>
      </svg>
    </div>
  );
};

export default Spinner;
