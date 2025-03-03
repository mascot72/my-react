import React from 'react';
import Card from '../molecules/Card';

const Layout: React.FC = () => {
  const handleButtonClick = () => {
    alert('Button clicked!');
  };

  return (
    <div>
      <Card
        title="Sample Card"
        content="This is a sample card."
        buttonText="Click Me"
        onButtonClick={handleButtonClick}
      />
    </div>
  );
};

export default Layout;
