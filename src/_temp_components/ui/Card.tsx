interface CardProps {
  title: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
      <h3 className="text-lg font-bold text-primary mb-2">{title}</h3>
      <div className="text-sm text-gray-700 dark:text-gray-200">{children}</div>
    </div>
  );
};

export default Card;
