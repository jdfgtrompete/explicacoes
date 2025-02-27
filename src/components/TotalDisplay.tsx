
interface TotalDisplayProps {
  total: number;
}

export const TotalDisplay = ({ total }: TotalDisplayProps) => {
  return (
    <div className="border-t border-indigo-100 bg-indigo-50 p-4">
      <div className="flex justify-end items-center">
        <span className="text-lg font-medium text-indigo-900">
          Total do Mês: {total.toFixed(2)}€
        </span>
      </div>
    </div>
  );
};
