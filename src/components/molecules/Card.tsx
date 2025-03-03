import React from 'react';
import Button from '../atoms/Button';

interface CardProps {
  title: string;
  content: string;
  buttonText: string;
  onButtonClick: () => void;
}

const Card: React.FC<CardProps> = ({
  title,
  content,
  buttonText,
  onButtonClick,
}) => {
  return (
    <div>
      <h2>{title}</h2>
      <p>{content}</p>
      <Button label={buttonText} onClick={onButtonClick} />
    </div>
  );
};

export default Card;
