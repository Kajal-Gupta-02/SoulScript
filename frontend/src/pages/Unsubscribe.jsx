import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

export default function Unsubscribe() {
  const { token } = useParams();
  const [message, setMessage] = useState("Processing...");

  useEffect(() => {
    api
      .get(`/subscribers/unsubscribe/${token}`)
      .then(({ data }) => setMessage(data.message))
      .catch((err) => setMessage(err.response?.data?.error || "Something went wrong."));
  }, [token]);

  return (
    <div className="max-w-md mx-auto px-5 py-24 text-center">
      <p className="text-ink/70">{message}</p>
    </div>
  );
}