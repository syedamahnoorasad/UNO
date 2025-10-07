// import React from "react";
// import "./uno-cards.css";

// type UnoCardProps = {
//     key: number;
//     color: string;
//     value: string;
//     onClick: (index:number, color:string) => void;
//   };


// function UnoCard ({ key, color, value, onClick }: UnoCardProps) {
//     // const handleClick = () => {
//     //     onClick(key);
//     //   };

//   return (
//     <div className={`card num-${value} ${color}`} onClick={() => onClick(key, color)}>
//           <span className="inner">
//           <span className="mark">{value}</span>
//           </span>
//     </div>
//   );
// };

// export default UnoCard;

//   //             </div>
//   //             <div className="card num-6 yellow">
//   //               <span className="inner">
//   //                 <span className="mark">6</span>
//   //               </span>
//   //             </div>


import React from "react";
import "./uno-cards.css";

type UnoCardProps = {
  index: number;
  color: string | null;
  value: string;
  onClick?: (index: number) => void;
};

function UnoCard({ index, color, value, onClick }: UnoCardProps) {
  const displayColor = color ?? "wild";

  // Map special values to better labels
  let displayValue = value;
  if (value === "D2") displayValue = "+2";
  if (value === "D4") displayValue = "+4";
  if (value === "R") displayValue = "⟳";   // Reverse symbol
  if (value === "S") displayValue = "⛔";  // Skip symbol
  if (value === "WILD") displayValue = "W";

  return (
    <div
      className={`card num-${value} ${displayColor}`}
      onClick={() => onClick?.(index)}
    >
      <span className="inner">
        <span className="mark">{displayValue}</span>
      </span>
    </div>
  );
}

export default UnoCard;
