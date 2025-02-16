// useFetchChartData.js
import { useState, useEffect } from "react";
import axios from "axios";

export default function useFetchChartData(url) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const authToken = localStorage.getItem("authToken"); // Retrieve the token from localStorage

    if (authToken) {
      axios
        .get(url, {
          headers: {
            Authorization: `Bearer ${authToken}`, // Pass token in headers
          },
        })
        .then((response) => {
          setData(response.data); // Assuming the data contains an array of yearly data
          setLoading(false); // Set loading to false once data is fetched
        })
        .catch((error) => {
          setError("Error fetching chart data");
          setLoading(false);
        });
    } else {
      setError("No auth token found");
      setLoading(false);
    }
  }, [url]);

  return { data, loading, error };
}
