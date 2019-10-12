import React from "react";
import ReactTable from "react-table";

import "../../styles/reactTable.scss";

let id = 0;

export default function ReactTableWrapper(props) {
  const columns = props.columns.map(column => {
    id++;
    return {
      ...column,
      id,
      style: { ...column.style, ...props.style },
      Header: (
        <div className="reactTable--header">
          {column.Headers.map(element => (
            <div className="reactTable--header--child">{element || " "}</div>
          ))}
        </div>
      )
    };
  });

  return <ReactTable ref={props.forwardRef} data={props.data} columns={columns} />;
}
