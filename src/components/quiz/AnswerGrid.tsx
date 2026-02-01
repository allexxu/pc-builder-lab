import AnswerButton from "./AnswerButton";

interface Answer {
  id: string;
  answer_text: string;
  order_num: number;
}

interface AnswerGridProps {
  answers: Answer[];
  selectedId?: string | null;
  correctId?: string | null;
  showResult?: boolean;
  disabled?: boolean;
  onSelect: (answerId: string) => void;
}

const AnswerGrid = ({
  answers,
  selectedId,
  correctId,
  showResult = false,
  disabled = false,
  onSelect,
}: AnswerGridProps) => {
  const sortedAnswers = [...answers].sort((a, b) => a.order_num - b.order_num);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mx-auto p-4">
      {sortedAnswers.map((answer, index) => (
        <AnswerButton
          key={answer.id}
          index={index}
          text={answer.answer_text}
          selected={selectedId === answer.id}
          correct={showResult ? answer.id === correctId : null}
          showResult={showResult}
          disabled={disabled || !!selectedId}
          onClick={() => onSelect(answer.id)}
        />
      ))}
    </div>
  );
};

export default AnswerGrid;
