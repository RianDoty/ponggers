import React, { useCallback, useEffect } from "react";

const setInterval = window.setInterval;

function Ball() {
  return (
    <div className="ball"/>
  )
} 

function Table() {
  return (
    <div className="table">
      <Ball/>
    </div>
  )
}

export default Table;
