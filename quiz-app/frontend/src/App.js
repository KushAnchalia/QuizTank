import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function App() {
  const [topic, setTopic] = useState("");
  const [quizId, setQuizId] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const generateQuiz = async () => {
    try {
      const response = await axios.post("http://localhost:5000/create-quiz", { topic });
      if (response.data.success) {
        setQuizId(response.data.quizId);
        setError(null);
      } else {
        setError("Failed to generate quiz. Please try again.");
      }
    } catch (error) {
      console.error("Error generating quiz", error);
      setError("Internal Server Error");
    }
  };

  return (
    <div className="container">
      <h1>Quiz Generator</h1>
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter quiz topic"
      />
      <button onClick={generateQuiz}>Generate Quiz</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {quizId && (
        <p>Quiz created! <a href={`/quiz/${quizId}`}>Click here to attempt</a></p>
      )}
    </div>
  );
}

export default App;
