

import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Analytics.css";

function Analytics({leads}) {
  const [data, setData] = useState({ total: 0, contacted: 0, converted: 0 });

  useEffect(() => {
    axios.get("http://localhost:5000/api/leads/analytics", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    }).then(res => setData(res.data));
  }, [leads]);


  return (
    <div className="analytics-container">
      <div className="analytics-card total">
        <h3>Total Leads</h3>
        <p>{data.total}</p>
      </div>
      <div className="analytics-card contacted">
        <h3>Contacted</h3>
        <p>{data.contacted}</p> 
      </div>
      <div className="analytics-card converted">
        <h3>Converted</h3>
        <p>{data.converted}</p>
      </div>
    </div>
  );
}

export default Analytics;
