import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function Quiz() {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/quiz/${quizId}`)
      .then((res) => setQuiz(res.data))
      .catch((err) => console.error("Error fetching quiz", err));
  }, [quizId]);

  const handleAnswerChange = (questionIndex, selectedOption) => {
    setAnswers({ ...answers, [questionIndex]: selectedOption });
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    quiz.forEach((q, index) => {
      if (answers[index] === q.answer) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
  };

  return (
    <div className="quiz-container">
      <h1>Quiz</h1>
      {quiz ? (
        <div>
          {quiz.map((q, index) => (
            <div key={index} className="question-box">
              <h3>{q.question}</h3>
              {q.options.map((option, i) => (
                <p key={i}>
                  <input
                    type="radio"
                    name={`q${index}`}
                    value={option}
                    onChange={() => handleAnswerChange(index, option)}
                  />
                  {option}
                </p>
              ))}
            </div>
          ))}
          <button onClick={calculateScore}>Submit</button>
          {score !== null && <p>Your Score: {score} / {quiz.length}</p>}
        </div>
      ) : (
        <p>Loading quiz...</p>
      )}
    </div>
  );
}

export default Quiz;
